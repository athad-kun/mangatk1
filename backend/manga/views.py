"""
Django REST Framework Views for Manga API
Provides API endpoints for manga, chapters, genres, and categories
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Genre, Category, Manga, Chapter, ChapterImage
from .serializers import (
    GenreSerializer, CategorySerializer,
    MangaListSerializer, MangaDetailSerializer, MangaCreateSerializer,
    ChapterSerializer, ChapterDetailSerializer, ChapterCreateSerializer
)


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for genres
    GET /api/genres/ - List all genres
    GET /api/genres/{id}/ - Get genre details
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    lookup_field = 'slug'


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for categories
    GET /api/categories/ - List all categories
    GET /api/categories/{slug}/ - Get category details
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class MangaViewSet(viewsets.ModelViewSet):
    """
    API endpoint for manga
    GET /api/manga/ - List all manga with filtering
    GET /api/manga/{id}/ - Get manga details with chapters
    POST /api/manga/ - Create new manga
    PUT /api/manga/{id}/ - Update manga
    DELETE /api/manga/{id}/ - Delete manga
    
    Filters:
    - ?search=query - Search in title, author, description
    - ?category=slug  - Filter by category slug
    - ?genre=name - Filter by genre name
    - ?status=ongoing|completed - Filter by status
    - ?ordering=title|-title|avg_rating|-avg_rating|views|-views
    """
    queryset = Manga.objects.all().prefetch_related('genres', 'category', 'chapters')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description', 'genres__name']
    # Removed computed fields (avg_rating, last_updated) from DB ordering
    ordering_fields = ['title', 'views', 'updated_at', 'created_at']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MangaListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MangaCreateSerializer
        return MangaDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by genre
        genre = self.request.query_params.get('genre', None)
        if genre:
            queryset = queryset.filter(genres__name__icontains=genre)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by min_rating removed as it requires aggregation
        
        return queryset.distinct()
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """
        Get all chapters for a specific manga
        GET /api/manga/{id}/chapters/
        """
        manga = self.get_object()
        chapters = manga.chapters.all().order_by('number')
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured manga (highest views)
        GET /api/manga/featured/
        """
        # Changed to sort by views as avg_rating is computed
        featured = self.get_queryset().order_by('-views')[:5]
        serializer = MangaListSerializer(featured, many=True)
        return Response(serializer.data)


class ChapterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for chapters
    GET /api/chapters/ - List all chapters
    GET /api/chapters/{id}/ - Get chapter details with images
    POST /api/chapters/ - Create new chapter
    PUT /api/chapters/{id}/ - Update chapter
    DELETE /api/chapters/{id}/ - Delete chapter
    POST /api/chapters/upload/ - Upload chapter from ZIP/CBZ
    """
    queryset = Chapter.objects.all().select_related('manga').prefetch_related('images')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ChapterCreateSerializer
        elif self.action == 'retrieve':
            return ChapterDetailSerializer
        return ChapterSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by manga
        manga_id = self.request.query_params.get('manga', None)
        if manga_id:
            queryset = queryset.filter(manga_id=manga_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """
        Increment manga views when chapter is read
        POST /api/chapters/{id}/increment_views/
        """
        chapter = self.get_object()
        chapter.manga.views += 1
        chapter.manga.save()
        return Response({'views': chapter.manga.views})
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload chapter from ZIP/CBZ file
        POST /api/chapters/upload/
        """
        import zipfile
        import os
        import re
        from django.conf import settings
        from django.utils.text import slugify
        
        manga_id = request.data.get('manga')
        number = request.data.get('number')
        title = request.data.get('title', '')
        uploaded_file = request.FILES.get('file')
        
        if not all([manga_id, number, uploaded_file]):
            return Response({'error': 'manga, number, and file are required'}, status=400)
        
        try:
            manga = Manga.objects.get(id=manga_id)
        except Manga.DoesNotExist:
            return Response({'error': 'Manga not found'}, status=404)
        
        # Create chapter
        chapter, created = Chapter.objects.get_or_create(
            manga=manga,
            number=float(number),
            defaults={'title': title or f'{manga.title} - الفصل {number}'}
        )
        
        if not created:
            # Clear existing images if re-uploading
            chapter.images.all().delete()
            chapter.title = title or chapter.title
            chapter.save()
        
        # Setup upload directory
        manga_slug = slugify(manga.title, allow_unicode=True) or str(manga.id)[:8]
        chapter_folder = str(int(float(number)))
        upload_dir = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'uploads', manga_slug, chapter_folder)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Extract ZIP/CBZ
        image_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
        images_created = 0
        
        try:
            with zipfile.ZipFile(uploaded_file, 'r') as zip_file:
                # Get list of image files, sorted
                image_files = sorted([
                    f for f in zip_file.namelist()
                    if f.lower().endswith(image_extensions) and not f.startswith('__MACOSX')
                ])
                
                for page_num, filename in enumerate(image_files, 1):
                    # Extract file
                    file_data = zip_file.read(filename)
                    
                    # Create new filename
                    ext = os.path.splitext(filename)[1].lower()
                    new_filename = f'{str(int(float(number))).zfill(3)}__{str(page_num).zfill(3)}{ext}'
                    file_path = os.path.join(upload_dir, new_filename)
                    
                    # Save file
                    with open(file_path, 'wb') as f:
                        f.write(file_data)
                    
                    # Create ChapterImage record
                    image_url = f'/uploads/{manga_slug}/{chapter_folder}/{new_filename}'
                    ChapterImage.objects.create(
                        chapter=chapter,
                        page_number=page_num,
                        image_url=image_url,
                        original_filename=os.path.basename(filename)
                    )
                    images_created += 1
                    
        except zipfile.BadZipFile:
            return Response({'error': 'Invalid ZIP/CBZ file'}, status=400)
        
        return Response({
            'success': True,
            'chapter_id': str(chapter.id),
            'images_count': images_created,
            'message': f'تم رفع {images_created} صورة بنجاح'
        })


# ==================== USER INTERACTION VIEWSETS ====================
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import UserBookmark, Rating, Comment, CommentLike, Achievement, UserAchievement, ReadingHistory
from .serializers import (
    BookmarkSerializer, RatingSerializer, CommentSerializer, 
    CommentLikeSerializer, AchievementSerializer, UserAchievementSerializer
)


class ReadingHistoryViewSet(viewsets.ViewSet):
    """
    API endpoint for tracking reading history
    POST /api/reading-history/ - Record chapter read
    """
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """Record a chapter read"""
        chapter_id = request.data.get('chapter_id')
        manga_id = request.data.get('manga_id')
        
        if not chapter_id:
            return Response({'error': 'chapter_id مطلوب'}, status=400)
        
        # Create or update reading history
        from .models import Chapter, Manga
        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'الفصل غير موجود'}, status=404)
        
        history, created = ReadingHistory.objects.get_or_create(
            user=request.user,
            chapter=chapter,
            defaults={'manga': chapter.manga}
        )
        
        if created:
            # Update user stats
            request.user.chapters_read += 1
            request.user.save()
        
        return Response({
            'success': True,
            'created': created,
            'total_chapters_read': request.user.chapters_read
        })
    
    def list(self, request):
        """Get user's reading history"""
        history = ReadingHistory.objects.filter(user=request.user).order_by('-read_at')[:20]
        data = [{
            'chapter_id': str(h.chapter.id),
            'manga_id': str(h.manga.id) if h.manga else None,
            'manga_title': h.manga.title if h.manga else '',
            'chapter_number': float(h.chapter.number),
            'read_at': h.read_at.isoformat(),
        } for h in history]
        return Response(data)


class BookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user bookmarks (favorites)
    GET /api/bookmarks/ - List user's bookmarks
    POST /api/bookmarks/ - Add manga to bookmarks
    DELETE /api/bookmarks/{id}/ - Remove from bookmarks
    """
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBookmark.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle bookmark status for a manga"""
        manga_id = request.data.get('manga_id')
        if not manga_id:
            return Response({'error': 'manga_id is required'}, status=400)
        
        try:
            bookmark = UserBookmark.objects.get(user=request.user, manga_id=manga_id)
            bookmark.delete()
            return Response({'bookmarked': False, 'message': 'تم إزالة المانجا من المفضلة'})
        except UserBookmark.DoesNotExist:
            UserBookmark.objects.create(user=request.user, manga_id=manga_id)
            return Response({'bookmarked': True, 'message': 'تم إضافة المانجا للمفضلة'})
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if manga is bookmarked"""
        manga_id = request.query_params.get('manga_id')
        if not manga_id:
            return Response({'error': 'manga_id is required'}, status=400)
        
        is_bookmarked = UserBookmark.objects.filter(
            user=request.user, manga_id=manga_id
        ).exists()
        return Response({'bookmarked': is_bookmarked})


class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for chapter ratings
    POST /api/ratings/ - Rate a chapter
    GET /api/ratings/my-rating/?chapter={id} - Get user's rating for chapter
    """
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Update existing rating or create new one
        chapter = serializer.validated_data['chapter']
        rating_value = serializer.validated_data['rating']
        
        rating, created = Rating.objects.update_or_create(
            user=self.request.user,
            chapter=chapter,
            defaults={'rating': rating_value}
        )
        return rating
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating = self.perform_create(serializer)
        return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_rating(self, request):
        """Get user's rating for a specific chapter"""
        chapter_id = request.query_params.get('chapter')
        if not chapter_id:
            return Response({'error': 'chapter is required'}, status=400)
        
        try:
            rating = Rating.objects.get(user=request.user, chapter_id=chapter_id)
            return Response({'rating': float(rating.rating)})
        except Rating.DoesNotExist:
            return Response({'rating': None})


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for comments
    GET /api/comments/?manga={id} - Get comments for manga
    GET /api/comments/?chapter={id} - Get comments for chapter
    POST /api/comments/ - Add comment
    DELETE /api/comments/{id}/ - Delete comment
    POST /api/comments/{id}/like/ - Like a comment
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Comment.objects.filter(is_deleted=False, parent=None)
        
        manga_id = self.request.query_params.get('manga')
        chapter_id = self.request.query_params.get('chapter')
        
        if manga_id:
            queryset = queryset.filter(manga_id=manga_id, comment_type='manga')
        elif chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id, comment_type='chapter')
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user and not request.user.is_staff:
            return Response({'error': 'لا يمكنك حذف هذا التعليق'}, status=403)
        comment.is_deleted = True
        comment.save()
        return Response({'message': 'تم حذف التعليق'})
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Toggle like on comment"""
        comment = self.get_object()
        like, created = CommentLike.objects.get_or_create(
            user=request.user, comment=comment
        )
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': comment.likes_count})
        return Response({'liked': True, 'likes_count': comment.likes_count})


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for achievements
    GET /api/achievements/ - List all achievements
    GET /api/achievements/my/ - Get user's unlocked achievements
    POST /api/achievements/check/ - Check and unlock new achievements
    """
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        """Get user's unlocked achievements"""
        user_achievements = UserAchievement.objects.filter(
            user=request.user, is_completed=True
        ).select_related('achievement')
        serializer = UserAchievementSerializer(user_achievements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def check(self, request):
        """Check and unlock new achievements based on user stats"""
        user = request.user
        
        # Calculate user stats
        reading_count = ReadingHistory.objects.filter(user=user).count()
        bookmark_count = UserBookmark.objects.filter(user=user).count()
        comment_count = Comment.objects.filter(user=user, is_deleted=False).count()
        reading_time = user.total_reading_time  # in seconds
        
        stats = {
            'reading': reading_count,
            'collection': bookmark_count,
            'social': comment_count,
            'time': reading_time,
        }
        
        # Get all active achievements
        achievements = Achievement.objects.filter(is_active=True)
        newly_unlocked = []
        
        for achievement in achievements:
            # Check if already unlocked
            if UserAchievement.objects.filter(user=user, achievement=achievement, is_completed=True).exists():
                continue
            
            # Check if requirement met
            category = achievement.category
            threshold = achievement.requirement_value
            current_value = stats.get(category, 0)
            
            # Special handling for secret achievements
            if category == 'secret' and achievement.requirement_type == 'night_reading':
                from datetime import datetime
                hour = datetime.now().hour
                if hour >= 3 and hour < 5 and reading_count > 0:
                    current_value = 1
                else:
                    current_value = 0
            
            if current_value >= threshold:
                # Unlock achievement
                user_achievement, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement,
                    defaults={'is_completed': True, 'progress': threshold}
                )
                if created:
                    newly_unlocked.append({
                        'id': str(achievement.id),
                        'name': achievement.name,
                        'name_ar': achievement.name_ar,
                        'description': achievement.description,
                        'reward_points': achievement.reward_points
                    })
                    # Award points
                    user.points += achievement.reward_points
                    user.save()
        
        return Response({
            'newly_unlocked': newly_unlocked,
            'stats': stats
        })
