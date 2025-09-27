'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaSun, FaMoon, FaUser  } from 'react-icons/fa';
import { SearchBar } from './SearchBar';

 // تأكد من المسار الصحيح

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Placeholder for auth
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50" role="banner" aria-label="Main header">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo & Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">MangaTK</Link>
          <nav aria-label="Main navigation">
            <ul className="flex space-x-6">
              {['Home', 'Manga List', 'Latest', 'Categories'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* SearchBar Component */}
        <SearchBar />

        {/* Theme & Auth */}
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className="p-2">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          {isLoggedIn ? (
            <span className="text-gray-700 dark:text-gray-300">Username</span>
          ) : (
            <>
              <Link href="/login" className="text-blue-600">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}