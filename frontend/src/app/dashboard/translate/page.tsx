'use client';

import { useState, useEffect } from 'react';
import { FaLanguage, FaBook, FaImages, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Manga {
    id: string;
    title: string;
}

interface Chapter {
    id: string;
    number: number;
    title: string;
}

interface ChapterImage {
    id: string;
    image_url: string;
    page_number: number;
}

export default function TranslatePage() {
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [selectedManga, setSelectedManga] = useState<string>('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [images, setImages] = useState<ChapterImage[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch manga list
    useEffect(() => {
        async function fetchManga() {
            try {
                const res = await fetch(`${API_URL}/manga/`);
                const data = await res.json();
                setMangaList(Array.isArray(data) ? data : data.results || []);
            } catch (error) {
                console.error('Error fetching manga:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchManga();
    }, []);

    // Fetch chapters when manga selected
    useEffect(() => {
        if (!selectedManga) {
            setChapters([]);
            return;
        }

        async function fetchChapters() {
            try {
                const res = await fetch(`${API_URL}/manga/${selectedManga}/`);
                const data = await res.json();
                setChapters(data.chapters || []);
            } catch (error) {
                console.error('Error fetching chapters:', error);
            }
        }
        fetchChapters();
    }, [selectedManga]);

    // Fetch images when chapter selected
    useEffect(() => {
        if (!selectedChapter) {
            setImages([]);
            return;
        }

        async function fetchImages() {
            try {
                const res = await fetch(`${API_URL}/chapters/${selectedChapter}/`);
                const data = await res.json();
                setImages(data.images || []);
                setCurrentImageIndex(0);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        }
        fetchImages();
    }, [selectedChapter]);

    const currentImage = images[currentImageIndex];

    const nextImage = () => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(i => i + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(i => i - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">ترجمة الفصول</h1>

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">اختر المانجا</label>
                    <select
                        value={selectedManga}
                        onChange={(e) => { setSelectedManga(e.target.value); setSelectedChapter(''); }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- اختر مانجا --</option>
                        {mangaList.map((m) => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-2">اختر الفصل</label>
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        disabled={!selectedManga}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                        <option value="">-- اختر فصل --</option>
                        {chapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>الفصل {ch.number}: {ch.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Image Viewer */}
            {currentImage ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Controls */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <FaImages className="text-blue-400" />
                            <span className="text-white">
                                الصفحة {currentImageIndex + 1} من {images.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevImage}
                                disabled={currentImageIndex === 0}
                                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                            >
                                <FaArrowRight className="text-white" />
                            </button>
                            <button
                                onClick={nextImage}
                                disabled={currentImageIndex === images.length - 1}
                                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                            >
                                <FaArrowLeft className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="flex items-center justify-center p-4 bg-gray-900 min-h-[500px]">
                        <img
                            src={currentImage.image_url}
                            alt={`Page ${currentImage.page_number}`}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    </div>

                    {/* Translate Button (Placeholder) */}
                    <div className="p-4 border-t border-gray-700">
                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <FaLanguage className="text-xl" />
                            ترجمة هذه الصورة (قريباً)
                        </button>
                        <p className="text-center text-gray-500 text-sm mt-2">
                            سيتم تفعيل هذه الميزة لاحقاً
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                    <FaLanguage className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">ترجمة الصور</h2>
                    <p className="text-gray-400">
                        اختر مانجا وفصل لعرض الصور وترجمتها
                    </p>
                </div>
            )}
        </div>
    );
}
