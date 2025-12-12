# MangaTK Backend - Django REST API

## 📋 ملخص المرحلة الأولى - Backend Setup

تم بنجاح إنشاء وإعداد Django Backend كامل لمشروع MangaTK مع الميزات التالية:

## ✅ ما تم إنجازه

### 1. هيكل المشروع
- ✅ تنظيم المشروع إلى `backend/` و `frontend/`
- ✅ نسخ بيئة Django الموجودة إلى مجلد backend
- ✅ إنشاء Django project باسم `config`
- ✅ إنشاء تطبيق `manga`

### 2. قاعدة البيانات (Models)
تم إنشاء 5 نماذج رئيسية:
- **Genre**: أنواع المانجا (Action, Romance, إلخ)
- **Category**: التصنيفات (best-webtoon, golden-week, إلخ)
- **Manga**: بيانات المانجا الكاملة
- **Chapter**: فصول المانجا
- **ChapterImage**: صور الفصول مع ترتيب الصفحات

### 3. خدمة ImgBB
- ✅ إنشاء `ImgBBService` لرفع الصور
- ✅ تسمية موحدة للصور:
  - الغلاف: `{manga_slug}_cover`
  - صفحات الفصول: `{manga_slug}_ch{num}_page{num}`
- ✅ حفظ روابط ImgBB في قاعدة البيانات

### 4. REST API Endpoints

#### Manga Endpoints
```
GET  /api/manga/                    # قائمة المانجا مع فلاتر
GET  /api/manga/{id}/               # تفاصيل مانجا محددة
GET  /api/manga/{id}/chapters/      # فصول مانجا محددة
GET  /api/manga/featured/           # المانجا المميزة (تقييم > 4.5)
POST /api/manga/                    # إضافة مانجا جديدة
PUT  /api/manga/{id}/               # تحديث مانجا
```

**فلاتر البحث:**
- `?search=query` - البحث في العنوان، المؤلف، الوصف
- `?category=slug` - فلترة حسب التصنيف
- `?genre=name` - فلترة حسب النوع
- `?status=ongoing|completed` - فلترة حسب الحالة
- `?min_rating=4.5` - فلترة حسب التقييم الأدنى
- `?ordering=title|-title|avg_rating|-avg_rating|views|-views`

#### Chapter Endpoints
```
GET  /api/chapters/                 # قائمة الفصول
GET  /api/chapters/{id}/            # تفاصيل فصل مع الصور
POST /api/chapters/                 # إضافة فصل جديد
POST /api/chapters/{id}/increment_views/  # زيادة المشاهدات
```

**فلاتر:**
- `?manga={manga_id}` - فصول مانجا محددة

#### Category & Genre Endpoints
```
GET /api/categories/                # قائمة التصنيفات
GET /api/categories/{slug}/         # تفاصيل تصنيف
GET /api/genres/                    # قائمة الأنواع
GET /api/genres/{slug}/             # تفاصيل نوع
```

### 5. لوحة التحكم (Django Admin)
- ✅ واجهة إدارة كاملة لجميع النماذج
- ✅ معاينة الصور في لوحة التحكم
- ✅ تعديل مضمن للفصول داخل صفحة المانجا
- ✅ فلاتر وبحث متقدم

### 6. البيانات المستوردة
تم استيراد البيانات من mock data بنجاح:
- ✅ 5 تصنيفات (Categories)
- ✅ 14 نوع (Genres)  
- ✅ 18 مانجا (Manga)

## 🔧 الإعدادات

### CORS
تم تفعيل CORS للسماح بالاتصال من Next.js:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### ImgBB API
```python
IMGBB_API_KEY = '9acd5ae77545c9653ac31a3d680fb638'
IMGBB_API_URL = 'https://api.imgbb.com/1/upload'
```

## 🚀 تشغيل Backend

### 1. تفعيل البيئة الافتراضية
```bash
cd backend
.\Scripts\activate
```

### 2. تشغيل الخادم
```bash
python manage.py runserver
```

الخادم سيعمل على: `http://localhost:8000`

### 3. الوصول إلى لوحة التحكم
```
URL: http://localhost:8000/admin/
```

**ملاحظة**: ستحتاج إلى إنشاء مستخدم admin:
```bash
python manage.py createsuperuser
```

### 4. اختبار API
```bash
# قائمة المانجا
http://localhost:8000/api/manga/

# مانجا محددة
http://localhost:8000/api/manga/{id}/

# البحث
http://localhost:8000/api/manga/?search=naruto

# فلترة
http://localhost:8000/api/manga/?category=best-webtoon&status=ongoing
```

## 📝 الخطوات التالية

### Phase 6: Frontend Integration ⏭️

الآن تحتاج إلى:

1. **إنشاء API Service في Next.js**
   - ملف جديد: `frontend/src/services/api.ts`
   - دوال للتواصل مع Backend

2. **تعديل المكونات لاستخدام API**
   الملفات التي تحتاج تعديل:
   - `frontend/src/app/page.tsx` - الصفحة الرئيسية
   - `frontend/src/app/manga/[id]/page.tsx` - صفحة المانجا
   - `frontend/src/app/chapter/[id]/page.tsx` - صفحة القارئ
   - `frontend/src/app/category/[slug]/page.tsx` - صفحات التصنيفات

3. **إضافة متغيرات البيئة**
   - ملف جديد: `frontend/.env.local`
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

## 📊 البيانات الحالية

قاعدة البيانات تحتوي على:
- 18 مانجا بتصنيفات مختلفة
- جميع الأنواع المطلوبة (Action, Romance, Fantasy, إلخ)
- التصنيفات الخمس (best-webtoon, golden-week, new-releases, action-fantasy, romance-drama)

**ملاحظة مهمة**: صور الغلاف حالياً فارغة. سيتم رفعها إلى ImgBB في المرحلة القادمة.

## 🔍 اختبار سريع

يمكنك اختبار الـ API الآن:

```bash
# Open PowerShell في مجلد backend
cd d:\gndhn\mangatk\backend

# تشغيل الخادم
.\Scripts\python.exe manage.py runserver

# في متصفح:
# http://localhost:8000/api/manga/
# http://localhost:8000/admin/
```

---

**حالة المشروع**: Backend جاهز بنسبة 100% ✅  
**التالي**: ربط Frontend مع Backend API
