'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCreditCard, FaCheck } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface SubscriptionPlan {
    id: string;
    tier: string;
    price: number;
    monthly_free_translations: number;
}

const TIER_LABELS: Record<string, string> = {
    free: 'مجاني',
    medium: 'متوسط',
    premium: 'فاخر',
};

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        try {
            const res = await fetch(`${API_URL}/subscriptions/`);
            if (res.ok) {
                const data = await res.json();
                setPlans(Array.isArray(data) ? data : data.results || []);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deletePlan(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;

        try {
            await fetch(`${API_URL}/subscriptions/${id}/`, { method: 'DELETE' });
            setPlans(plans.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting plan:', error);
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
                <h1 className="text-3xl font-bold text-white">خطط الاشتراك</h1>
                <button
                    onClick={() => { setEditingPlan(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FaPlus /> إضافة خطة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-gray-800 rounded-xl p-6 border-2 ${plan.tier === 'premium' ? 'border-yellow-500' :
                                plan.tier === 'medium' ? 'border-blue-500' : 'border-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${plan.tier === 'premium' ? 'bg-yellow-600/20' :
                                        plan.tier === 'medium' ? 'bg-blue-600/20' : 'bg-gray-700'
                                    }`}>
                                    <FaCreditCard className={`text-xl ${plan.tier === 'premium' ? 'text-yellow-400' :
                                            plan.tier === 'medium' ? 'text-blue-400' : 'text-gray-400'
                                        }`} />
                                </div>
                                <h3 className="text-xl font-bold text-white">{TIER_LABELS[plan.tier] || plan.tier}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                                    className="p-2 text-blue-400 hover:bg-blue-600/20 rounded transition-colors"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => deletePlan(plan.id)}
                                    className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-white mb-4">
                            {plan.price === 0 ? 'مجاني' : `$${plan.price}/شهر`}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                                <FaCheck className="text-green-400" />
                                <span>{plan.monthly_free_translations} ترجمة مجانية/شهر</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FaCreditCard className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>لا توجد خطط اشتراك</p>
                    <p className="text-sm mt-2">ملاحظة: قد تحتاج لإنشاء API endpoint للاشتراكات</p>
                </div>
            )}

            {showModal && (
                <PlanModal
                    plan={editingPlan}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchPlans(); }}
                />
            )}
        </div>
    );
}

function PlanModal({ plan, onClose, onSuccess }: { plan: SubscriptionPlan | null; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        tier: plan?.tier || 'free',
        price: plan?.price || 0,
        monthly_free_translations: plan?.monthly_free_translations || 0,
    });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const url = plan ? `${API_URL}/subscriptions/${plan.id}/` : `${API_URL}/subscriptions/`;

            await fetch(url, {
                method: plan ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            onSuccess();
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    {plan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm">المستوى</label>
                        <select
                            value={formData.tier}
                            onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="free">مجاني</option>
                            <option value="medium">متوسط</option>
                            <option value="premium">فاخر</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">السعر الشهري ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">ترجمات مجانية/شهر</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.monthly_free_translations}
                            onChange={(e) => setFormData({ ...formData, monthly_free_translations: parseInt(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors"
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
