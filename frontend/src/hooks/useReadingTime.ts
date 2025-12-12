'use client';

import { useState, useEffect } from 'react';

export function useReadingTime(isActive: boolean) {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        // قراءة الوقت الحالي
        const currentTotal = parseInt(localStorage.getItem('total_reading_seconds') || '0');
        // إضافة ثانية واحدة
        localStorage.setItem('total_reading_seconds', (currentTotal + 1).toString());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);
}

// دالة مساعدة لتحويل الثواني إلى (يوم، ساعة، دقيقة)
export function formatReadingTime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return { days, hours, minutes };
}