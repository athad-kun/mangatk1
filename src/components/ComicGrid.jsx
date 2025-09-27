'use client';
import Link from 'next/link';
import { useState } from 'react';

export function ComicGrid({ mangaList, onLoadMore, hasMore, limit, showHeader = true }) {
  const [imageErrors, setImageErrors] = useState({});

  // دالة لتنسيق الأرقام
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // تحديد عدد العناصر المعروضة
  const displayManga = limit ? mangaList.slice(0, limit) : mangaList;

  // دالة معالجة أخطاء الصور
  const handleImageError = (mangaId) => {
    setImageErrors(prev => ({ ...prev, [mangaId]: true }));
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* رأس الصفحة - اختياري */}
        {showHeader && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              مكتبة المانجا
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              عرض {displayManga.length} مانجا
            </p>
          </div>
        )}

        {/* شبكة المانجا */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {displayManga.map(manga => (
            <Link 
              key={manga.id} 
              href={`/manga/${manga.id}`}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-gray-100 dark:border-gray-700 h-full flex flex-col hover:border-blue-200 dark:hover:border-blue-600">
                
                {/* صورة المانجا */}
                <div className="relative h-72 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  {!imageErrors[manga.id] ? (
                    <img
                      src={manga.imageUrl}
                      alt={manga.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(manga.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-col p-4">
                      <span className="text-5xl mb-3">📖</span>
                      <span className="text-lg font-bold text-center leading-tight">{manga.title}</span>
                    </div>
                  )}
                  
                  {/* شريط الحالة */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                      manga.status === 'ongoing' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    }`}>
                      {manga.status === 'ongoing' ? '🟢 مستمر' : '🔵 مكتمل'}
                    </span>
                  </div>
                  
                  {/* التقييم */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg">
                    ⭐ <span className="ml-1">{manga.avgRating}</span>
                  </div>

                  {/* عدد الفصول */}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    📖 {manga.chapterCount} فصل
                  </div>
                </div>
                
                {/* محتوى البطاقة */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* العنوان */}
                  <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {manga.title}
                  </h3>
                  
                  {/* المؤلف */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-300 text-sm font-bold">
                        {manga.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {manga.author}
                    </span>
                  </div>

                  {/* وصف القصة */}
                  <div className="mb-4 flex-1">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {manga.description}
                    </p>
                  </div>
                  
                  {/* التصنيفات */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {manga.genres.slice(0, 3).map(genre => (
                      <span 
                        key={genre} 
                        className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600"
                      >
                        {genre}
                      </span>
                    ))}
                    {manga.genres.length > 3 && (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium">
                        +{manga.genres.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* المعلومات السفلية */}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(manga.lastUpdated)}
                    </div>
                    
                    <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {formatNumber(manga.views)}
                    </div>
                  </div>

                  {/* زر المشاهدة */}
                  <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                    ابدأ القراءة
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* زر تحميل المزيد */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={onLoadMore}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl font-bold flex items-center mx-auto transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              تحميل المزيد من المانجا
            </button>
          </div>
        )}

        {/* رسالة إذا لم توجد نتائج */}
        {mangaList.length === 0 && (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لا توجد مانجا
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-lg">
              حاول تعديل عوامل التصفية أو البحث عن كلمات أخرى
            </p>
          </div>
        )}
      </div>
    </section>
  );
}