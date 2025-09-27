// data/mockManga.ts
import { Manga } from '@/types/manga';

export const category = {
  'best-webtoon': {
    title: 'Best Webtoon',
    description: 'أفضل المانغا والويبتون حسب التقييمات'
  },
  'golden-week': {
    title: 'Golden Week',
    description: 'مانغا الأسبوع الذهبي الأكثر شهرة'
  },
  'new-releases': {
    title: 'New Releases',
    description: 'أحدث الإصدارات والمانغا الجديدة'
  }
};

// قائمة التصنيفات للفلتر
export const categories = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life'
];

export const mockManga: Manga[] = [
  {
    id: '1',
    title: 'One Piece',
    description: 'Adventure manga about pirates',
    imageUrl: '/images/one-pice.jpg', // تصحيح اسم الملف
    chapterCount: 1100,
    avgRating: 4.8,
    genres: ['Action', 'Adventure', 'Comedy'],
    status: 'ongoing',
    lastUpdated: '2024-01-01',
    author: 'Eiichiro Oda',
    views: 5000000,
    category: 'best-webtoon' // تصحيح التصنيف
  },
  {
    id: '2',
    title: 'Naruto',
    description: 'Ninja adventure story',
    imageUrl: '/images/naroto1.webp', // تصحيح اسم الملف
    chapterCount: 700, // تصحيح العدد
    avgRating: 4.7,
    genres: ['Action', 'Adventure', 'Fantasy'],
    status: 'completed',
    lastUpdated: '2023-12-01',
    author: 'Masashi Kishimoto',
    views: 4500000,
    category: 'best-webtoon'
  },
  {
    id: '3',
    title: 'Childhood Friend of the Zenith',
    description: 'Humanity fights giant humanoid creatures',
    imageUrl: '/images/ch.jpg',
    chapterCount: 139,
    avgRating: 3.9,
    genres: ['Action', 'Drama', 'Fantasy'],
    status: 'completed',
    lastUpdated: '2023-11-01',
    author: 'Hajime Isayama',
    views: 4000000,
    category: 'golden-week'
  },
  {
    id: '4',
    title: 'الخطايا السبع',
    description: 'Adventure manga about 7 deadly sins',
    imageUrl: '/images/mal.jpg',
    chapterCount: 400,
    avgRating: 4.5,
    genres: ['Action', 'Adventure', 'Comedy'],
    status: 'ongoing',
    lastUpdated: '2024-01-01',
    author: 'Eiichiro Oda',
    views: 5033,
    category: 'golden-week'
  },
  {
    id: '5',
    title: 'How to Get My Husband on My Side',
    description: 'Romance manhwa about lord of north',
    imageUrl: '/images/69.webp',
    chapterCount: 120,
    avgRating: 5,
    genres: ['Romance', 'Slice of Life', 'Comedy'],
    status: 'ongoing',
    lastUpdated: '2024-01-01',
    author: 'Eiichiro Oda',
    views: 5033,
    category: 'golden-week'
  },
  {
    id: '6',
    title: 'Naruto Shippuden',
    description: 'A young orphan ninja who seeks recognition from his peers and dreams of becoming the Hokage',
    imageUrl: '/images/naroto.jpg', // تصحيح اسم الملف
    chapterCount: 700,
    avgRating: 4.8,
    genres: ['Adventure', 'Action', 'Comedy', 'Fantasy'],
    status: 'ongoing',
    lastUpdated: '2024-01-01',
    author: 'Masashi Kishimoto',
    views: 9539, // إضافة فاصلة
    category: 'golden-week'
  },
  {
    id: '7', // تغيير ID لتجنب التكرار
    title: 'Attack on Titan',
    description: 'معركة البشر ضد العمالقة العملاقة',
    imageUrl: '/images/aot.jpg',
    chapterCount: 139,
    avgRating: 4.9,
    genres: ['Action', 'Drama', 'Fantasy'],
    status: 'completed',
    lastUpdated: '2023-11-01',
    author: 'Hajime Isayama',
    views: 4000000,
    category: 'golden-week'
  },
  {
    id: '8',
    title: 'Demon Slayer',
    description: 'قصة الصبي الذي يصبح صائد شياطين لينقذ أخته',
    imageUrl: '/images/demon-slayer.jpg',
    chapterCount: 205,
    avgRating: 4.8,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    status: 'completed',
    lastUpdated: '2024-01-10',
    author: 'Koyoharu Gotouge',
    views: 3500000,
    category: 'golden-week'
  },
  {
    id: '9',
    title: 'My Hero Academia',
    description: 'في عالم الأبطال الخارقين، شاب بلا قدرات يحلم بأن يصبح بطلاً',
    imageUrl: '/images/my-hero.jpg',
    chapterCount: 410,
    avgRating: 4.6,
    genres: ['Action', 'Superhero', 'School'],
    status: 'ongoing',
    lastUpdated: '2024-01-12',
    author: 'Kohei Horikoshi',
    views: 3000000,
    category: 'new-releases'
  },
  {
    id: '10',
    title: 'Jujutsu Kaisen',
    description: 'معركة ضد اللعنات باستخدام تقنيات الجوجوتسو',
    imageUrl: '/images/jujutsu.jpg',
    chapterCount: 250,
    avgRating: 4.7,
    genres: ['Action', 'Supernatural', 'Horror'],
    status: 'ongoing',
    lastUpdated: '2024-01-14',
    author: 'Gege Akutami',
    views: 3200000,
    category: 'new-releases',
  }
];