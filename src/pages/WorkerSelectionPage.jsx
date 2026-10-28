import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, CheckCircle, Banknote, QrCode,
  Award, Briefcase, ShieldCheck, Zap
} from 'lucide-react';
import { hireWorker } from '../services/orderService';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const PAYMENT_METHODS = [
  { id: 'tunai', label: 'Tunai di Tempat', icon: Banknote, desc: 'Bayar langsung ke tukang setelah selesai' },
  { id: 'qris', label: 'QRIS / GoPay / OVO', icon: QrCode, desc: 'Scan instan dengan e-wallet apa saja' },
];

const WorkerSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, order, workers = [], problemType } = location.state || {};

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('tunai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRIS, setShowQRIS] = useState(false);

  const price = selectedWorker
    ? (selectedWorker.prices?.[problemType?.toLowerCase()] || 150000)
    : 0;

  const handleHire = async () => {
    if (!selectedWorker) { setError('Pilih salah satu tukang terlebih dahulu'); return; }
    if (selectedPayment === 'qris') {
      setShowQRIS(true);
      return;
    }
    await processHire();
  };

  const processHire = async () => {
    setLoading(true);
    setError('');
    try {
      await hireWorker(orderId, selectedWorker.id, selectedWorker, selectedPayment, price);
      navigate('/aktivitas', { state: { tab: 'progress' } });
    } catch (err) {
      setError('Gagal memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
      {/* QRIS Modal */}
      {showQRIS && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Scan QRIS Pembayaran</h3>
            <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 flex flex-col items-center justify-center border-4 border-amber-400">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-neutral-950 rounded-lg">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className={`rounded-xs ${i % 2 === 0 ? 'bg-amber-400' : 'bg-neutral-800'}`} />
                ))}
              </div>
            </div>
            <p className="text-xl font-extrabold text-amber-400">{formatPrice(price)}</p>
            <p className="text-[11px] text-neutral-400">Scan via BCA, GoPay, OVO, Dana</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowQRIS(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowQRIS(false); processHire(); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black shadow-md shadow-amber-500/20"
              >
                Sudah Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 py-2 border-b border-neutral-800">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-300" />
        </button>
        <div>
          <h1 className="font-extrabold text-base md:text-lg text-white">Pilih Tukang Rekomendasi</h1>
          <p className="text-[11px] text-neutral-400">Ditemukan {workers.length} tukang spesialis "{problemType}"</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* List Tukang */}
      <div className="space-y-3">
        {workers.map((worker) => {
          const isSelected = selectedWorker?.id === worker.id;
          const workerPrice = worker.prices?.[problemType?.toLowerCase()] || worker.prices?.elektronik || 150000;

          return (
            <div
              key={worker.id}
              onClick={() => setSelectedWorker(worker)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-black text-xl flex-shrink-0 shadow-md">
                  {worker.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-1.5">
                        {worker.name}
                        {worker.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                            {worker.badge}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {worker.avgRating || 4.8}
                        </span>
                        <span>•</span>
                        <span>{worker.totalJobs || 0} order selesai</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-400">{formatPrice(workerPrice)}</span>
                      <p className="text-[10px] text-neutral-500">Estimasi kunjungan</p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {worker.bio || 'Tukang terverifikasi siap menyelesaikan masalah Anda secara tuntas.'}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/80">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {worker.location}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 fill-amber-400 text-neutral-950" />
                        Tukang Dipilih
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metode Pembayaran */}
      {selectedWorker && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            Pilih Metode Pembayaran
          </label>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => {
              const active = selectedPayment === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPayment(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{label}</h4>
                    <p className="text-[10px] text-neutral-400">{desc}</p>
                  </div>
                  {active && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom CTA Button */}
      <button
        onClick={handleHire}
        disabled={loading || !selectedWorker}
        className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-neutral-950 font-black rounded-2xl text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{loading ? 'MEMPROSES...' : `HIRE SEKARANG • ${selectedWorker ? formatPrice(price) : 'PILIH TUKANG'}`}</span>
      </button>
    </div>
  );
};

export default WorkerSelectionPage;
