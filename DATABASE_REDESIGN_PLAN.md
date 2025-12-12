# خطة تحديث قاعدة البيانات - المرحلة 3

## 📋 التحليل والتوصيات

### ✅ الجداول الرئيسية المؤكدة

#### 1. **Manga** (تحديث)
#### 2. **Genre** (موجود)
#### 3. **Category** (موجود)
#### 4. **Chapter** (تحديث)
#### 5. **ChapterImage** (موجود)
#### 6. **User** (جديد) ⭐

---

### 🤔 التوصيات: جدول منفصل أم عمود؟

| العنصر | التوصية | السبب |
|--------|----------|-------|
| **التعليقات** | ✅ جدول منفصل `Comment` | كل مانجا/فصل يمكن أن يكون له تعليقات متعددة |
| **المفضلات** | ✅ جدول منفصل `UserBookmark` | علاقة Many-to-Many بين User و Manga |
| **الإنجازات** | ✅ جدولين: `Achievement` + `UserAchievement` | نظام إنجازات كامل |
| **التقييمات** | ✅ جدول منفصل `Rating` | تتبع تقييم كل مستخدم لكل فصل |
| **سجل القراءة** | ✅ جدول منفصل `ReadingHistory` | تتبع آخر قراءة لكل مستخدم |

---

## 📊 الهيكل الكامل المقترح

### الجداول (13 جدول):

#### 🔵 المجموعة 1: المحتوى الأساسي
1. **Genre** - الأنواع (موجود)
2. **Category** - التصنيفات (موجود)
3. **Manga** - المانجا (تحديث) ⚠️
4. **Chapter** - الفصول (تحديث) ⚠️
5. **ChapterImage** - صور الفصول (موجود)

#### 🟢 المجموعة 2: المستخدمين
6. **User** - المستخدمين (جديد) ⭐
7. **UserBookmark** - المفضلات (جديد) ⭐
8. **ReadingHistory** - سجل القراءة (جديد) ⭐
9. **Rating** - التقييمات (جديد) ⭐

#### 🟡 المجموعة 3: التفاعل الاجتماعي
10. **Comment** - التعليقات (جديد) ⭐
11. **CommentLike** - إعجابات التعليقات (جديد) ⭐

#### 🟣 المجموعة 4: الإنجازات
12. **Achievement** - الإنجازات (جديد) ⭐
13. **UserAchievement** - إنجازات المستخدمين (جديد) ⭐

---

## 📝 تفاصيل الجداول

### 1. Manga (تحديث)

```python
class Manga(models.Model):
    # الحقول الأساسية
    id = UUIDField(primary_key=True)
    title = CharField(max_length=300)
    sub_titles = TextField(blank=True)  # 🆕 أسماء بديلة مفصولة بـ ;
    slug = SlugField(unique=True)
    description = TextField()
    author = CharField(max_length=200)
    
    # الصور
    cover_image_url = URLField(max_length=500)  # صورة الغلاف
    
    # الحالة والإحصائيات
    status = CharField(choices=['ongoing', 'completed'])
    views = PositiveIntegerField(default=0)
    
    # العلاقات
    genres = ManyToManyField(Genre)  # متعدد
    category = ForeignKey(Category, null=True)  # واحد فقط
    
    # التواريخ
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    # Properties محسوبة
    @property
    def chapter_count(self):
        """يُحسب من آخر فصل"""
        last_chapter = self.chapters.order_by('-number').first()
        return last_chapter.number if last_chapter else 0
    
    @property
    def avg_rating(self):
        """متوسط تقييمات جميع الفصول"""
        from django.db.models import Avg
        result = self.chapters.aggregate(Avg('avg_rating'))
        return result['avg_rating__avg'] or 3.0
    
    @property
    def last_updated(self):
        """تاريخ آخر فصل"""
        last_chapter = self.chapters.order_by('-release_date').first()
        return last_chapter.release_date if last_chapter else self.created_at.date()
```

**التغييرات**:
- ✅ إضافة `sub_titles` للأسماء البديلة
- ✅ `chapter_count` محسوب من آخر رقم فصل
- ✅ `avg_rating` محسوب من متوسط تقييمات الفصول
- ✅ `last_updated` محسوب من تاريخ آخر فصل
- ✅ `views` يُحدث عند كل زيارة

---

### 2. Chapter (تحديث)

```python
class Chapter(models.Model):
    id = UUIDField(primary_key=True)
    manga = ForeignKey(Manga, on_delete=CASCADE)
    
    number = PositiveIntegerField()  # يُحسب تلقائياً أو يدوياً
    title = CharField(max_length=300, blank=True)  # اختياري
    
    release_date = DateField(auto_now_add=True)  # تلقائي (يمكن تعديله)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['manga', 'number']
        ordering = ['manga', 'number']
    
    def save(self, *args, **kwargs):
        # حساب رقم الفصل تلقائياً
        if not self.number:
            last_chapter = self.manga.chapters.order_by('-number').first()
            self.number = (last_chapter.number + 1) if last_chapter else 1
        
        # عنوان افتراضي
        if not self.title:
            self.title = f"الفصل {self.number}"
        
        super().save(*args, **kwargs)
    
    @property
    def image_count(self):
        """عدد الصور"""
        return self.images.count()
    
    @property
    def avg_rating(self):
        """متوسط تقييمات المستخدمين (افتراضي 3.0)"""
        from django.db.models import Avg
        result = self.ratings.aggregate(Avg('rating'))
        return result['rating__avg'] or 3.0
```

**التغييرات**:
- ✅ `number` يُحسب تلقائياً من آخر فصل
- ✅ `title` افتراضي "الفصل X"
- ✅ `release_date` تلقائي (قابل للتعديل)
- ✅ `avg_rating` محسوب من جدول Ratings
- ✅ `image_count` محسوب من ChapterImages

---

### 3. User (جديد) ⭐

```python
class User(AbstractUser):
    """نموذج المستخدم المخصص"""
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    
    # البيانات الأساسية (ترث من AbstractUser)
    # username, email, password, first_name, last_name
    
    # بيانات إضافية
    avatar_url = URLField(max_length=500, blank=True)
    bio = TextField(max_length=500, blank=True)
    
    # الإحصائيات
    total_reading_time = PositiveIntegerField(default=0)  # بالدقائق
    chapters_read = PositiveIntegerField(default=0)
    
    # الإعدادات
    is_premium = BooleanField(default=False)
    theme_preference = CharField(max_length=20, default='auto')  # light/dark/auto
    
    # التواريخ
    date_joined = DateTimeField(auto_now_add=True)
    last_login = DateTimeField(null=True, blank=True)
    
    @property
    def achievement_count(self):
        """عدد الإنجازات"""
        return self.achievements.count()
    
    @property
    def bookmark_count(self):
        """عدد المفضلات"""
        return self.bookmarks.count()
```

**ملاحظة**: يُفضل استخدام `AbstractUser` من Django بدلاً من إنشاء نموذج من الصفر.

---

### 4. UserBookmark (جديد) ⭐

```python
class UserBookmark(models.Model):
    """المفضلات - Many-to-Many بين User و Manga"""
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='bookmarks')
    manga = ForeignKey(Manga, on_delete=CASCADE, related_name='bookmarked_by')
    
    added_at = DateTimeField(auto_now_add=True)
    
    # ترتيب مخصص (اختياري)
    order = PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'manga']
        ordering = ['user', '-added_at']
    
    def __str__(self):
        return f"{self.user.username} → {self.manga.title}"
```

---

### 5. ReadingHistory (جديد) ⭐

```python
class ReadingHistory(models.Model):
    """سجل القراءة - آخر ما قرأه المستخدم"""
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='reading_history')
    manga = ForeignKey(Manga, on_delete=CASCADE)
    chapter = ForeignKey(Chapter, on_delete=CASCADE)
    
    # آخر صفحة قرأها
    last_page = PositiveIntegerField(default=1)
    
    # التقدم
    progress_percentage = DecimalField(max_digits=5, decimal_places=2, default=0)  # 0-100
    
    # التواريخ
    first_read = DateTimeField(auto_now_add=True)
    last_read = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'manga', 'chapter']
        ordering = ['user', '-last_read']
        verbose_name_plural = 'Reading Histories'
    
    def __str__(self):
        return f"{self.user.username} → {self.manga.title} Ch.{self.chapter.number}"
```

---

### 6. Rating (جديد) ⭐

```python
class Rating(models.Model):
    """تقييمات المستخدمين للفصول"""
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='ratings')
    chapter = ForeignKey(Chapter, on_delete=CASCADE, related_name='ratings')
    
    rating = DecimalField(
        max_digits=2, 
        decimal_places=1,
        validators=[MinValueValidator(0.5), MaxValueValidator(5.0)]
    )  # 0.5 - 5.0
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'chapter']  # مستخدم واحد تقييم واحد لكل فصل
        ordering = ['chapter', '-rating']
    
    def __str__(self):
        return f"{self.user.username} → {self.chapter} = {self.rating}⭐"
```

---

### 7. Comment (جديد) ⭐

```python
class Comment(models.Model):
    """التعليقات على المانجا والفصول"""
    COMMENT_TYPE_CHOICES = [
        ('manga', 'Manga Comment'),
        ('chapter', 'Chapter Comment'),
    ]
    
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='comments')
    
    # يمكن التعليق على المانجا أو الفصل
    comment_type = CharField(max_length=10, choices=COMMENT_TYPE_CHOICES)
    manga = ForeignKey(Manga, on_delete=CASCADE, null=True, blank=True, related_name='comments')
    chapter = ForeignKey(Chapter, on_delete=CASCADE, null=True, blank=True, related_name='comments')
    
    content = TextField(max_length=1000)
    
    # التعليقات المتداخلة (الردود)
    parent = ForeignKey('self', on_delete=CASCADE, null=True, blank=True, related_name='replies')
    
    # الإحصائيات
    likes_count = PositiveIntegerField(default=0)
    
    # الحالة
    is_edited = BooleanField(default=False)
    is_deleted = BooleanField(default=False)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."
```

---

### 8. CommentLike (جديد) ⭐

```python
class CommentLike(models.Model):
    """إعجابات التعليقات"""
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='comment_likes')
    comment = ForeignKey(Comment, on_delete=CASCADE, related_name='likes')
    
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'comment']
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # تحديث عداد الإعجابات
        self.comment.likes_count = self.comment.likes.count()
        self.comment.save()
    
    def delete(self, *args, **kwargs):
        comment = self.comment
        super().delete(*args, **kwargs)
        comment.likes_count = comment.likes.count()
        comment.save()
```

---

### 9. Achievement (جديد) ⭐

```python
class Achievement(models.Model):
    """الإنجازات المتاحة في النظام"""
    id = UUIDField(primary_key=True)
    
    name = CharField(max_length=100, unique=True)
    name_ar = CharField(max_length=100)  # الاسم بالعربية
    description = TextField()
    description_ar = TextField()
    
    icon_url = URLField(max_length=500, blank=True)
    
    # نوع الإنجاز
    category = CharField(max_length=50)  # reading, rating, commenting, etc.
    
    # شروط الحصول عليه
    requirement_type = CharField(max_length=50)  # chapters_read, manga_completed, etc.
    requirement_value = PositiveIntegerField()  # العدد المطلوب
    
    # المكافأة (اختياري)
    reward_points = PositiveIntegerField(default=0)
    
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.name_ar})"
```

**أمثلة للإنجازات**:
- قارئ مبتدئ: قراءة 10 فصول
- قارئ محترف: قراءة 100 فصل
- ناقد: كتابة 50 تعليق
- محب المانجا: إضافة 20 مانجا للمفضلة

---

### 10. UserAchievement (جديد) ⭐

```python
class UserAchievement(models.Model):
    """إنجازات المستخدمين - Many-to-Many"""
    id = UUIDField(primary_key=True)
    user = ForeignKey(User, on_delete=CASCADE, related_name='achievements')
    achievement = ForeignKey(Achievement, on_delete=CASCADE, related_name='users')
    
    earned_at = DateTimeField(auto_now_add=True)
    
    # حالة الإنجاز
    progress = PositiveIntegerField(default=0)  # التقدم الحالي
    is_completed = BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['user', '-earned_at']
    
    def __str__(self):
        return f"{self.user.username} → {self.achievement.name}"
```

---

## 🔗 مخطط العلاقات الكامل

```
┌────────────┐
│   Genre    │────────┐
└────────────┘        │
                      │ M2M
┌────────────┐        │
│  Category  │───┐    │
└────────────┘   │    │
                 │ FK │
                 ↓    ↓
           ┌──────────────┐
           │    Manga     │←─────────┐
           └──────┬───────┘          │
                  │                  │
                  │ 1:M              │ M2M
                  ↓                  │
           ┌──────────────┐   ┌──────────────┐
           │   Chapter    │   │     User     │
           └──────┬───────┘   └──────┬───────┘
                  │                  │
                  │ 1:M              │
                  ↓                  │
        ┌─────────────────┐          │
        │  ChapterImage   │          │
        └─────────────────┘          │
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ↓                  ↓                  ↓
         ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐
         │ UserBookmark   │ │ReadingHistory  │ │     Rating      │
         └────────────────┘ └────────────────┘ └─────────────────┘
                  
                  ┌──────────────────────────────────────┐
                  │                                      │
                  ↓                                      ↓
         ┌────────────────┐                    ┌─────────────────┐
         │    Comment     │                    │  Achievement    │
         └────────┬───────┘                    └────────┬────────┘
                  │                                     │
                  │ 1:M                                 │ M2M
                  ↓                                     ↓
         ┌────────────────┐                  ┌──────────────────┐
         │  CommentLike   │                  │UserAchievement   │
         └────────────────┘                  └──────────────────┘
```

---

## ✅ الملخص النهائي

### الجداول (13):
1. ✅ **Genre** - الأنواع (موجود)
2. ✅ **Category** - التصنيفات (موجود)
3. ⚠️ **Manga** - المانجا (تحديث)
4. ⚠️ **Chapter** - الفصول (تحديث)
5. ✅ **ChapterImage** - صور الفصول (موجود)
6. ⭐ **User** - المستخدمين (جديد)
7. ⭐ **UserBookmark** - المفضلات (جديد)
8. ⭐ **ReadingHistory** - سجل القراءة (جديد)
9. ⭐ **Rating** - التقييمات (جديد)
10. ⭐ **Comment** - التعليقات (جديد)
11. ⭐ **CommentLike** - إعجابات التعليقات (جديد)
12. ⭐ **Achievement** - الإنجازات (جديد)
13. ⭐ **UserAchievement** - إنجازات المستخدمين (جديد)

---

## 📋 خطوات التنفيذ

### المرحلة 1: تحديث Models
- [ ] تحديث `Manga` model
- [ ] تحديث `Chapter` model
- [ ] إنشاء `User` model
- [ ] إنشاء `UserBookmark` model
- [ ] إنشاء `ReadingHistory` model
- [ ] إنشاء `Rating` model
- [ ] إنشاء `Comment` model
- [ ] إنشاء `CommentLike` model
- [ ] إنشاء `Achievement` model
- [ ] إنشاء `UserAchievement` model

### المرحلة 2: Migrations
- [ ] `makemigrations`
- [ ] `migrate`

### المرحلة 3: Admin Panel
- [ ] تسجيل جميع النماذج الجديدة
- [ ] إضافة Inline للعلاقات

### المرحلة 4: API Endpoints
- [ ] User endpoints
- [ ] Bookmark endpoints
- [ ] Rating endpoints
- [ ] Comment endpoints
- [ ] Achievement endpoints

### المرحلة 5: Frontend Integration
- [ ] صفحات المستخدم
- [ ] نظام التعليقات
- [ ] نظام التقييمات
- [ ] صفحة الإنجازات

---

**هل توافق على هذا الهيكل؟**
