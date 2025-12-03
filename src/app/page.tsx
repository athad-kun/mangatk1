'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Carousel } from '@/components/Carousel';
import { QuickMenu } from '@/components/QuickMenu';
import { FilterSection } from '@/components/FilterSection';
import { CategoryNav } from '@/components/CategoryNav';
import { ComicGrid } from '@/components/ComicGrid';
import { SectionTitle } from '@/components/SectionTitle';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { mockManga, category, getMangaByCategory } from '@/data/mockManga';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/context/AuthContext';
import { FaPlay, FaHistory, FaTimesCircle } from 'react-icons/fa';

interface Filters {
  query?: string;
  status?: string;
  categories?: string[];
}

export default function Home() {
  const { user } = useAuth();
  const { history } = useStorage();
  
  const [filteredManga, setFilteredManga] = useState(mockManga);
  const [dynamicMangaList, setDynamicMangaList] = useState(mockManga);
  const [greeting, setGreeting] = useState('');
  const [currentFilters, setCurrentFilters] = useState<Filters>({});

  // 1. تعريف التصنيفات القديمة
  const categorizedManga = {
    'best-webtoon': getMangaByCategory('best-webtoon'),
    'golden-week': getMangaByCategory('golden-week'),
    'new-releases': getMangaByCategory('new-releases'),
    'action-fantasy': getMangaByCategory('action-fantasy'),
    'romance-drama': getMangaByCategory('romance-drama')
  };

  // 2. التحية ودمج التقييمات
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير ☀️');
    else if (hour < 18) setGreeting('طاب مساؤك 🌤️');
    else setGreeting('سهرة ممتعة 🌙');

    const updatedManga = mockManga.map(manga => {
       let localRating = null;
       for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`rating_${manga.id}_`)) {
             localRating = parseFloat(localStorage.getItem(key) || '0');
             break;
          }
       }
       if (localRating) {
         return { ...manga, avgRating: (manga.avgRating + localRating) / 2 };
       }
       return manga;
    });

    updatedManga.sort((a, b) => b.avgRating - a.avgRating);
    setDynamicMangaList(updatedManga);
    
    // التحديث الأولي للفلتر لضمان ظهور البيانات
    setFilteredManga(updatedManga);

  }, []);

  // 3. منطق الفلترة
  useEffect(() => {
    let filtered = [...dynamicMangaList];
    
    if (currentFilters.query) {
      filtered = filtered.filter(manga => 
        manga.title.toLowerCase().includes(currentFilters.query?.toLowerCase() || '') ||
        manga.description.toLowerCase().includes(currentFilters.query?.toLowerCase() || '')
      );
    }
    
    if (currentFilters.status && currentFilters.status !== 'All') {
      filtered = filtered.filter(manga => {
        if (currentFilters.status === 'Completed') return manga.status === 'completed';
        if (currentFilters.status === 'Ongoing') return manga.status === 'ongoing';
        return true;
      });
    }
    
    if (currentFilters.categories && currentFilters.categories.length > 0) {
      filtered = filtered.filter(manga =>
        manga.genres.some(genre => currentFilters.categories?.includes(genre))
      );
    }

    setFilteredManga(filtered);
  }, [currentFilters, dynamicMangaList]);

  const handleFilter = (filters: Filters) => setCurrentFilters(filters);
  const handleSort = () => {}; 
  const handleCategorySelect = (cat: string) => handleFilter({ categories: [cat] });
  
  const clearFilters = () => {
    setCurrentFilters({});
  };

  const hasActiveFilters = currentFilters.query || (currentFilters.status && currentFilters.status !== 'All') || (currentFilters.categories && currentFilters.categories.length > 0);
  const lastRead = history.length > 0 ? history[0] : null;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div id="main-content">
        
        {/* --- قسم البطل (Hero) --- */}
        {!hasActiveFilters && (
            lastRead ? (
            <section className="relative w-full h-[500px] overflow-hidden group">
                <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${lastRead.imageUrl})` }}
                >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
                <div className="animate-in slide-in-from-bottom-10 duration-700">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4 shadow-lg shadow-blue-600/20">
                        <FaHistory className="inline mr-2" /> {greeting}، {user?.name || 'يا بطل'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight max-w-2xl drop-shadow-2xl">
                        {lastRead.mangaTitle}
                    </h1>
                    <p className="text-gray-300 text-lg mb-8 flex items-center gap-2">
                        توقفت عند <span className="text-white font-bold border-b-2 border-blue-500">الفصل {lastRead.chapterId}</span>
                    </p>

                    <div className="flex gap-4">
                        <Link 
                        href={`/read/${lastRead.chapterId}?mangaId=${lastRead.mangaId}`}
                        className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-white/10 flex items-center gap-3 transform hover:-translate-y-1"
                        >
                        <FaPlay className="text-blue-600" /> أكمل القراءة
                        </Link>
                        <Link 
                        href={`/manga/${lastRead.mangaId}`}
                        className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/30 hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                        التفاصيل
                        </Link>
                    </div>
                </div>
                </div>
            </section>
            ) : (
            <Carousel />
            )
        )}
        
        <QuickMenu />

        {/* --- شريط القراءة السريع --- */}
        {!hasActiveFilters && history.length > 1 && (
           <section className="py-8 bg-gray-50 dark:bg-gray-800/30 border-y border-gray-100 dark:border-gray-800">
              <div className="container mx-auto px-4">
                 <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <FaHistory /> قراءاتك الأخيرة
                 </h3>
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {history.slice(1, 6).map((item, idx) => (
                       <Link key={idx} href={`/read/${item.chapterId}?mangaId=${item.mangaId}`} className="flex-shrink-0 w-48 group">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden relative mb-2">
                             <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <FaPlay className="text-white text-2xl" />
                             </div>
                             <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Ch. {item.chapterId}
                             </div>
                          </div>
                          <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate">{item.mangaTitle}</h4>
                          <p className="text-xs text-gray-500">تابع القراءة</p>
                       </Link>
                    ))}
                 </div>
              </div>
           </section>
        )}

        {/* أدوات التصفية */}
        <FilterSection onFilter={handleFilter} onSort={handleSort} />
        <CategoryNav onCategorySelect={handleCategorySelect} />
        
        {/* --- المحتوى الرئيسي (إذا كان هناك بحث) --- */}
        {hasActiveFilters ? (
            <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <SectionTitle 
                  title={`نتائج البحث (${filteredManga.length})`}
                  description="المانجا التي تطابق معايير البحث الخاصة بك"
                />
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-full font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                >
                  <FaTimesCircle className="text-lg" />
                  إلغاء الفلتر والعودة
                </button>
              </div>
              <ComicGrid mangaList={filteredManga} onLoadMore={() => {}} hasMore={false} showHeader={false} limit={undefined} />
            </div>
          </section>
        ) : (
            /* --- المحتوى الرئيسي (الأقسام الأصلية) --- */
            <>
                {/* 1. قسم الأعلى تقييماً (ديناميكي جديد) */}
                <section className="py-12 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <SectionTitle title="الأعلى تقييماً 🔥" description="بناءً على تقييمات القراء الحقيقية" />
                        <ComicGrid mangaList={dynamicMangaList.slice(0, 5)} onLoadMore={() => {}} hasMore={false} limit={5} showHeader={false} />
                    </div>
                </section>

                {/* 2. Best Webtoon */}
                {categorizedManga['best-webtoon'].length > 0 && (
                <section className="py-12 bg-gray-50 dark:bg-gray-800">
                    <div className="container mx-auto px-4">
                    <SectionTitle title={category['best-webtoon'].title} description={category['best-webtoon'].description} viewAllLink="/category/best-webtoon" />
                    <ComicGrid mangaList={categorizedManga['best-webtoon']} onLoadMore={() => {}} hasMore={false} limit={4} showHeader={false} />
                    </div>
                </section>
                )}
                
                {/* 3. Golden Week */}
                {categorizedManga['golden-week'].length > 0 && (
                <section className="py-12 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                    <SectionTitle title={category['golden-week'].title} description={category['golden-week'].description} viewAllLink="/category/golden-week" />
                    <ComicGrid mangaList={categorizedManga['golden-week']} onLoadMore={() => {}} hasMore={false} limit={4} showHeader={false} />
                    </div>
                </section>
                )}

                {/* 4. New Releases */}
                {categorizedManga['new-releases'].length > 0 && (
                <section className="py-12 bg-gray-50 dark:bg-gray-800">
                    <div className="container mx-auto px-4">
                    <SectionTitle title={category['new-releases'].title} description={category['new-releases'].description} viewAllLink="/category/new-releases" />
                    <ComicGrid mangaList={categorizedManga['new-releases']} onLoadMore={() => {}} hasMore={false} limit={4} showHeader={false} />
                    </div>
                </section>
                )}

                {/* 5. Action & Fantasy */}
                {categorizedManga['action-fantasy'].length > 0 && (
                <section className="py-12 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                    <SectionTitle title={category['action-fantasy'].title} description={category['action-fantasy'].description} viewAllLink="/category/action-fantasy" />
                    <ComicGrid mangaList={categorizedManga['action-fantasy']} onLoadMore={() => {}} hasMore={false} limit={4} showHeader={false} />
                    </div>
                </section>
                )}

                {/* 6. Romance & Drama */}
                {categorizedManga['romance-drama'].length > 0 && (
                <section className="py-12 bg-gray-50 dark:bg-gray-800">
                    <div className="container mx-auto px-4">
                    <SectionTitle title={category['romance-drama'].title} description={category['romance-drama'].description} viewAllLink="/category/romance-drama" />
                    <ComicGrid mangaList={categorizedManga['romance-drama']} onLoadMore={() => {}} hasMore={false} limit={4} showHeader={false} />
                    </div>
                </section>
                )}
                
                {/* جميع المانجا */}
                <section className="py-12 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <SectionTitle title="جميع المانجا" description="استكشف مكتبتنا الكاملة" viewAllLink="/browse" />
                    <ComicGrid mangaList={mockManga} onLoadMore={() => {}} hasMore={mockManga.length > 12} limit={12} showHeader={false} />
                </div>
                </section>
            </>
        )}
        
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}