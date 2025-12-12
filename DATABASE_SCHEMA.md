# قاعدة بيانات MangaTK - هيكل الجداول الكامل

## نظرة عامة

قاعدة البيانات تحتوي على **5 جداول رئيسية** لإدارة المانجا والفصول والتصنيفات.

---

## 📊 الجداول (Tables)

### 1. `Genre` - جدول الأنواع

**الغرض**: تخزين أنواع المانجا (Action, Romance, Fantasy, إلخ)

| الحقل | النوع | الخصائص | الوصف |
|------|------|---------|-------|
| **id** | UUID | Primary Key, Auto-generated | المعرف الفريد |
| **name** | CharField(100) | Unique, Required | اسم النوع (إنجليزي) |
| **slug** | SlugField(100) | Unique, Auto-generated | الرابط الصديق لـ SEO |
| **created_at** | DateTime | Auto-add | تاريخ الإنشاء |
| **updated_at** | DateTime | Auto-update | تاريخ آخر تحديث |

**العلاقات**:
- ← Many-to-Many مع `Manga` (genre يمكن أن يكون له عدة مانجا)

**الترتيب الافتراضي**: حسب `name` (أبجدياً)

**مثال البيانات**:
```
id: uuid-1234
name: Action
slug: action
created_at: 2024-12-01
updated_at: 2024-12-01
```

---

### 2. `Category` - جدول التصنيفات

**الغرض**: تصنيفات رئيسية للمانجا (best-webtoon, golden-week, new-releases, إلخ)

| الحقل | النوع | الخصائص | الوصف |
|------|------|---------|-------|
| **id** | UUID | Primary Key, Auto-generated | المعرف الفريد |
| **name** | CharField(100) | Unique, Required | الاسم الإنجليزي |
| **slug** | SlugField(100) | Unique, Auto-generated | الرابط (best-webtoon) |
| **title_ar** | CharField(200) | Required | العنوان بالعربية |
| **description_ar** | TextField | Optional | الوصف بالعربية |
| **created_at** | DateTime | Auto-add | تاريخ الإنشاء |
| **updated_at** | DateTime | Auto-update | تاريخ آخر تحديث |

**العلاقات**:
- ← One-to-Many مع `Manga` (تصنيف واحد لعدة مانجا)

**الترتيب الافتراضي**: حسب `name` (أبجدياً)

**مثال البيانات**:
```
id: uuid-5678
name: Best Webtoon
slug: best-webtoon
title_ar: أفضل ويبتون
description_ar: أفضل المانغا والويبتون حسب التقييمات
created_at: 2024-12-01
updated_at: 2024-12-01
```

---

### 3. `Manga` - جدول المانجا (الجدول الرئيسي)

**الغرض**: تخزين جميع معلومات المانجا

| الحقل | النوع | الخصائص | الوصف |
|------|------|---------|-------|
| **id** | UUID | Primary Key, Auto-generated | المعرف الفريد |
| **title** | CharField(300) | Required | عنوان المانجا |
| **slug** | SlugField(300) | Unique, Auto-generated | الرابط الصديق لـ SEO |
| **description** | TextField | Required | وصف القصة |
| **author** | CharField(200) | Required | اسم المؤلف |
| **cover_image_url** | URLField(500) | Optional | رابط صورة الغلاف (ImgBB أو محلي) |
| **status** | CharField(20) | Choices: ongoing/completed | حالة المانجا |
| **avg_rating** | Decimal(3,2) | Default: 0.0 | التقييم (0.00 - 5.00) |
| **views** | PositiveInteger | Default: 0 | عدد المشاهدات |
| **genres** | ManyToMany → Genre | - | الأنواع (Action, Romance, إلخ) |
| **category** | ForeignKey → Category | Nullable, SET_NULL | التصنيف |
| **created_at** | DateTime | Auto-add | تاريخ الإنشاء |
| **updated_at** | DateTime | Auto-update | تاريخ آخر تحديث |
| **last_updated** | Date | Auto-update | آخر تحديث للمحتوى |

**Properties (Computed)**:
- `chapter_count`: عدد الفصول (يُحسب من جدول `Chapter`)

**العلاقات**:
- → Many-to-Many مع `Genre` (مانجا يمكن أن يكون له عدة أنواع)
- → Many-to-One مع `Category` (مانجا ينتمي لتصنيف واحد)
- ← One-to-Many مع `Chapter` (مانجا واحدة لها عدة فصول)

**الترتيب الافتراضي**: حسب `-updated_at` (الأحدث أولاً)

**مثال البيانات**:
```
id: uuid-manga-1
title: One Piece
slug: one-piece
description: Adventure manga about pirates
author: Eiichiro Oda
cover_image_url: /images/one-pice.jpg
status: ongoing
avg_rating: 4.80
views: 5000000
genres: [Action, Adventure, Comedy]
category: best-webtoon
created_at: 2024-12-01
updated_at: 2024-12-05
last_updated: 2024-12-05
```

---

### 4. `Chapter` - جدول الفصول

**الغرض**: تخزين فصول كل مانجا

| الحقل | النوع | الخصائص | الوصف |
|------|------|---------|-------|
| **id** | UUID | Primary Key, Auto-generated | المعرف الفريد |
| **manga** | ForeignKey → Manga | CASCADE, Required | المانجا المرتبطة |
| **number** | PositiveInteger | Required | رقم الفصل (1, 2, 3, ...) |
| **title** | CharField(300) | Optional | عنوان الفصل |
| **release_date** | Date | Optional | تاريخ الإصدار |
| **created_at** | DateTime | Auto-add | تاريخ الإنشاء |
| **updated_at** | DateTime | Auto-update | تاريخ آخر تحديث |

**Constraints**:
- **Unique Together**: (`manga`, `number`) - لا يمكن تكرار رقم الفصل لنفس المانجا

**Properties (Computed)**:
- `image_count`: عدد صور الفصل (يُحسب من جدول `ChapterImage`)

**العلاقات**:
- → Many-to-One مع `Manga` (عدة فصول لمانجا واحدة)
- ← One-to-Many مع `ChapterImage` (فصل واحد له عدة صور)

**الترتيب الافتراضي**: حسب `manga`, `number` (مرتب حسب المانجا ثم رقم الفصل)

**مثال البيانات**:
```
id: uuid-chapter-1
manga: uuid-manga-1 (One Piece)
number: 1
title: الفصل الأول - البداية
release_date: 2024-01-01
created_at: 2024-12-01
updated_at: 2024-12-01
```

---

### 5. `ChapterImage` - جدول صور الفصول

**الغرض**: تخزين صور كل فصل (مرتبة حسب الصفحات)

| الحقل | النوع | الخصائص | الوصف |
|------|------|---------|-------|
| **id** | UUID | Primary Key, Auto-generated | المعرف الفريد |
| **chapter** | ForeignKey → Chapter | CASCADE, Required | الفصل المرتبط |
| **image_url** | URLField(500) | Required | رابط الصورة (ImgBB أو محلي) |
| **page_number** | PositiveInteger | Required | رقم الصفحة (1, 2, 3, ...) |
| **original_filename** | CharField(255) | Optional | اسم الملف الأصلي |
| **width** | PositiveInteger | Optional | عرض الصورة (pixels) |
| **height** | PositiveInteger | Optional | ارتفاع الصورة (pixels) |
| **created_at** | DateTime | Auto-add | تاريخ الإنشاء |

**Constraints**:
- **Unique Together**: (`chapter`, `page_number`) - لا يمكن تكرار رقم الصفحة في نفس الفصل

**العلاقات**:
- → Many-to-One مع `Chapter` (عدة صور لفصل واحد)

**الترتيب الافتراضي**: حسب `chapter`, `page_number` (مرتب حسب الفصل ثم رقم الصفحة)

**مثال البيانات**:
```
id: uuid-image-1
chapter: uuid-chapter-1
image_url: https://i.ibb.co/xxx/one-piece_ch001_page001.jpg
page_number: 1
original_filename: 001__001.jpg
width: 800
height: 1200
created_at: 2024-12-01
```

---

## 📐 مخطط العلاقات (ERD)

```
┌─────────────┐
│   Genre     │
│  (14 rows)  │
└──────┬──────┘
       │
       │ Many-to-Many
       │
       ↓
┌─────────────────────────────┐
│          Manga              │
│        (18 rows)            │
│                             │
│  • id (UUID)                │
│  • title                    │
│  • description              │
│  • author                   │
│  • cover_image_url          │
│  • status                   │
│  • avg_rating               │
│  • views                    │
│  • genres (M2M)             │
│  • category (FK)            │
└──────┬──────────────────────┘
       │
       │ One-to-Many
       │
       ↓
┌─────────────────┐
│    Chapter      │
│   (0 rows*)     │
│                 │
│  • id           │
│  • manga (FK)   │
│  • number       │
│  • title        │
└──────┬──────────┘
       │
       │ One-to-Many
       │
       ↓
┌──────────────────┐
│  ChapterImage    │
│   (0 rows*)      │
│                  │
│  • id            │
│  • chapter (FK)  │
│  • image_url     │
│  • page_number   │
└──────────────────┘

┌─────────────┐
│  Category   │
│  (5 rows)   │
└──────┬──────┘
       │
       │ One-to-Many
       │
       ↓
     (Manga)

* حالياً لا توجد فصول في قاعدة البيانات
```

---

## 📈 إحصائيات قاعدة البيانات الحالية

| الجدول | عدد الصفوف | الحالة |
|--------|------------|--------|
| **Genre** | 14 | ✅ مكتمل |
| **Category** | 5 | ✅ مكتمل |
| **Manga** | 18 | ✅ مكتمل (مع صور) |
| **Chapter** | 0 | ⚠️ فارغ |
| **ChapterImage** | 0 | ⚠️ فارغ |

---

## 🔑 المفاتيح والقيود (Constraints)

### Primary Keys:
- جميع الجداول تستخدم **UUID** كمفتاح أساسي
- UUID يُولد تلقائياً (`uuid.uuid4()`)

### Unique Constraints:
- `Genre.name` - اسم النوع فريد
- `Genre.slug` - رابط النوع فريد
- `Category.name` - اسم التصنيف فريد
- `Category.slug` - رابط التصنيف فريد
- `Manga.slug` - رابط المانجا فريد
- `(Chapter.manga, Chapter.number)` - رقم الفصل فريد لكل مانجا
- `(ChapterImage.chapter, ChapterImage.page_number)` - رقم الصفحة فريد لكل فصل

### Foreign Keys:
- `Manga.category` → `Category` (SET_NULL عند الحذف)
- `Chapter.manga` → `Manga` (CASCADE عند الحذف)
- `ChapterImage.chapter` → `Chapter` (CASCADE عند الحذف)

### Many-to-Many:
- `Manga.genres` ↔ `Genre.manga` (جدول وسيط تلقائي)

---

## 🎯 الحقول المحسوبة (Properties)

هذه ليست حقول في قاعدة البيانات، بل يتم حسابها ديناميكياً:

### في `Manga`:
```python
@property
def chapter_count(self):
    return self.chapters.count()  # عدد الفصول
```

### في `Chapter`:
```python
@property
def image_count(self):
    return self.images.count()  # عدد الصور
```

---

## 📝 ملاحظات مهمة

### 1. تخزين الصور:
- **لا تُخزن الصور** في قاعدة البيانات
- تُخزن فقط **روابط URL** للصور
- الصور يمكن أن تكون:
  - محلية: `/images/one-piece.jpg`
  - ImgBB: `https://i.ibb.co/xxx/image.jpg`

### 2. Slugs (الروابط):
- تُولد تلقائياً من الاسم/العنوان
- تُستخدم في URLs بدلاً من IDs
- مثال: `/manga/one-piece/` بدلاً من `/manga/uuid-1234/`

### 3. Timestamps:
- `created_at`: يُضاف تلقائياً عند الإنشاء
- `updated_at`: يُحدث تلقائياً عند أي تعديل
- `last_updated`: يُحدث يومياً على Manga

### 4. Choices (الخيارات المحددة):
```python
Manga.status:
  - 'ongoing': مستمرة
  - 'completed': مكتملة
```

---

## 🔍 استعلامات شائعة

### جلب مانجا مع جميع علاقاتها:
```python
manga = Manga.objects.get(id=manga_id)
manga.genres.all()        # جميع الأنواع
manga.category           # التصنيف
manga.chapters.all()     # جميع الفصول
manga.chapter_count      # عدد الفصول
```

### جلب فصل مع صوره:
```python
chapter = Chapter.objects.get(id=chapter_id)
chapter.manga           # المانجا
chapter.images.all()    # جميع الصور
chapter.image_count     # عدد الصور
```

### البحث والفلترة:
```python
# مانجا حسب التصنيف
Manga.objects.filter(category__slug='best-webtoon')

# مانجا حسب النوع
Manga.objects.filter(genres__name='Action')

# مانجا مستمرة فقط
Manga.objects.filter(status='ongoing')

# أعلى تقييم
Manga.objects.filter(avg_rating__gte=4.5).order_by('-avg_rating')
```

---

## ✅ الخلاصة

قاعدة البيانات مصممة بشكل احترافي مع:
- ✅ استخدام UUID للأمان
- ✅ علاقات واضحة ومنظمة
- ✅ Slugs لـ SEO-friendly URLs
- ✅ Timestamps تلقائية
- ✅ Constraints للحفاظ على سلامة البيانات
- ✅ Properties محسوبة للبيانات الديناميكية
