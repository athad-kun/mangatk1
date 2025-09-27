export interface Manga {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  chapterCount: number; // تغيير من string إلى number
  avgRating: number;
  genres: string[];
  status: 'ongoing' | 'completed';
  lastUpdated: string;
  author: string;
  views: number;
  category: string;
}