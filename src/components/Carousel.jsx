'use client';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { mockManga } from '../data/mockManga';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Carousel() {
  const [current, setCurrent] = useState(0);
  const featured = mockManga.slice(0, 5);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % featured.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + featured.length) % featured.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <section 
      className="relative bg-gray-100 dark:bg-gray-800 overflow-hidden mx-auto w-[1080px] h-[400px]"
      aria-label="Featured manga carousel" 
      role="region"
    >
      <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {featured.map((manga, idx) => (
          <div key={manga.id} className="w-full h-full flex-shrink-0 relative" data-aos="fade-right" data-aos-delay={idx * 100}>
            {/* إضافة Link حول المحتوى كاملاً */}
            <Link href={`/manga/${manga.id}`} className="block w-full h-full">
              {/* حاوية الصورة */}
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 relative cursor-pointer">
                <img 
                  src={manga.imageUrl} 
                  alt={manga.title} 
                  className="w-full h-full object-cover" // ملء كامل للحاوية
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                
                {/* بديل إذا فشلت الصورة */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-col"
                  style={{display: 'none'}}
                >
                  <span className="text-6xl mb-3">📖</span>
                  <span className="text-xl font-bold">{manga.title}</span>
                </div>
              </div>
              
              {/* Overlay مع المعلومات */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{manga.title}</h2>
                <p className="text-sm mb-2 line-clamp-2">{manga.description}</p>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="flex items-center">⭐ {manga.avgRating}/5</span>
                  <span>|</span>
                  <span>الفصول: {manga.chapterCount}</span>
                  <span>|</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${manga.status === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {manga.status === 'ongoing' ? 'مستمرة' : 'مكتملة'}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
        aria-label="الصورة السابقة"
      >
        <FaChevronLeft size={20} />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
        aria-label="الصورة التالية"
      >
        <FaChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {featured.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)} 
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              current === idx ? 'bg-white scale-110' : 'bg-gray-400 hover:bg-gray-300'
            }`} 
            aria-label={`انتقل إلى شريحة ${idx + 1}`} 
          />
        ))}
      </div>

      {/* رقم الشريحة الحالية */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
        {current + 1} / {featured.length}
      </div>
    </section>
  );
}