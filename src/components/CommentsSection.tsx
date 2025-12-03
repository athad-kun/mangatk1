'use client';

import { useState, useEffect } from 'react';
import { FaPaperPlane, FaUserCircle, FaThumbsUp, FaThumbsDown, FaReply } from 'react-icons/fa';
// 1. استيراد الدوال والألوان الخاصة بالإنجازات
import { getAchievementById, RARITY_COLORS } from '@/data/achievements';

interface Comment {
  id: number;
  user: string;
  avatar?: string;
  text: string;
  time: string;
  votes: number;
  isNew?: boolean;
  userVote?: 'up' | 'down' | null;
  replies: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  { 
    id: 1, 
    user: "Otaku_Sama", 
    text: "يا إلهي! هذا الفصل كان مجنوناً 🔥🔥", 
    time: "منذ 2 ساعة", 
    votes: 45, 
    replies: [] 
  },
  { 
    id: 2, 
    user: "MangaLover99", 
    text: "الرسم في الصفحة الأخيرة أسطوري! لا أطيق انتظار الفصل القادم.", 
    time: "منذ 5 ساعات", 
    votes: 120,
    replies: [
      {
        id: 101,
        user: "Admin",
        text: "نتفق معك! الرسام أبدع في هذا الفصل.",
        time: "منذ 4 ساعات",
        votes: 10,
        replies: []
      }
    ]
  },
  { 
    id: 3, 
    user: "GhostReader", 
    text: "هل لاحظ أحدكم التفصيل الصغير في الخلفية؟ 👀", 
    time: "منذ يوم", 
    votes: 12, 
    replies: [] 
  },
];

export function CommentsSection({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  // حالة لتخزين اللقب المجهز للمستخدم الحالي
  const [myEquippedTitle, setMyEquippedTitle] = useState<string | null>(null);

  useEffect(() => {
    // تحميل التعليقات
    const localKey = `comments_${chapterId}`;
    const saved = localStorage.getItem(localKey);
    let allComments = saved ? JSON.parse(saved) : [...MOCK_COMMENTS];
    
    allComments = allComments.map((c: any) => ({
      ...c,
      replies: c.replies || []
    }));

    setComments(allComments);

    // تحميل اللقب المجهز من localStorage
    const titleId = localStorage.getItem('equipped_title');
    setMyEquippedTitle(titleId);

  }, [chapterId]);

  const saveToLocal = (updatedList: Comment[]) => {
    setComments(updatedList);
    const localKey = `comments_${chapterId}`;
    const userOnly = updatedList.filter(c => c.isNew || c.replies.some(r => r.isNew) || c.userVote);
    localStorage.setItem(localKey, JSON.stringify(userOnly));
  };

  const handleVote = (commentId: number, type: 'up' | 'down', isReply = false, parentId?: number) => {
    const updateVoteForList = (list: Comment[]): Comment[] => {
      return list.map(comment => {
        if (comment.id === commentId) {
          let newVotes = comment.votes;
          let newStatus = comment.userVote;

          if (newStatus === type) {
            newVotes -= (type === 'up' ? 1 : -1);
            newStatus = null;
          } else {
            if (newStatus === 'up' && type === 'down') newVotes -= 2;
            else if (newStatus === 'down' && type === 'up') newVotes += 2;
            else newVotes += (type === 'up' ? 1 : -1);
            newStatus = type;
          }
          return { ...comment, votes: newVotes, userVote: newStatus };
        }
        
        if (comment.replies.length > 0) {
          return { ...comment, replies: updateVoteForList(comment.replies) };
        }
        return comment;
      });
    };

    saveToLocal(updateVoteForList(comments));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      user: "أنت",
      text: newComment,
      time: "الآن",
      votes: 0,
      isNew: true,
      replies: []
    };

    saveToLocal([comment, ...comments]);
    setNewComment('');
  };

  const submitReply = (parentId: number) => {
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: Date.now(),
      user: "أنت",
      text: replyText,
      time: "الآن",
      votes: 0,
      isNew: true,
      replies: []
    };

    const updatedComments = comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...c.replies, newReply] };
      }
      return c;
    });

    saveToLocal(updatedComments);
    setActiveReplyId(null);
    setReplyText('');
  };

  const sortedComments = [...comments].sort((a, b) => b.votes - a.votes);

  // مكون فرعي لعرض التعليق
  const CommentItem = ({ data, isReply = false, parentId }: { data: Comment, isReply?: boolean, parentId?: number }) => {
    // التحقق مما إذا كان هذا التعليق يخص المستخدم الحالي وله لقب مجهز
    let displayTitle = null;
    if (data.user === 'أنت' && myEquippedTitle) {
        displayTitle = getAchievementById(myEquippedTitle);
    }

    return (
      <div className={`flex gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isReply ? 'mr-12 mt-3 p-3 bg-gray-800/30 rounded-lg border-r-2 border-gray-700' : 'p-4 bg-blue-900/5 rounded-xl border border-gray-800'}`}>
        
        <div className="flex-shrink-0">
          {data.isNew ? (
              <div className={`rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg ${isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10'}`}>أ</div>
          ) : (
              <FaUserCircle className={`text-gray-600 ${isReply ? 'text-3xl' : 'text-4xl'}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
                <h4 className={`font-bold truncate ${data.isNew ? 'text-blue-400' : 'text-gray-300'} ${isReply ? 'text-sm' : 'text-base'}`}>
                {data.user}
                </h4>
                
                {/* 2. عرض اللقب (الوسام) هنا */}
                {displayTitle && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${RARITY_COLORS[displayTitle.rarity]} bg-clip-text text-transparent w-fit -mt-0.5`}>
                        {displayTitle.title}
                    </span>
                )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{data.time}</span>
          </div>
          
          <p className={`text-gray-400 leading-relaxed mb-3 break-words ${isReply ? 'text-xs' : 'text-sm'}`}>{data.text}</p>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => handleVote(data.id, 'up', isReply, parentId)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${data.userVote === 'up' ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
            >
                <FaThumbsUp />
                <span>{data.votes}</span>
            </button>
            
            <button 
                onClick={() => handleVote(data.id, 'down', isReply, parentId)}
                className={`flex items-center gap-1 text-xs transition-colors ${data.userVote === 'down' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
                <FaThumbsDown />
            </button>

            {!isReply && (
              <button 
                  onClick={() => {
                      setActiveReplyId(activeReplyId === data.id ? null : data.id);
                      setReplyText('');
                  }}
                  className={`text-xs flex items-center gap-1 transition-colors ${activeReplyId === data.id ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
              >
                  <FaReply /> رد
              </button>
            )}
          </div>

          {activeReplyId === data.id && !isReply && (
              <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`الرد على ${data.user}...`}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      autoFocus
                  />
                  <button 
                      onClick={() => submitReply(data.id)}
                      disabled={!replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                      إرسال
                  </button>
              </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 p-4 md:p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        التعليقات <span className="text-sm bg-blue-600 px-2 py-0.5 rounded-full">{comments.reduce((acc, curr) => acc + 1 + curr.replies.length, 0)}</span>
      </h3>

      <form onSubmit={handleSubmit} className="mb-10 relative">
        <div className="flex gap-4">
          <div className="mt-1 hidden sm:block">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">أ</div>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="شاركنا رأيك..."
              className="w-full bg-gray-800 text-gray-200 rounded-xl p-4 pr-12 min-h-[100px] border border-gray-700 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="absolute bottom-3 left-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="flex flex-col">
            <CommentItem data={comment} />
            {comment.replies && comment.replies.length > 0 && (
                <div className="flex flex-col border-l-2 border-gray-800 mr-5 mt-1">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} data={reply} isReply={true} parentId={comment.id} />
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}