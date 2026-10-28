import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Clock, Calendar, FileText, History,
  Star, MessageCircle, CheckCircle2, Trash2, MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, completeOrder, rateWorker, deleteDraft } from '../services/orderService';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const TABS = [
  { id: 'progress', label: 'Dalam Proses', icon: Clock },
  { id: 'scheduled', label: 'Terjadwal', icon: Calendar },
  { id: 'draft', label: 'Draf', icon: FileText },
  { id: 'history', label: 'Riwayat', icon: History },
];

const formatPrice = (price) =>
  price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price) : '-';

const formatDate = (ts) => {
  if (!ts) return '-';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return format(date, 'dd MMM yyyy, HH:mm', { locale: idLocale });
};

const ActivityPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'progress');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmComplete, setConfirmComplete] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    loadOrders();
  }, [user, location.key]);

  const loadOrders = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await getUserOrders(user.uid);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOrder = async () => {
    if (!confirmComplete) return;
    try {
      await completeOrder(confirmComplete.id);
      setRatingOrder(confirmComplete);
      setOrders(prev => prev.map(o => o.id === confirmComplete.id ? { ...o, status: 'completed' } : o));
      setConfirmComplete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRating = async () => {
    if (!ratingOrder) return;
    try {
      await rateWorker(ratingOrder.id, ratingOrder.workerId, starCount, ratingComment);
      setOrders(prev => prev.map(o => o.id === ratingOrder.id ? { ...o, rating: starCount } : o));
      setRatingOrder(null);
      setRatingComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDraft = async (orderId) => {
    await deleteDraft(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'progress') return o.status === 'in_progress' || o.status === 'matching';
    if (activeTab === 'scheduled') return o.status === 'scheduled';
    if (activeTab === 'draft') return o.status === 'draft';
    if (activeTab === 'history') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
      {/* Modal Rating */}
      {ratingOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">Beri Rating Tukang</h3>
            <p className="text-xs text-neutral-400">Bagaimana hasil kerja dari <span className="text-amber-400 font-bold">{ratingOrder.workerName}</span>?</p>
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setStarCount(star)} className="p-1">
                  <Star className={`w-8 h-8 ${star <= starCount ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              placeholder="Tulis ulasan pekerjaan (opsional)..."
              rows={3}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSendRating}
              className="w-full py-3 bg-amber-400 text-neutral-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20"
            >
              Kirim Ulasan & Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Selesai */}
      {confirmComplete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Konfirmasi Pekerjaan Selesai?</h3>
            <p className="text-xs text-neutral-400">Pastikan perbaikan sudah dicek dan Anda puas dengan hasil kerja tukang.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmComplete(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Belum
              </button>
              <button
                onClick={handleFinishOrder}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black"
              >
                Ya, Sudah Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Tab */}
      <div className="space-y-3">
        <h1 className="font-extrabold text-lg md:text-xl text-white">Aktivitas Pemesanan</h1>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/15'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-neutral-500">Memuat data aktivitas...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-10 text-center space-y-3">
          <div className="text-4xl">🛠️</div>
          <h3 className="font-bold text-sm text-neutral-300">Belum Ada Aktivitas di Tab Ini</h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Semua pesanan tukang yang Anda buat akan tercatat rapi di sini.
          </p>
          <button
            onClick={() => navigate('/pesan')}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-xl border border-neutral-700"
          >
            Pesan Tukang Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{order.problemType}</span>
                    <span className="text-[10px] text-neutral-500">• {formatDate(order.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{order.problemDescription}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  order.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : order.status === 'in_progress'
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {order.status === 'in_progress' ? 'Dikerjakan' : order.status === 'completed' ? 'Selesai' : order.status}
                </span>
              </div>

              {order.workerName && (
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-xs">
                      {order.workerName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-neutral-200">{order.workerName}</span>
                      <p className="text-[10px] text-neutral-500">{order.paymentMethod?.toUpperCase()} • {formatPrice(order.price)}</p>
                    </div>
                  </div>
                  {order.status === 'in_progress' && (
                    <button
                      onClick={() => navigate('/chat/order', { state: { order } })}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold text-xs flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => setConfirmComplete(order)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pekerjaan Sudah Selesai
                  </button>
                )}
                {order.status === 'draft' && (
                  <>
                    <button
                      onClick={() => navigate('/pesan', { state: { draft: order } })}
                      className="px-3 py-1.5 bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                    >
                      Lanjutkan
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(order.id)}
                      className="p-1.5 bg-neutral-800 text-red-400 rounded-xl hover:bg-neutral-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
