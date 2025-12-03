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
// تعريف شكل بيانات الفصل
export interface Chapter {
  id: string;
  mangaId: string;
  title: string;
  number: number;
  releaseDate?: string;
}

// تعريف فلاتر البحث
export interface FilterState {
  query?: string;
  status?: string;
  categories?: string[];
  sortBy?: 'name' | 'latest' | 'popular' | 'rating';
}