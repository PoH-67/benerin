import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, LogOut, ChevronRight, Edit2,
  Bell, Globe, Shield, HelpCircle, Save, X, Wrench
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout, updateUserProfile } from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: form.name, phone: form.phone });
      await refreshUserData();
      setMsg('Profil berhasil disimpan!');
      setEditMode(false);
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setMsg('Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-amber-500/30 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden shadow-xl">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-neutral-950 font-black text-3xl flex items-center justify-center border-4 border-neutral-900 shadow-xl shadow-amber-500/20">
          {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-black text-white">{userData?.name || 'Pengguna Benerin'}</h2>
          <p className="text-xs text-neutral-400">{user?.email}</p>
          {userData?.phone && <p className="text-xs text-amber-400 mt-0.5">{userData.phone}</p>}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center font-bold">
          {msg}
        </div>
      )}

      {/* Edit or Details */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Informasi Akun</span>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs text-neutral-400 hover:text-amber-400 font-semibold flex items-center gap-1"
          >
            {editMode ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{editMode ? 'Batal' : 'Edit'}</span>
          </button>
        </div>

        {editMode ? (
          <div className="space-y-3 pt-1">
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nama Lengkap"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-400"
            />
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="Nomor Telepon / WA"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-amber-400 text-neutral-950 font-black text-xs rounded-xl shadow-md"
            >
              {saving ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Nama</span>
              <span className="font-bold text-neutral-200">{userData?.name || '-'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-500">Email</span>
              <span className="font-bold text-neutral-200">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-500">Nomor HP</span>
              <span className="font-bold text-neutral-200">{userData?.phone || '-'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800 text-xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-neutral-200">Bahasa Aplikasi</span>
          </div>
          <span className="text-neutral-500 font-bold">Indonesia (ID)</span>
        </div>
        <div className="p-3.5 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-neutral-200">Notifikasi Pesanan</span>
          </div>
          <span className="text-emerald-400 font-bold">Aktif</span>
        </div>
        <div className="p-3.5 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-neutral-200">Keamanan & Kebijakan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-600" />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-red-500/30 text-red-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
};

export default ProfilePage;
