import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

// Default worker list (Fallback otomatis agar tidak pernah kosong)
export const DEFAULT_WORKERS = [
  {
    id: 'w-1',
    name: 'Budi Santoso',
    phone: '081234567890',
    specializations: ['elektronik', 'ac', 'listrik', 'Lainnya'],
    avgRating: 4.9,
    totalRatings: 148,
    totalJobs: 234,
    isAvailable: true,
    bio: 'Teknisi senior bersertifikat 10+ tahun spesialis elektronik, kelistrikan & AC.',
    prices: {
      elektronik: 125000,
      ac: 175000,
      listrik: 150000,
    },
    location: 'Jakarta Selatan (1.2 km)',
    badge: 'Top Rated Pro',
  },
  {
    id: 'w-2',
    name: 'Agus Pramono',
    phone: '082345678901',
    specializations: ['rumah', 'bangunan', 'cat', 'plumbing', 'Lainnya'],
    avgRating: 4.8,
    totalRatings: 94,
    totalJobs: 160,
    isAvailable: true,
    bio: 'Tukang bangunan profesional spesialis renovasi tembok, atap bocor & instalasi pipa.',
    prices: {
      rumah: 150000,
      bangunan: 200000,
      cat: 130000,
      plumbing: 140000,
    },
    location: 'Jakarta Barat (2.5 km)',
    badge: 'Verified Master',
  },
  {
    id: 'w-3',
    name: 'Hendra Wijaya',
    phone: '083456789012',
    specializations: ['elektronik', 'ac', 'listrik'],
    avgRating: 4.9,
    totalRatings: 215,
    totalJobs: 320,
    isAvailable: true,
    bio: 'Spesialis perbaikan AC tidak dingin, mesin cuci, kulkas & kelistrikan rumah.',
    prices: {
      elektronik: 140000,
      ac: 180000,
      listrik: 160000,
    },
    location: 'Jakarta Utara (3.1 km)',
    badge: 'Super Tech',
  },
  {
    id: 'w-4',
    name: 'Slamet Riyadi',
    phone: '084567890123',
    specializations: ['plumbing', 'rumah', 'bangunan'],
    avgRating: 4.7,
    totalRatings: 78,
    totalJobs: 112,
    isAvailable: true,
    bio: 'Ahli ledeng, kran mampet, saluran air wastafel dan pekerjaan sipil ringan.',
    prices: {
      plumbing: 120000,
      rumah: 150000,
      bangunan: 180000,
    },
    location: 'Jakarta Timur (2.0 km)',
    badge: 'Fast Response',
  },
  {
    id: 'w-5',
    name: 'Dedi Kurniawan',
    phone: '085678901234',
    specializations: ['listrik', 'elektronik'],
    avgRating: 4.8,
    totalRatings: 132,
    totalJobs: 190,
    isAvailable: true,
    bio: 'Ahli instalasi listrik, perbaikan MCB jepret, stop kontak & instalasi lampu.',
    prices: {
      listrik: 150000,
      elektronik: 140000,
    },
    location: 'Tangerang (4.0 km)',
    badge: 'Verified Pro',
  },
  {
    id: 'w-6',
    name: 'Wahyu Prasetyo',
    phone: '086789012345',
    specializations: ['cat', 'rumah', 'bangunan'],
    avgRating: 4.6,
    totalRatings: 63,
    totalJobs: 89,
    isAvailable: true,
    bio: 'Jasa cat dinding interior, eksterior rapi dan perbaikan plaster retak.',
    prices: {
      cat: 110000,
      rumah: 140000,
      bangunan: 160000,
    },
    location: 'Depok (3.5 km)',
    badge: 'Artisan',
  },
];

// Seed data ke Firestore jika diizinkan
export const seedWorkers = async () => {
  try {
    const workersRef = collection(db, 'workers');
    const existing = await getDocs(workersRef);
    if (existing.docs.length > 0) return;

    for (const worker of DEFAULT_WORKERS) {
      const { id, ...data } = worker;
      await addDoc(workersRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // Jika rules firestore melarang write, fallback lokal tetap aktif
    console.warn('Firestore seeding skipped, fallback local data active:', err.message);
  }
};

// Ambil tukang berdasarkan kategori masalah
export const getWorkersByType = async (problemType) => {
  const typeMap = {
    'Elektronik': ['elektronik', 'ac'],
    'Listrik': ['listrik', 'elektronik'],
    'AC': ['ac', 'elektronik'],
    'Rumah': ['rumah', 'bangunan', 'cat'],
    'Bangunan': ['bangunan', 'rumah'],
    'Plumbing': ['plumbing', 'rumah'],
    'Cat': ['cat', 'rumah'],
    'Lainnya': ['elektronik', 'rumah', 'listrik', 'plumbing'],
  };

  const specs = typeMap[problemType] || ['elektronik', 'rumah'];

  try {
    // 1. Coba baca dari Firestore
    const snapshot = await getDocs(collection(db, 'workers'));
    if (!snapshot.empty) {
      const dbWorkers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = dbWorkers.filter(w =>
        w.isAvailable && w.specializations?.some(s => specs.includes(s))
      );
      if (filtered.length > 0) {
        return filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      }
    }
  } catch (error) {
    console.warn('Firestore fetch failed, using default list:', error.message);
  }

  // 2. Fallback instan ke DEFAULT_WORKERS lokal
  const fallback = DEFAULT_WORKERS.filter(w =>
    w.isAvailable && (w.specializations?.some(s => specs.includes(s)) || w.specializations?.includes('Lainnya'))
  );

  return fallback.length > 0 ? fallback : DEFAULT_WORKERS.slice(0, 4);
};
