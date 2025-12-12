'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTrophy } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    category: string;
    requirement_value: number;
    reward_points: number;
    is_active: boolean;
}

const CATEGORY_CHOICES = [
    { value: 'reading', label: 'القراءة' },
    { value: 'uploading', label: 'الرفع' },
    { value: 'social', label: 'التفاعل' },
];

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Achievement | null>(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    async function fetchAchievements() {
        try {
            const res = await fetch(`${API_URL}/achievements/`);
            if (res.ok) {
                const data = await res.json();
                setAchievements(Array.isArray(data) ? data : data.results || []);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteAchievement(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا الإنجاز؟')) return;

        try {
            await fetch(`${API_URL}/achievements/${id}/`, { method: 'DELETE' });
            setAchievements(achievements.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting achievement:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">الإنجازات</h1>
                <button
                    onClick={() => { setEditingItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FaPlus /> إضافة إنجاز
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-gray-800 rounded-xl p-4 border ${item.is_active ? 'border-gray-700' : 'border-red-900 opacity-60'}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                                    <FaTrophy className="text-yellow-400 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{item.name}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">
                                        {CATEGORY_CHOICES.find(c => c.value === item.category)?.label || item.category}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => { setEditingItem(item); setShowModal(true); }}
                                    className="p-2 text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => deleteAchievement(item.id)}
                                    className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">المطلوب: {item.requirement_value}</span>
                            <span className="text-yellow-400 font-medium">+{item.reward_points} نقطة</span>
                        </div>
                    </div>
                ))}
            </div>

            {achievements.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FaTrophy className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>لا توجد إنجازات</p>
                    <p className="text-sm mt-2">ملاحظة: قد تحتاج لإنشاء API endpoint للإنجازات</p>
                </div>
            )}

            {showModal && (
                <AchievementModal
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchAchievements(); }}
                />
            )}
        </div>
    );
}

function AchievementModal({ item, onClose, onSuccess }: { item: Achievement | null; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        category: item?.category || 'reading',
        requirement_value: item?.requirement_value || 1,
        reward_points: item?.reward_points || 10,
        is_active: item?.is_active ?? true,
    });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const url = item ? `${API_URL}/achievements/${item.id}/` : `${API_URL}/achievements/`;

            await fetch(url, {
                method: item ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            onSuccess();
        } catch (error) {
            console.error('Error saving achievement:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    {item ? 'تعديل الإنجاز' : 'إضافة إنجاز جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="اسم الإنجاز"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="الوصف"
                        rows={2}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                    />
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                    >
                        {CATEGORY_CHOICES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm">المطلوب</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.requirement_value}
                                onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">النقاط</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.reward_points}
                                onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
