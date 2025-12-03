'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockManga } from '@/data/mockManga';
import { Manga } from '@/types/manga';
import { useStorage } from '@/hooks/useStorage';
import { Header } from '@/components/Header'; 
import { 
  FaBookOpen, FaStar, FaUser, FaClock, FaLayerGroup, 
  FaSearch, FaSortAmountDown, FaSortAmountUp, FaHeart, FaRegHeart 
} from 'react-icons/fa';

export default function MangaDetail() {
  const params = useParams();
  const router = useRouter();
  
  const { toggleBookmark, isBookmarked } = useStorage();

  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const id = params.id as string;
    const foundManga = mockManga.find(m => m.id === id);
    
    if (foundManga) {
      setManga(foundManga);
      setIsFav(isBookmarked(foundManga.id));
    } else {
      setTimeout(() => router.push('/'), 2000);
    }
    setLoading(false);
  }, [params.id, router, isBookmarked]);

  const handleBookmark = () => {
    if (manga) {
      toggleBookmark(manga);
      setIsFav(!isFav);
    }
  };

  const filteredChapters = useMemo(() => {
    if (!manga) return [];
    let chapters = Array.from({ length: manga.chapterCount }, (_, i) => i + 1);
    if (sortOrder === 'desc') chapters.reverse();
    if (searchQuery) {
      chapters = chapters.filter(num => num.toString().includes(searchQuery));
    }
    return chapters;
  }, [manga, sortOrder, searchQuery]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">جاري التحميل...</div>;
  if (!manga) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      
      <Header />

      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-lg opacity-60 dark:opacity-40 scale-110 transform transition-transform duration-700"
          style={{ backgroundImage: `url(${manga.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-50 dark:to-gray-900" />
      </div>

      <div className="container mx-auto px-4 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Column */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-64 md:w-80 group perspective">
            <div className="aspect-[2/3] relative rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800 transform transition-transform duration-500 hover:scale-[1.02]">
              <img 
                src={manga.imageUrl} 
                alt={manga.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 bg-gray-800 flex items-center justify-center flex-col text-white">
                 <span className="text-4xl mb-2">📖</span>
                 <span className="text-sm font-bold text-center px-2">{manga.title}</span>
              </div>
              <div className="absolute top-3 left-3">
                 <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                    manga.status === 'ongoing' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'
                  }`}>
                    {manga.status === 'ongoing' ? 'مستمرة' : 'مكتملة'}
                  </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {/* زر القراءة: أضفنا mangaId للرابط */}
              <Link 
                href={`/read/1?mangaId=${manga.id}`} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <FaBookOpen className="text-lg" />
                <span>ابدأ القراءة</span>
              </Link>

              <button 
                onClick={handleBookmark}
                className={`w-full font-bold py-3.5 px-6 rounded-xl shadow-md border transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                  isFav 
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-red-500 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                {isFav ? <FaHeart className="text-xl animate-pulse" /> : <FaRegHeart className="text-xl" />}
                <span>{isFav ? 'تمت الإضافة للمفضلة' : 'أضف للمفضلة'}</span>
              </button>
            </div>
          </div>

          {/* Manga Details */}
          <div className="flex-1 pt-4 md:pt-24 text-center md:text-right">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight drop-shadow-sm">
              {manga.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm font-medium">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <FaUser className="text-blue-500"/> 
                <span className="text-gray-700 dark:text-gray-300">{manga.author}</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <FaStar className="text-yellow-400 text-lg"/> 
                <span className="text-gray-900 dark:text-white font-bold">{manga.avgRating}</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <FaLayerGroup className="text-purple-500"/> 
                <span className="text-gray-700 dark:text-gray-300">{manga.chapterCount} فصل</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
              {manga.genres.map(genre => (
                <span key={genre} className="px-3 py-1 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors cursor-default border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                  {genre}
                </span>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 text-right">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                القصة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {manga.description}
              </p>
            </div>

            {/* Chapters List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaClock className="text-blue-500" /> الفصول
                </h3>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <input 
                      type="text" 
                      placeholder="ابحث عن رقم..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                  
                  <button 
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                    title="ترتيب"
                  >
                    {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  </button>
                </div>
              </div>
              
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredChapters.length > 0 ? (
                  filteredChapters.map((chapterNum) => (
                    <Link 
                      key={chapterNum} 
                      // رابط الفصل: أضفنا mangaId
                      href={`/read/${chapterNum}?mangaId=${manga.id}`} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          {chapterNum}
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          الفصل {chapterNum}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono hidden sm:block">
                        منذ 2 يوم
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>لا توجد فصول تطابق بحثك "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}