import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, Mail, Lock, User, Phone, Sparkles } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await registerWithEmail(form.email, form.password, form.name, form.phone);
      } else {
        await loginWithEmail(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      const errorMessages = {
        'auth/user-not-found': 'Email tidak terdaftar.',
        'auth/wrong-password': 'Password salah.',
        'auth/email-already-in-use': 'Email sudah digunakan.',
        'auth/weak-password': 'Password minimal 6 karakter.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/invalid-credential': 'Email atau password salah.',
      };
      setError(errorMessages[err.code] || 'Gagal login. Cek kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Gagal login dengan Google. Pastikan Google Auth aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 relative z-10 text-center">
        <img
          src="/logo.png"
          alt="Logo Benerin"
          className="w-16 h-16 object-contain mb-3 drop-shadow-xl"
        />
        <h1 className="text-3xl font-black tracking-wider text-white">
          BENER<span className="text-amber-400">IN</span>
        </h1>
        <p className="text-neutral-400 text-xs md:text-sm mt-1">Platform Pemesanan Tukang Cepat & Terpercaya</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Tab switch */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            MASUK
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            DAFTAR BARU
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nomor WhatsApp / HP"
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Alamat Email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Kata Sandi (min. 6 karakter)"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="w-full pl-10 pr-11 py-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black rounded-xl text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'MASUK KE APLIKASI' : 'BUAT AKUN BENERIN'}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink mx-3 text-neutral-500 text-xs uppercase font-medium">atau</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.5 9.2 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.9 14.1c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1L2.2 7.1C1.4 8.6 1 10.3 1 12s.4 3.4 1.2 4.9l3.7-2.8z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-2.8 0-5.2-1.5-6.1-4.9L2.2 16.9C4 20.5 7.7 23 12 23z"/>
            </svg>
            Masuk dengan Akun Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
