// src/hooks/useStorage.ts
'use client';

import { useState, useEffect, useCallback } from 'react'; // أضفنا useCallback
import { Manga } from '@/types/manga';

interface HistoryItem {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  imageUrl: string;
  timestamp: number;
}

export function useStorage() {
  const [bookmarks, setBookmarks] = useState<Manga[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // تحميل البيانات عند البدء
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookmarks = localStorage.getItem('manga_bookmarks');
      const savedHistory = localStorage.getItem('manga_history');
      
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // دالة المفضلة (تم تثبيتها بـ useCallback)
  const toggleBookmark = useCallback((manga: Manga) => {
    setBookmarks(prev => {
      const exists = prev.find((b) => b.id === manga.id);
      let newBookmarks;
      if (exists) {
        newBookmarks = prev.filter((b) => b.id !== manga.id);
      } else {
        newBookmarks = [...prev, manga];
      }
      localStorage.setItem('manga_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  // دالة التحقق (تم تثبيتها)
  const isBookmarked = useCallback((mangaId: string) => {
    return bookmarks.some((b) => b.id === mangaId);
  }, [bookmarks]);

  // دالة السجل (تم تثبيتها - هذا هو سبب المشكلة الرئيسية)
  const addToHistory = useCallback((manga: Manga, chapterId: string) => {
    setHistory(prev => {
      // التحقق: هل هذا الفصل هو آخر ما تم قراءته بالفعل؟ (لتجنب التكرار)
      if (prev.length > 0 && prev[0].mangaId === manga.id && prev[0].chapterId === chapterId) {
        return prev;
      }

      const newItem: HistoryItem = {
        mangaId: manga.id,
        mangaTitle: manga.title,
        imageUrl: manga.imageUrl,
        chapterId: chapterId,
        timestamp: Date.now(),
      };

      const newHistory = [
        newItem,
        ...prev.filter((h) => h.mangaId !== manga.id)
      ].slice(0, 20);

      localStorage.setItem('manga_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    bookmarks,
    history,
    toggleBookmark,
    isBookmarked,
    addToHistory
  };
}