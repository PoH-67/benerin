import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

// Helper LocalStorage untuk sinkronisasi instan jika koneksi firestore lambat / terhalang rules
const LOCAL_STORAGE_KEY = 'benerin_local_orders';

const getStoredOrders = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
};

export const uploadImage = async (file, path) => {
  return '';
};

// Create a new order
export const createOrder = async (userId, orderData) => {
  const localId = 'order_' + Date.now();
  const isDraft = orderData.isDraft || false;
  const status = orderData.status || (isDraft ? 'draft' : 'matching');

  const order = {
    userId,
    status: status, // matching | scheduled | in_progress | completed | cancelled | draft
    problemDescription: orderData.problemDescription,
    problemType: orderData.problemType,
    photos: orderData.photos || [],
    location: orderData.location,
    workerId: null,
    workerName: null,
    paymentMethod: null,
    price: null,
    rating: null,
    isDraft: isDraft,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: orderData.scheduledAt || null,
    completedAt: null,
  };

  // 1. Simpan di LocalStorage agar instan tampil
  const localList = getStoredOrders();
  saveStoredOrders([{ id: localId, ...order }, ...localList]);

  // 2. Simpan juga ke Firestore jika online & ada kredensial
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Update local ID dengan id firestore
    const updated = getStoredOrders().map(o => o.id === localId ? { ...o, id: docRef.id } : o);
    saveStoredOrders(updated);
    return { id: docRef.id, ...order };
  } catch (err) {
    console.warn('Firestore createOrder fallback to local:', err.message);
    return { id: localId, ...order };
  }
};

// Save as draft
export const saveDraft = async (userId, orderData) => {
  return createOrder(userId, { ...orderData, isDraft: true, status: 'draft' });
};

// Get orders for a user
export const getUserOrders = async (userId) => {
  const localOrders = getStoredOrders().filter(o => o.userId === userId || !userId || o.userId === 'guest');

  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const remoteOrders = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
      }));

      // Gabungkan tanpa duplikat
      const mergedMap = new Map();
      localOrders.forEach(item => mergedMap.set(item.id, item));
      remoteOrders.forEach(item => mergedMap.set(item.id, item));
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.warn('Firestore getUserOrders fallback to local:', err.message);
  }

  return localOrders;
};

// Hire a worker (update order with worker info)
export const hireWorker = async (orderId, workerId, workerData, paymentMethod, price) => {
  // Update lokal terlebih dahulu
  const localList = getStoredOrders();
  const updatedList = localList.map(item => {
    if (item.id === orderId) {
      return {
        ...item,
        status: 'in_progress',
        workerId,
        workerName: workerData.name,
        workerPhone: workerData.phone,
        workerPhoto: workerData.photoURL || '',
        paymentMethod,
        price,
        isDraft: false,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveStoredOrders(updatedList);

  // Update firestore jika ada
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'in_progress',
      workerId,
      workerName: workerData.name,
      workerPhone: workerData.phone,
      workerPhoto: workerData.photoURL || '',
      paymentMethod,
      price,
      isDraft: false,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore hireWorker fallback local:', err.message);
  }
};

// Mark order as completed
export const completeOrder = async (orderId) => {
  const localList = getStoredOrders();
  const updatedList = localList.map(item => {
    if (item.id === orderId) {
      return {
        ...item,
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveStoredOrders(updatedList);

  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore completeOrder fallback local:', err.message);
  }
};

// Rate worker after order completion
export const rateWorker = async (orderId, workerId, rating, comment) => {
  const localList = getStoredOrders();
  const updatedList = localList.map(item => {
    if (item.id === orderId) {
      return {
        ...item,
        rating,
        ratingComment: comment,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveStoredOrders(updatedList);

  try {
    await addDoc(collection(db, 'ratings'), {
      orderId,
      workerId,
      rating,
      comment,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'orders', orderId), {
      rating,
      ratingComment: comment,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore rateWorker fallback local:', err.message);
  }
};

// Delete draft
export const deleteDraft = async (orderId) => {
  const localList = getStoredOrders().filter(o => o.id !== orderId);
  saveStoredOrders(localList);

  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    console.warn('Firestore deleteDraft fallback local:', err.message);
  }
};

// Cancel matching order
export const cancelOrder = async (orderId) => {
  const localList = getStoredOrders();
  const updatedList = localList.map(item => {
    if (item.id === orderId) {
      return {
        ...item,
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveStoredOrders(updatedList);

  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore cancelOrder fallback local:', err.message);
  }
};
