'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { formatReadingTime } from '@/hooks/useReadingTime';
import { useAchievements } from '@/hooks/useAchievements';
import { ALL_ACHIEVEMENTS, Achievement, RARITY_COLORS } from '@/data/achievements';
import { 
  FaUser, FaHeart, FaHistory, FaSignOutAlt, FaClock, 
  FaBook, FaDownload, FaCommentDots, FaReply, FaCheck, FaTrophy, FaLock 
} from 'react-icons/fa';
import { Link } from 'lucide-react';

// واجهة لبيانات الردود
interface ReplyNotification {
  chapterId: string;
  parentId: number;
  replyId: number;
  user: string;
  text: string;
  myCommentText: string;
}

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { bookmarks, history } = useStorage();
  const { unlockedIds } = useAchievements();
  const router = useRouter();

  // الاحصائيات
  const [readingTime, setReadingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const [totalChaptersInFav, setTotalChaptersInFav] = useState(0);
  const [recentFavCount, setRecentFavCount] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);

  // الإشعارات (الردود)
  const [replyNotifications, setReplyNotifications] = useState<ReplyNotification[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // اللقب المجهز
  const [equippedTitle, setEquippedTitle] = useState<Achievement | null>(null);

  // حماية الصفحة وجلب البيانات
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // 1. حساب وقت القراءة
      const seconds = parseInt(localStorage.getItem('total_reading_seconds') || '0');
      setReadingTime(formatReadingTime(seconds));

      // 2. حساب إجمالي فصول المفضلة
      const totalChapters = bookmarks.reduce((acc, manga) => acc + manga.chapterCount, 0);
      setTotalChaptersInFav(totalChapters);

      // 3. حساب المانجا المضافة هذا الشهر (محاكاة)
      setRecentFavCount(Math.ceil(bookmarks.length * 0.3));
      
      // 4. عدد التحميلات (محاكاة)
      setDownloadedCount(15);

      // 5. البحث عن الردود
      scanForReplies();

      // 6. تحميل اللقب المجهز
      const titleId = localStorage.getItem('equipped_title');
      if (titleId) {
        const foundTitle = ALL_ACHIEVEMENTS.find(a => a.id === titleId);
        if (foundTitle) setEquippedTitle(foundTitle);
      }
    }
  }, [user, authLoading, router, bookmarks]);

  // دالة البحث عن الردود
  const scanForReplies = () => {
    const notifications: ReplyNotification[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('comments_')) {
        const chapterId = key.split('_')[1];
        const comments = JSON.parse(localStorage.getItem(key) || '[]');
        
        comments.forEach((comment: any) => {
          if (comment.user === 'أنت' && comment.replies && comment.replies.length > 0) {
            comment.replies.forEach((reply: any) => {
               if (reply.user !== 'أنت') {
                 notifications.push({
                   chapterId,
                   parentId: comment.id,
                   replyId: reply.id,
                   user: reply.user,
                   text: reply.text,
                   myCommentText: comment.text
                 });
               }
            });
          }
        });
      }
    }
    setReplyNotifications(notifications);
  };

  // دالة الرد السريع
  const handleQuickReply = (notif: ReplyNotification) => {
    if (!replyText.trim()) return;

    const localKey = `comments_${notif.chapterId}`;
    const allComments = JSON.parse(localStorage.getItem(localKey) || '[]');

    const newReply = {
      id: Date.now(),
      user: "أنت",
      text: replyText,
      time: "الآن",
      votes: 0,
      isNew: true,
      replies: []
    };

    const updatedComments = allComments.map((c: any) => {
      if (c.id === notif.parentId) {
        return { ...c, replies: [...c.replies, newReply] };
      }
      return c;
    });

    localStorage.setItem(localKey, JSON.stringify(updatedComments));
    setReplyNotifications(prev => prev.filter(n => n.replyId !== notif.replyId));
    setActiveReplyId(null);
    setReplyText('');
    alert('تم إرسال ردك بنجاح! ✅');
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg relative">
               {user.name[0].toUpperCase()}
               {/* علامة صغيرة إذا كان هناك لقب */}
               {equippedTitle && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أهلاً، {user.name} 👋</h1>
               
               {/* عرض اللقب المختار */}
               {equippedTitle && (
                 <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1 bg-gradient-to-r ${RARITY_COLORS[equippedTitle.rarity]} shadow-sm animate-in fade-in slide-in-from-left-2`}>
                   {equippedTitle.title}
                 </div>
               )}
               
               <p className="text-gray-500 dark:text-gray-400 text-sm">هذه نظرة عامة على نشاطك</p>
             </div>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2 font-bold">
            <FaSignOutAlt /> <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>

        {/* الشبكة الرئيسية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* العمود العريض (الإحصائيات + الإنجازات) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. نظرة عامة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FaClock className="text-blue-500" /> نظرة عامة & وقت القراءة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <p className="text-blue-100 text-sm mb-1">إجمالي الوقت</p>
                    <div className="flex items-baseline gap-1 mt-2">
                       <span className="text-3xl font-black">{readingTime.days}</span> <span className="text-xs opacity-70">يوم</span>
                       <span className="text-3xl font-black ml-2">{readingTime.hours}</span> <span className="text-xs opacity-70">س</span>
                       <span className="text-3xl font-black ml-2">{readingTime.minutes}</span> <span className="text-xs opacity-70">د</span>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-700 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-gray-500 dark:text-gray-400 text-sm">المفضلة</p>
                       <FaHeart className="text-red-500 text-xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookmarks.length}</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><FaCheck /> {recentFavCount} جديدة</p>
                 </div>
                 <div className="bg-white dark:bg-gray-700 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-gray-500 dark:text-gray-400 text-sm">الفصول</p>
                       <FaHistory className="text-purple-500 text-xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{history.length}</p>
                    <p className="text-xs text-gray-400 mt-1">استمر بالقراءة! 🔥</p>
                 </div>
              </div>
            </div>

            {/* 2. إحصائيات المكتبة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl"><FaBook /></div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">مكتبة الفصول</p>
                        <h3 className="font-bold text-gray-900 dark:text-white">إجمالي الفصول المتاحة</h3>
                     </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{totalChaptersInFav}</p>
               </div>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl"><FaDownload /></div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">التحميلات</p>
                        <h3 className="font-bold text-gray-900 dark:text-white">فصول تم تحميلها</h3>
                     </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{downloadedCount}</p>
               </div>
            </div>

            {/* 3. قسم الإنجازات */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <FaTrophy className="text-yellow-500" /> قاعة الإنجازات
                 </h2>
                 <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                    {unlockedIds.length} / {ALL_ACHIEVEMENTS.length} مكتمل
                 </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {ALL_ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = unlockedIds.includes(ach.id);
                    const isEquipped = equippedTitle?.id === ach.id;

                    return (
                       <div 
                         key={ach.id} 
                         onClick={() => {
                            if (isUnlocked) {
                               localStorage.setItem('equipped_title', ach.id);
                               setEquippedTitle(ach);
                               alert(`تم تجهيز اللقب: "${ach.title}" بنجاح!`);
                            }
                         }}
                         className={`relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 group ${
                            isUnlocked 
                            ? `cursor-pointer bg-gradient-to-b from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:-translate-y-1 ${isEquipped ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-500/10' : 'border-yellow-200 dark:border-yellow-900/30 hover:border-blue-400'}`
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 opacity-60 grayscale cursor-not-allowed'
                         }`}
                       >
                          {/* علامة المستخدم */}
                          {isEquipped && (
                             <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                               مُستخدم
                             </div>
                          )}

                          {/* الأيقونة */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 transition-transform duration-300 ${
                             isUnlocked 
                             ? `bg-gradient-to-br ${RARITY_COLORS[ach.rarity]} text-white shadow-md group-hover:scale-110`
                             : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}>
                             {isUnlocked ? <ach.icon /> : <FaLock />}
                          </div>

                          {/* النصوص */}
                          <h3 className={`font-bold text-xs mb-1 ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                             {ach.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 leading-tight">
                             {ach.secret && !isUnlocked ? '؟؟؟ (إنجاز سري)' : ach.description}
                          </p>

                          {/* تلميح "اضغط للتجهيز" */}
                          {isUnlocked && !isEquipped && (
                             <div className="mt-3 text-[9px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                               اضغط لتضعه كلقب
                             </div>
                          )}

                          {!isUnlocked && !ach.secret && (
                             <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-yellow-500/50" style={{ width: '20%' }}></div>
                             </div>
                          )}
                       </div>
                    );
                 })}
              </div>
            </div>

          </div>

          {/* العمود الجانبي (الإشعارات والردود) */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col sticky top-24">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <FaCommentDots className="text-blue-500" /> الردود الجديدة
                     {replyNotifications.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{replyNotifications.length}</span>}
                   </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-4 custom-scrollbar">
                   {replyNotifications.length === 0 ? (
                      <div className="text-center py-10 opacity-50">
                         <FaCommentDots className="text-4xl mx-auto mb-2 text-gray-400" />
                         <p className="text-sm text-gray-500">لا توجد ردود جديدة حالياً</p>
                      </div>
                   ) : (
                      replyNotifications.map((notif) => (
                         <div key={notif.replyId} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                               <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{notif.user}</span>
                               <span className="text-[10px] bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-500">فصل {notif.chapterId}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2 border-r-2 border-gray-300 pr-2 line-clamp-1">رداً على: "{notif.myCommentText}"</p>
                            <p className="text-gray-800 dark:text-gray-200 text-sm mb-3">{notif.text}</p>

                            {activeReplyId === notif.replyId ? (
                               <div className="mt-2 animate-in fade-in">
                                  <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="اكتب ردك هنا..."
                                    className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600 mb-2 outline-none focus:border-blue-500"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                     <button onClick={() => handleQuickReply(notif)} className="flex-1 bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700">إرسال</button>
                                     <button onClick={() => setActiveReplyId(null)} className="px-3 bg-gray-200 dark:bg-gray-600 text-xs rounded hover:bg-gray-300">إلغاء</button>
                                  </div>
                               </div>
                            ) : (
                               <div className="flex gap-2">
                                  <button onClick={() => setActiveReplyId(notif.replyId)} className="flex items-center gap-1 text-xs text-blue-500 font-bold hover:underline">
                                    <FaReply /> رد سريع
                                  </button>
                                  <Link href={`/read/${notif.chapterId}`} className="text-xs text-gray-400 hover:text-gray-200">الذهاب للفصل</Link>
                               </div>
                            )}
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}