import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, ChevronRight, ShieldCheck, Clock, Award, Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { seedWorkers } from '../services/workerService';

const SERVICE_CATEGORIES = [
  { id: 'Elektronik', label: 'Elektronik', desc: 'TV, Audio, Gadget' },
  { id: 'Listrik', label: 'Listrik', desc: 'Instalasi & Korsleting' },
  { id: 'AC', label: 'AC Pendingin', desc: 'Cuci & Tambah Freon' },
  { id: 'Plumbing', label: 'Pipa & Ledeng', desc: 'Bocor & Saluran Air' },
  { id: 'Rumah', label: 'Atap & Rumah', desc: 'Bocor, Pintu, Kusen' },
  { id: 'Bangunan', label: 'Renovasi', desc: 'Tembok, Keramik' },
  { id: 'Cat', label: 'Cat Dinding', desc: 'Interior & Eksterior' },
  { id: 'Lainnya', label: 'Layanan Lain', desc: 'Custom Pekerjaan' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!seeded) {
      seedWorkers().catch(console.error);
      setSeeded(true);
    }
  }, [seeded]);

  const handleCategoryClick = (categoryId) => {
    navigate('/pesan', { state: { problemType: categoryId } });
  };

  return (
    <div className="px-4 py-5 max-w-5xl mx-auto space-y-6">
      {/* Hero Banner Dark Luxury Gold */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-black border border-amber-500/30 p-6 md:p-8 shadow-2xl shadow-black/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              Layanan Tukang & Servis Terpercaya
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Halo, <span className="text-amber-400">{userData?.name || 'Sobat Benerin'}</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Ada perabotan rusak atau butuh renovasi rumah? Tukang handal dan terverifikasi siap datang ke lokasi Anda.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => navigate('/pesan')}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-base md:text-lg rounded-2xl shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>BENERIN SEKARANG</span>
              <ArrowRight className="w-5 h-5 text-neutral-950" />
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 pt-5 border-t border-neutral-800 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-neutral-300 text-xs md:text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Responsif & Cepat</span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-neutral-300 text-xs md:text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Tukang Terverifikasi</span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-neutral-300 text-xs md:text-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Garansi Pekerjaan</span>
          </div>
        </div>
      </div>

      {/* AI Assistant Promo Card */}
      <div 
        onClick={() => navigate('/chat')}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 p-4.5 transition-all duration-300 shadow-md"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm md:text-base">Konsultasi Diagnosis AI</h3>
                <span className="px-2 py-0.5 text-[10px] bg-amber-400/20 text-amber-300 rounded-md font-semibold">GRATIS</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tanya perkiraan kerusakan & kisaran biaya perbaikan sebelum pesan tukang.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
        </div>
      </div>

      {/* Categories Grid - Clean Professional Typography (No Emojis/Icons) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
            Kategori Perbaikan
          </h2>
          <span className="text-xs text-amber-400/80 font-medium">Pilih & Pesan Langsung</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/60 text-left transition-all active:scale-95 group shadow-sm min-h-[92px]"
            >
              <div>
                <span className="font-extrabold text-sm text-neutral-100 group-hover:text-amber-400 transition-colors block">
                  {cat.label}
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 line-clamp-1 block">
                  {cat.desc}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-amber-400/80 group-hover:text-amber-300">
                <span>Pilih Layanan</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Steps Section - Clean & Professional (No Emoji/Icons) */}
      <div className="bg-neutral-900/60 rounded-3xl border border-neutral-800 p-5 md:p-6 space-y-4">
        <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-widest">
          Alur Pemesanan Benerin
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { num: 'Langkah 1', title: 'Tentukan Masalah', desc: 'Pilih jenis perbaikan dan ceritakan kendala kerusakan yang dialami di rumah Anda.' },
            { num: 'Langkah 2', title: 'Pilih Tukang', desc: 'Sistem mencocokkan tukang terbaik terdekat lengkap dengan review, keahlian, dan tarif.' },
            { num: 'Langkah 3', title: 'Pengerjaan & Bayar', desc: 'Tukang datang ke alamat Anda. Bayar aman via tunai atau QRIS setelah pekerjaan beres.' },
          ].map((item) => (
            <div key={item.num} className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                {item.num}
              </span>
              <h4 className="text-sm font-bold text-neutral-100">{item.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
