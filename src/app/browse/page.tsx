'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ComicGrid } from '@/components/ComicGrid';
import { FilterSection } from '@/components/FilterSection';
import { Footer } from '@/components/Footer';
import { mockManga } from '@/data/mockManga';

interface Filters {
  query?: string;
  status?: string;
  categories?: string[];
}

export default function BrowsePage() {
  const [filteredManga, setFilteredManga] = useState(mockManga);
  const [sortBy, setSortBy] = useState('Name');
  const [currentFilters, setCurrentFilters] = useState<Filters>({});
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    let filtered = [...mockManga];
    
    if (currentFilters.query) {
      filtered = filtered.filter(manga => 
        manga.title.toLowerCase().includes(currentFilters.query?.toLowerCase() || '') ||
        manga.description.toLowerCase().includes(currentFilters.query?.toLowerCase() || '')
      );
    }
    
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
    
    if (currentFilters.categories && currentFilters.categories.length > 0) {
      filtered = filtered.filter(manga =>
        manga.genres.some(genre => currentFilters.categories?.includes(genre))
      );
    }

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
    setDisplayCount(12); // إعادة تعيين عند التصفية
  }, [currentFilters, sortBy]);

  const handleFilter = (filters: Filters) => {
    setCurrentFilters(filters);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  const displayedManga = filteredManga.slice(0, displayCount);
  const hasMore = displayCount < filteredManga.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20">
        {/* رأس الصفحة */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-green-200 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة للرئيسية
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">جميع المانجا</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              استكشف مكتبتنا الكاملة من المانجا والويبتون
            </p>
            <div className="mt-4 text-green-200">
              إجمالي {mockManga.length} مانجا متاحة
            </div>
          </div>
        </section>

        {/* أدوات التصفية */}
        <section className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <FilterSection onFilter={handleFilter} onSort={handleSort} />
          </div>
        </section>

        {/* نتائج المانجا */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                نتائج البحث ({filteredManga.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentFilters.query ? `بحث عن: "${currentFilters.query}"` : 'جميع المانجا'}
              </p>
            </div>
            
            <ComicGrid 
              mangaList={displayedManga}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              showHeader={false} limit={undefined}            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}