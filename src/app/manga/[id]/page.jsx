'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockManga } from '@/data/mockManga';

export default function MangaDetail() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // البحث عن المانجا بناء على ID
    const foundManga = mockManga.find(m => m.id === params.id);
    
    if (foundManga) {
      setManga(foundManga);
    } else {
      // إذا لم توجد المانجا، إعادة التوجيه للصفحة الرئيسية بعد 2 ثانية
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">المانجا غير موجودة</h2>
          <p className="text-gray-600">سيتم إعادة توجيهك إلى الصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* شريط التنقل */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة للرئيسية
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل المانجا</h1>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* القسم العلوي: الصورة والمعلومات */}
          <div className="md:flex">
            {/* صورة الغلاف */}
            <div className="md:w-1/3 p-6">
              <div className="relative">
                <img
                  src={manga.imageUrl}
                  alt={manga.title}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl rounded-lg"
                  style={{display: 'none'}}
                >
                  📖
                </div>
              </div>
            </div>
            
            {/* المعلومات */}
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {manga.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">المؤلف</span>
                  <p className="text-lg text-gray-900 dark:text-white">{manga.author}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">الحالة</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    manga.status === 'ongoing' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {manga.status === 'ongoing' ? '🟢 مستمرة' : '🔵 مكتملة'}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد الفصول</span>
                  <p className="text-lg text-gray-900 dark:text-white">{manga.chapterCount} فصل</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">التقييم</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="text-lg text-gray-900 dark:text-white ml-2">
                      {manga.avgRating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* التصنيفات */}
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">التصنيفات</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {manga.genres.map(genre => (
                    <span 
                      key={genre} 
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* الوصف */}
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">القصة</span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  {manga.description}
                </p>
              </div>
            </div>
          </div>

          {/* قائمة الفصول */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الفصول</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: Math.min(6, manga.chapterCount) }, (_, i) => {
                const chapterNumber = manga.chapterCount - i;
                return (
                  <div 
                    key={chapterNumber} 
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => alert(`قراءة الفصل ${chapterNumber} - سيتوفر قريباً!`)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        الفصل {chapterNumber}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {manga.lastUpdated}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}