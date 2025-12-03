'use client';

import { useState, useEffect } from 'react';
import { ALL_ACHIEVEMENTS, Achievement } from '@/data/achievements';
import { useStorage } from './useStorage';

export function useAchievements() {
  const { history, bookmarks } = useStorage();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    // 1. تحميل الإنجازات المحفوظة مسبقاً
    const saved = localStorage.getItem('unlocked_achievements');
    const currentUnlocked = saved ? JSON.parse(saved) : [];
    setUnlockedIds(currentUnlocked);

    // 2. تجميع الإحصائيات الحالية للمستخدم
    const stats = {
      readingCount: history.length,
      favCount: bookmarks.length,
      readingTime: parseInt(localStorage.getItem('total_reading_seconds') || '0'),
      commentCount: 0 // (سنحتاج لحسابها بشكل منفصل في تطبيق حقيقي)
    };

    // حساب عدد التعليقات (محاكاة بسيطة من اللوكال ستوريج)
    let totalComments = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('comments_')) {
            const comments = JSON.parse(localStorage.getItem(key) || '[]');
            totalComments += comments.filter((c: any) => c.user === 'أنت').length;
        }
    }
    stats.commentCount = totalComments;

    // 3. فحص الإنجازات الجديدة
    const newUnlockedIds = [...currentUnlocked];
    let newlyUnlockedItem: Achievement | null = null;

    ALL_ACHIEVEMENTS.forEach(ach => {
      if (newUnlockedIds.includes(ach.id)) return; // تم فتحه مسبقاً

      let unlocked = false;
      
      if (ach.category === 'reading' && stats.readingCount >= ach.threshold) unlocked = true;
      if (ach.category === 'time' && stats.readingTime >= ach.threshold) unlocked = true;
      if (ach.category === 'collection' && stats.favCount >= ach.threshold) unlocked = true;
      if (ach.category === 'social' && stats.commentCount >= ach.threshold) unlocked = true;
      
      // الإنجازات السرية (منطق خاص)
      if (ach.id === 'secret_night') {
          const hour = new Date().getHours();
          if (hour >= 3 && hour < 5 && history.length > 0) unlocked = true;
      }

      if (unlocked) {
        newUnlockedIds.push(ach.id);
        newlyUnlockedItem = ach; // نحتفظ بآخر واحد لعرضه كإشعار
      }
    });

    // 4. حفظ التحديثات إذا وجد جديد
    if (newUnlockedIds.length > currentUnlocked.length) {
      setUnlockedIds(newUnlockedIds);
      localStorage.setItem('unlocked_achievements', JSON.stringify(newUnlockedIds));
      if (newlyUnlockedItem) {
          setNewUnlock(newlyUnlockedItem);
          // إخفاء الإشعار بعد 5 ثواني
          setTimeout(() => setNewUnlock(null), 5000);
      }
    }

  }, [history.length, bookmarks.length]); // يعيد الفحص عند تغير السجل أو المفضلة

  return { unlockedIds, newUnlock, closeNotification: () => setNewUnlock(null) };
}