// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Carousel } from '@/components/Carousel';
import { QuickMenu } from '@/components/QuickMenu';
import { FilterSection } from '@/components/FilterSection';
import { CategoryNav } from '@/components/CategoryNav';
import { ComicGrid } from '@/components/ComicGrid';
import { SectionTitle } from '@/components/SectionTitle';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { mockManga } from '@/data/mockManga'; // تغيير categories إلى category
import {  category } from '@/data/mockManga';
// import { SectionTitle } from './components/SectionTitle.tsx';
// تعريف أنواع البيانات
interface Filters {
  query?: string;
  status?: string;
  categories?: string[];
}

export default function Home() {
  const [filteredManga, setFilteredManga] = useState(mockManga);
  const [sortBy, setSortBy] = useState('Name');
  const [currentFilters, setCurrentFilters] = useState<Filters>({});

  // تجميع المانجا حسب التصنيفات
  const categorizedManga = {
    'best-webtoon': mockManga.filter(manga => manga.category === 'best-webtoon'),
    'golden-week': mockManga.filter(manga => manga.category === 'golden-week'),
    'new-releases': mockManga.filter(manga => manga.category === 'new-releases')
  };

  useEffect(() => {
    let filtered = [...mockManga];
    
    // تطبيق فلتر البحث
    if (currentFilters.query) {
      filtered = filtered.filter(manga => 
        manga.title.toLowerCase().includes(currentFilters.query?.toLowerCase() || '') ||
        manga.description.toLowerCase().includes(currentFilters.query?.toLowerCase() || '')
      );
    }
    
    // تطبيق فلتر الحالة
    if (currentFilters.status && currentFilters.status !== 'All') {
      filtered = filtered.filter(manga => {
        if (currentFilters.status === 'Completed') {
          return manga.status === 'completed';
        } else if (currentFilters.status === 'Ongoing') {
          return manga.status === 'ongoing';
        }
        return true;
      });
    }
    
    // تطبيق فلتر التصنيفات
    if (currentFilters.categories && currentFilters.categories.length > 0) {
      filtered = filtered.filter(manga =>
        manga.genres.some(genre => currentFilters.categories?.includes(genre))
      );
    }

    // تطبيق الترتيب
    switch (sortBy) {
      case 'Name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Latest Chapter':
        filtered.sort((a, b) => b.chapterCount - a.chapterCount);
        break;
      case 'Most Popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'Rating':
        filtered.sort((a, b) => b.avgRating - a.avgRating);
        break;
      default:
        break;
    }

    setFilteredManga(filtered);
  }, [currentFilters, sortBy]);

  const handleFilter = (filters: Filters) => {
    setCurrentFilters(filters);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
  };

  const handleCategorySelect = (category: string, type: string = 'genre') => {
    if (type === 'rating') {
      const ratingValue = parseFloat(category);
      if (!isNaN(ratingValue)) {
        const filtered = mockManga.filter(manga => manga.avgRating >= ratingValue);
        setFilteredManga(filtered);
      }
    } else {
      handleFilter({ categories: [category] });
    }
  };

  const handleLoadMore = () => {
    console.log('Loading more manga...');
  };

  // التحقق من وجود تصفية نشطة
  const hasActiveFilters = currentFilters.query || currentFilters.status || currentFilters.categories;

  return (
    <main className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:z-50">
        تخطي إلى المحتوى الرئيسي
      </a>

      <Header />
      
      <div id="main-content">
        <Carousel />
        <QuickMenu />
        <FilterSection onFilter={handleFilter} onSort={handleSort} />
        <CategoryNav onCategorySelect={handleCategorySelect} />
        
        {/* إذا كان هناك تصفية، عرض النتائج فقط */}
        {hasActiveFilters ? (
          <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <SectionTitle 
                title={`نتائج البحث (${filteredManga.length})`}
                description="المانجا التي تطابق معايير البحث الخاصة بك" viewAllLink={undefined}              />
              <ComicGrid 
                mangaList={filteredManga}
                onLoadMore={handleLoadMore}
                hasMore={false}
                showHeader={false} limit={undefined}              />
            </div>
          </section>
        ) : (
          /* إذا لم يكن هناك تصفية، عرض الأقسام المنظمة */
          <>
            {/* قسم Best Webtoon */}
            {categorizedManga['best-webtoon'].length > 0 && (
              <section className="py-12 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                  <SectionTitle 
                    title={category['best-webtoon'].title} // استخدام category بدلاً من categories
                    description={category['best-webtoon'].description}
                    viewAllLink="/category/best-webtoon"
                  />
                  <ComicGrid 
                    mangaList={categorizedManga['best-webtoon']} 
                    onLoadMore={handleLoadMore}
                    hasMore={false}
                    limit={4} // عرض 4 عناصر فقط
                    showHeader={false}
                  />
                </div>
              </section>
            )}

            {/* قسم Golden Week */}
            {categorizedManga['golden-week'].length > 0 && (
              <section className="py-12 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                  <SectionTitle 
                    title={category['golden-week'].title}
                    description={category['golden-week'].description}
                    viewAllLink="/category/golden-week"
                  />
                  <ComicGrid 
                    mangaList={categorizedManga['golden-week']} 
                    onLoadMore={handleLoadMore}
                    hasMore={false}
                    limit={4}
                    showHeader={false}
                  />
                </div>
              </section>
            )}

            {/* قسم New Releases */}
            {categorizedManga['new-releases'].length > 0 && (
              <section className="py-12 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                  <SectionTitle 
                    title={category['new-releases'].title}
                    description={category['new-releases'].description}
                    viewAllLink="/category/new-releases"
                  />
                  <ComicGrid 
                    mangaList={categorizedManga['new-releases']} 
                    onLoadMore={handleLoadMore}
                    hasMore={false}
                    limit={4}
                    showHeader={false}
                  />
                </div>
              </section>
            )}


{/* قسم جميع المانجا */}
<section className="py-12 bg-gray-50 dark:bg-gray-800">
  <div className="container mx-auto px-4">
    <SectionTitle 
      title="جميع المانجا"
      description="استكشف مكتبتنا الكاملة من المانجا والويبتون"
      viewAllLink="/browse"
    />
    <ComicGrid 
      mangaList={mockManga} 
      onLoadMore={handleLoadMore}
      hasMore={mockManga.length > 12}
      limit={8}
      showHeader={false}
    />
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