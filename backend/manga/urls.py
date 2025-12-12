"""
URL Configuration for Manga API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'genres', views.GenreViewSet, basename='genre')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'manga', views.MangaViewSet, basename='manga')
router.register(r'chapters', views.ChapterViewSet, basename='chapter')

# User interaction endpoints
router.register(r'bookmarks', views.BookmarkViewSet, basename='bookmark')
router.register(r'ratings', views.RatingViewSet, basename='rating')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'achievements', views.AchievementViewSet, basename='achievement')
router.register(r'reading-history', views.ReadingHistoryViewSet, basename='reading-history')

app_name = 'manga'

urlpatterns = [
    path('', include(router.urls)),
    # Auth endpoints (JWT)
    path('auth/login/', auth_views.login_view, name='auth-login'),
    path('auth/register/', auth_views.register_view, name='auth-register'),
    path('auth/refresh/', auth_views.refresh_token_view, name='auth-refresh'),
    path('auth/profile/', auth_views.profile_view, name='auth-profile'),
]
