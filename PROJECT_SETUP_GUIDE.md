# MangaTK - دليل إعداد المشروع الكامل

## 📋 نظرة عامة

MangaTK هو موقع لقراءة المانجا مع لوحة تحكم إدارية كاملة. يتكون من:
- **Frontend**: Next.js 14 (React)
- **Backend**: Django 5.2 + Django REST Framework
- **Database**: MySQL/MariaDB

---

## 🗄️ متطلبات النظام

- Python 3.10+
- Node.js 18+
- MySQL/MariaDB
- Git

---

## 🚀 خطوات الإعداد

### 1️⃣ استنساخ المشروع

```bash
git clone <repository-url>
cd mangatk
```

### 2️⃣ إعداد قاعدة البيانات

أنشئ قاعدة بيانات MySQL:

```sql
CREATE DATABASE mangatk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'manga_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mangatk.* TO 'manga_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3️⃣ إعداد Backend (Django)

```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# تثبيت المكتبات
pip install -r requirements.txt

# إعداد ملف البيئة
copy .env.example .env
# أو في Linux: cp .env.example .env
```

#### تعديل ملف `.env`:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DB_NAME=mangatk
DB_USER=manga_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# ImgBB API (للصور)
IMGBB_API_KEY=9acd5ae77545c9653ac31a3d680fb638
```

#### تطبيق الـ Migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

#### إنشاء حساب المدير:

```bash
python manage.py createsuperuser
# أو استخدم السكربت:
python create_admin.py
```

#### استيراد البيانات الجاهزة:

```bash
# إذا لديك ملفات data_export
python import_data.py

# أو أضف الإنجازات فقط
python seed_achievements.py
```

#### تشغيل الخادم:

```bash
python manage.py runserver
# سيعمل على: http://localhost:8000
```

### 4️⃣ إعداد Frontend (Next.js)

```bash
cd ../frontend

# تثبيت المكتبات
npm install

# إعداد متغيرات البيئة
copy .env.example .env.local
```

#### تعديل `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_IMGBB_API_KEY=9acd5ae77545c9653ac31a3d680fb638
```

#### تشغيل الخادم:

```bash
npm run dev
# سيعمل على: http://localhost:3000
```

---

## 📁 هيكل المشروع

```
mangatk/
├── backend/                 # Django Backend
│   ├── config/              # إعدادات Django
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manga/               # تطبيق المانجا
│   │   ├── models.py        # نماذج قاعدة البيانات
│   │   ├── views.py         # API Views
│   │   ├── serializers.py   # DRF Serializers
│   │   ├── urls.py          # API Routes
│   │   └── auth_views.py    # تسجيل الدخول/التسجيل
│   ├── export_data.py       # تصدير البيانات
│   ├── import_data.py       # استيراد البيانات
│   └── seed_achievements.py # إضافة الإنجازات
│
└── frontend/                # Next.js Frontend
    ├── src/
    │   ├── app/             # صفحات التطبيق
    │   │   ├── page.tsx             # الصفحة الرئيسية
    │   │   ├── browse/              # تصفح المانجا
    │   │   ├── manga/[slug]/        # تفاصيل المانجا
    │   │   ├── login/               # تسجيل الدخول
    │   │   ├── register/            # إنشاء حساب
    │   │   └── dashboard/           # لوحة التحكم
    │   ├── components/      # المكونات
    │   ├── context/         # سياقات React
    │   ├── hooks/           # Custom Hooks
    │   └── services/        # خدمات API
    └── public/              # الملفات الثابتة
```

---

## 🔗 API Endpoints

### المصادقة
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login/` | POST | تسجيل الدخول |
| `/api/auth/register/` | POST | إنشاء حساب |
| `/api/auth/profile/` | GET | بيانات المستخدم |

### المانجا
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/manga/` | GET | قائمة المانجا |
| `/api/manga/{id}/` | GET | تفاصيل مانجا |
| `/api/manga/` | POST | إضافة مانجا (Admin) |
| `/api/genres/` | GET | التصنيفات |
| `/api/categories/` | GET | الفئات |

### الفصول
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chapters/` | GET | قائمة الفصول |
| `/api/chapters/{id}/` | GET | تفاصيل فصل |
| `/api/chapters/{id}/upload_zip/` | POST | رفع فصل (ZIP) |

### التفاعلات
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookmarks/` | GET/POST | المفضلة |
| `/api/ratings/` | POST | التقييمات |
| `/api/comments/` | GET/POST | التعليقات |
| `/api/achievements/` | GET | الإنجازات |

---

## 👤 حساب المدير الافتراضي

```
Email: admin@manga.com
Password: admin123
```

---

## 🎯 الإنجازات

| ID | الاسم | الشرط | الندرة |
|----|-------|-------|--------|
| read_1 | بداية الرحلة | قراءة 1 فصل | عادي |
| read_10 | دودة كتب | قراءة 10 فصول | عادي |
| read_50 | قارئ نهم | قراءة 50 فصل | نادر |
| read_100 | أوتاكو حقيقي | قراءة 100 فصل | ملحمي |
| read_1000 | ملك القراصنة | قراءة 1000 فصل | أسطوري |
| time_1m | نظرة سريعة | دقيقة قراءة | عادي |
| time_1h | تركيز عالي | ساعة قراءة | نادر |
| time_24h | مدمن مانجا | يوم قراءة | ملحمي |
| fav_10 | جامع التحف | 10 مفضلات | نادر |
| com_100 | المؤثر | 100 تعليق | ملحمي |
| secret_night | ساهر الليل | قراءة 3-5 فجراً | ملحمي |

---

## 📦 تصدير/استيراد البيانات

### تصدير البيانات:
```bash
cd backend
python export_data.py
# سينشئ مجلد data_export/ مع ملفات JSON
```

### استيراد البيانات:
```bash
cd backend
# ضع مجلد data_export/ في backend/
python import_data.py
```

---

## ⚠️ ملاحظات مهمة

1. **ImgBB API**: الصور تُرفع على ImgBB. المفتاح الافتراضي متضمن.
2. **المفضلات والإنجازات**: حالياً تُحفظ في localStorage وليس قاعدة البيانات.
3. **المصادقة**: تستخدم Session Authentication، ليس JWT.
4. **CORS**: تأكد من إعداد CORS في Django للسماح لـ Frontend.

---

## 🐛 حل المشاكل الشائعة

### خطأ CORS:
أضف في `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### خطأ قاعدة البيانات:
```bash
python manage.py makemigrations
python manage.py migrate
```

### الصور لا تظهر:
تأكد من أن `cover_image_url` يحتوي على رابط كامل وليس مسار محلي.

---

## 📞 الدعم

للمساعدة أو الاستفسارات، راجع الكود أو افتح Issue في المستودع.
