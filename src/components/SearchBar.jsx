// components/SearchBar.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { mockManga } from '@/data/mockManga'; // استيراد بيانات المانجا

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length > 2) {
      const filtered = mockManga.filter(manga =>
        manga.title.toLowerCase().includes(query.toLowerCase()) ||
        manga.author.toLowerCase().includes(query.toLowerCase()) ||
        manga.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن مانجا، مؤلف، أو تصنيف..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-64 lg:w-80 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <ul className="py-2">
            {results.map((manga) => (
              <li key={manga.id}>
                <Link 
                  href={`/manga/${manga.id}`} 
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <img 
                    src={manga.imageUrl} 
                    alt={manga.title} 
                    className="w-8 h-12 mr-3 object-cover rounded" 
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{manga.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{manga.author}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.length > 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
            لا توجد نتائج لـ "{query}"
          </div>
        </div>
      )}
    </div>
  );
}