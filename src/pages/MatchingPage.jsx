import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Loader2, Sparkles, Wrench } from 'lucide-react';
import { cancelOrder } from '../services/orderService';
import { getWorkersByType } from '../services/workerService';

const MATCHING_MESSAGES = [
  'Mencari tukang terdekat di area Anda...',
  'Menyaring tukang dengan rating tertinggi...',
  'Mengecek ketersediaan & jadwal spesialis...',
  'Memilih kandidat tukang terbaik untuk Anda...',
];

const MatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, order, problemType } = location.state || {};

  const [msgIdx, setMsgIdx] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const msgInterval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % MATCHING_MESSAGES.length);
    }, 1200);

    const matchTimeout = setTimeout(async () => {
      try {
        const found = await getWorkersByType(problemType || 'Lainnya');
        clearInterval(msgInterval);
        navigate('/pilih-tukang', {
          state: { orderId, order, workers: found.slice(0, 4), problemType }
        });
      } catch (err) {
        console.error(err);
      }
    }, 3800);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(matchTimeout);
    };
  }, [orderId, problemType, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      if (orderId) await cancelOrder(orderId);
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Animated Radar Pulse */}
        <div className="relative w-36 h-36 mx-auto">
          <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-40" />
          <div className="absolute inset-2 rounded-full border border-amber-500/20 animate-ping opacity-25" style={{ animationDelay: '0.4s' }} />
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-neutral-900 to-black border border-amber-500/40 flex items-center justify-center shadow-2xl shadow-amber-500/10">
            <Wrench className="w-14 h-14 text-amber-400 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Sistem Matching Otomatis
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">Mencari Tukang...</h2>
          <p className="text-xs md:text-sm text-neutral-400 min-h-[22px]">
            {MATCHING_MESSAGES[msgIdx]}
          </p>
        </div>

        {/* Order Card Preview */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left space-y-2">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Detail Pesanan</span>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400">Kategori:</span>
            <span className="font-bold text-white">{order?.problemType || problemType}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400">Lokasi:</span>
            <span className="font-semibold text-neutral-200 max-w-[200px] truncate text-right">{order?.location || '-'}</span>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-red-400 transition-colors pt-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{cancelling ? 'Membatalkan...' : 'Batalkan Pencarian'}</span>
        </button>
      </div>
    </div>
  );
};

export default MatchingPage;
