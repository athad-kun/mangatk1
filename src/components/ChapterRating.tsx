'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface ChapterRatingProps {
  mangaId: string;
  chapterId: string;
  currentMangaRating: number;
}

export function ChapterRating({ mangaId, chapterId, currentMangaRating }: ChapterRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // لتأثير التمرير
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newMangaRating, setNewMangaRating] = useState(currentMangaRating);

  useEffect(() => {
    const savedRating = localStorage.getItem(`rating_${mangaId}_${chapterId}`);
    if (savedRating) {
      setRating(parseFloat(savedRating));
      setIsSubmitted(true);
    }
  }, [mangaId, chapterId]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRating(val);
    setIsSubmitted(false);
  };

  // دالة جديدة: التعامل مع النقر على النجوم مباشرة
  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    localStorage.setItem(`rating_${mangaId}_${chapterId}`, rating.toString());
    
    const oldVoteCount = 100;
    const totalScore = currentMangaRating * oldVoteCount;
    const newAvg = (totalScore + rating) / (oldVoteCount + 1);
    
    setNewMangaRating(parseFloat(newAvg.toFixed(2)));
    setIsSubmitted(true);
  };

  // تحديث دالة رسم النجوم لتصبح تفاعلية
  const renderStars = () => {
    const stars = [];
    // نستخدم hoverRating للعرض إذا كان المستخدم يمرر الماوس، وإلا نستخدم rating الفعلي
    const displayRating = hoverRating > 0 ? hoverRating : rating;

    for (let i = 1; i <= 5; i++) {
      let StarIcon = FaRegStar; // الافتراضي فارغة
      let colorClass = "text-gray-600"; // لون الافتراضي

      if (displayRating >= i) {
        StarIcon = FaStar;
        colorClass = "text-yellow-400";
      } else if (displayRating >= i - 0.5) {
        StarIcon = FaStarHalfAlt;
        colorClass = "text-yellow-400";
      }

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)} // عند النقر تصبح القيمة i (مثلاً 5)
          onMouseEnter={() => setHoverRating(i)} // عند التمرير
          onMouseLeave={() => setHoverRating(0)} // عند المغادرة
          className={`text-3xl md:text-4xl transition-transform duration-200 hover:scale-125 focus:outline-none ${colorClass}`}
        >
          <StarIcon />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-xl text-center">
      <h3 className="text-xl font-bold text-white mb-2">ما تقييمك لهذا الفصل؟</h3>
      <p className="text-sm text-gray-400 mb-6">رأيك يؤثر مباشرة على تصنيف المانجا</p>

      {/* عرض النجوم التفاعلية */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
          {renderStars()}
        </div>
        
        {/* عرض الرقم */}
        <div className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 min-h-[40px]">
          {(hoverRating > 0 ? hoverRating : rating).toFixed(1)}
        </div>
      </div>

      {/* شريط التقييم (للتعديل الدقيق بالأعشار) */}
      <div className="relative w-full max-w-md mx-auto mb-8 group">
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={rating}
          onChange={handleSliderChange}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300 transition-all"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1 font-mono">
           <span>0.0</span>
           <span>1.0</span>
           <span>2.0</span>
           <span>3.0</span>
           <span>4.0</span>
           <span>5.0</span>
        </div>
      </div>

      {/* زر الحفظ */}
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:-translate-y-1"
        >
          أرسل التقييم
        </button>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500 bg-green-500/10 border border-green-500/30 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-green-400 font-bold mb-1">تم احتساب تقييمك! ✅</p>
          <p className="text-sm text-gray-300">
            أصبح تقييم المانجا العام: 
            <span className={`mx-2 font-bold ${newMangaRating > currentMangaRating ? 'text-green-400' : 'text-red-400'}`}>
              {newMangaRating}
            </span>
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-xs text-gray-500 hover:text-white mt-2 underline"
          >
            تعديل التقييم
          </button>
        </div>
      )}
    </div>
  );
}