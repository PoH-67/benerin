import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, X, MapPin, Bookmark, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, saveDraft } from '../services/orderService';

const PROBLEM_TYPES = [
  { id: 'Elektronik', label: 'Elektronik' },
  { id: 'Listrik', label: 'Listrik' },
  { id: 'AC', label: 'AC Pendingin' },
  { id: 'Plumbing', label: 'Pipa & Ledeng' },
  { id: 'Rumah', label: 'Atap & Rumah' },
  { id: 'Bangunan', label: 'Bangunan / Tembok' },
  { id: 'Cat', label: 'Cat Dinding' },
  { id: 'Lainnya', label: 'Layanan Lain' },
];

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    problemDescription: location.state?.draft?.problemDescription || '',
    problemType: location.state?.problemType || location.state?.draft?.problemType || '',
    location: location.state?.draft?.location || '',
    photos: [],
    photoFiles: [],
  });
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    if (form.photos.length + files.length > 3) {
      setError('Maksimal 3 foto kerusakan');
      return;
    }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPreviews],
      photoFiles: [...prev.photoFiles, ...files],
    }));
    setError('');
  };

  const removePhoto = (idx) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
      photoFiles: prev.photoFiles.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.problemType) { setError('Pilih kategori perbaikan terlebih dahulu'); return; }
    if (!form.problemDescription.trim()) { setError('Deskripsikan kerusakan yang dialami'); return; }
    if (!form.location.trim()) { setError('Masukkan alamat lokasi perbaikan'); return; }

    setLoading(true);
    setError('');
    try {
      const order = await createOrder(user?.uid || 'guest', {
        problemDescription: form.problemDescription,
        problemType: form.problemType,
        location: form.location,
        photos: [],
        photoCount: form.photos.length,
      });

      navigate('/matching', { state: { orderId: order.id, order, problemType: form.problemType } });
    } catch (err) {
      console.error(err);
      setError('Gagal membuat pesanan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.problemDescription.trim()) {
      setError('Isi deskripsi masalah sebelum simpan draf');
      return;
    }
    setSavingDraft(true);
    try {
      await saveDraft(user?.uid || 'guest', {
        problemDescription: form.problemDescription,
        problemType: form.problemType || 'Lainnya',
        location: form.location || '',
        photos: [],
      });
      navigate('/aktivitas', { state: { tab: 'draft' } });
    } catch (err) {
      setError('Gagal menyimpan draf.');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-300" />
          </button>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-white">Buat Pesanan Tukang</h1>
            <p className="text-[11px] text-neutral-400">Jelaskan kebutuhan perbaikan Anda</p>
          </div>
        </div>
        <button
          onClick={handleSaveDraft}
          disabled={savingDraft}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 hover:bg-neutral-800 text-xs font-semibold transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{savingDraft ? 'Menyimpan...' : 'Simpan Draf'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Kategori Masalah (Clean Text Pills - No Icons) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            1. Jenis Masalah <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROBLEM_TYPES.map((type) => {
              const selected = form.problemType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setForm(prev => ({ ...prev, problemType: type.id }))}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    selected
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <span className="truncate">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Deskripsi Masalah */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            2. Detail Kerusakan <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.problemDescription}
            onChange={e => setForm(prev => ({ ...prev, problemDescription: e.target.value }))}
            placeholder="Contoh: Lampu utama ruang tamu mati mendadak, MCB sering jepret saat nyalain pompa air..."
            rows={4}
            className="w-full p-3.5 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none resize-none transition-colors"
          />
        </div>

        {/* 3. Foto Kerusakan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              3. Foto Masalah (Opsional)
            </label>
            <span className="text-[11px] text-neutral-400">Maks. 3 foto</span>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {form.photos.map((photo, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-700">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {form.photos.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border border-dashed border-neutral-700 hover:border-amber-400/80 bg-neutral-950 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-semibold">+ Foto</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoAdd}
            className="hidden"
          />
        </div>

        {/* 4. Lokasi */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            4. Alamat Lokasi <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              value={form.location}
              onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Jl. Mawar No. 12, RT 02/05, Kebayoran Baru..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-semibold mt-1"
            onClick={() => setForm(prev => ({ ...prev, location: 'Jl. Sudirman No. 45, Jakarta Selatan (Sesuai GPS)' }))}
          >
            <MapPin className="w-3.5 h-3.5" />
            Gunakan Lokasi Saat Ini
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black rounded-2xl text-base tracking-wider shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-neutral-950" />
          <span>{loading ? 'MEMPROSES...' : 'CARI TUKANG SEKARANG'}</span>
        </button>
      </form>
    </div>
  );
};

export default OrderPage;
