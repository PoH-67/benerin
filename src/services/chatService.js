import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

// Send a chat message
export const sendMessage = async (chatId, senderId, senderName, text, isAI = false) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    senderName,
    text,
    isAI,
    createdAt: serverTimestamp(),
  });
};

// Subscribe to messages in real-time
export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
};

// Delete all messages in a chat (when order completed)
export const deleteChatHistory = async (chatId) => {
  const q = query(collection(db, 'chats', chatId, 'messages'));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletePromises);
};

// AI Quick Chat responses (simulated - replace with actual Gemini API)
export const getAIQuickResponse = async (question, workerName, workerLocation) => {
  const lowerQ = question.toLowerCase();
  
  // Simulated AI responses for common questions
  if (lowerQ.includes('dimana') || lowerQ.includes('where')) {
    return `Bapak ${workerName} saat ini sedang dalam perjalanan menuju lokasi Anda. Diperkirakan tiba dalam 10-15 menit lagi.`;
  }
  if (lowerQ.includes('berapa lama') || lowerQ.includes('how long')) {
    return `Estimasi pengerjaan sekitar 1-2 jam tergantung tingkat kerusakan. Bapak ${workerName} akan memberikan estimasi lebih tepat setelah melihat kondisi langsung.`;
  }
  if (lowerQ.includes('biaya') || lowerQ.includes('harga') || lowerQ.includes('bayar')) {
    return `Biaya sudah disepakati di awal sesuai pesanan Anda. Pembayaran dilakukan setelah pekerjaan selesai.`;
  }
  if (lowerQ.includes('selesai') || lowerQ.includes('kapan')) {
    return `Bapak ${workerName} sedang mengerjakan perbaikan dengan sebaik mungkin. Anda akan mendapat notifikasi ketika pekerjaan hampir selesai.`;
  }
  
  return `Terima kasih atas pertanyaannya. Bapak ${workerName} akan segera merespons. Jika urgent, Anda bisa menghubungi langsung melalui nomor yang tertera di profil tukang.`;
};

// AI Diagnosis chat (Gemini API)
export const getAIDiagnosis = async (userMessage, conversationHistory = []) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback simulation
    return simulateAIDiagnosis(userMessage);
  }

  try {
    const systemPrompt = `Kamu adalah asisten AI untuk aplikasi Benerin, platform pemesanan jasa tukang dan servis.
    Tugasmu adalah:
    1. Mendiagnosis kerusakan berdasarkan deskripsi pengguna
    2. Memberikan perkiraan biaya perbaikan
    3. Merekomendasikan jenis tukang yang diperlukan
    4. Memberikan tips darurat jika diperlukan
    
    Selalu jawab dalam Bahasa Indonesia yang ramah dan profesional.
    Di akhir jawaban, jika masalahnya memerlukan tukang, tambahkan baris:
    [REKOMENDASI: <jenis_tukang>] [PERKIRAAN_HARGA: Rp X.000 - Rp Y.000]`;

    const messages = [
      ...conversationHistory.map(m => ({
        role: m.isUser ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages,
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || simulateAIDiagnosis(userMessage);
  } catch (error) {
    return simulateAIDiagnosis(userMessage);
  }
};

const simulateAIDiagnosis = (message) => {
  const lower = message.toLowerCase();
  
  if (lower.includes('ac') || lower.includes('air conditioner')) {
    return `🔍 **Diagnosis AC:**\n\nBerdasarkan deskripsi Anda, kemungkinan masalah:\n• AC tidak dingin → kemungkinan freon habis atau kompresor bermasalah\n• AC bocor air → saluran drainase tersumbat\n• AC berbunyi → ada kotoran atau komponen longgar\n\n💰 **Perkiraan Biaya:**\n• Isi freon: Rp 150.000 - Rp 300.000\n• Cuci AC: Rp 75.000 - Rp 150.000\n• Service kompresor: Rp 300.000 - Rp 800.000\n\n[REKOMENDASI: elektronik] [PERKIRAAN_HARGA: Rp 150.000 - Rp 800.000]`;
  }
  if (lower.includes('bocor') || lower.includes('pipa') || lower.includes('air')) {
    return `🔍 **Diagnosis Kebocoran:**\n\nBerdasarkan deskripsi Anda:\n• Pipa bocor → perlu penggantian atau penyambungan pipa\n• Atap bocor → perlu pengecekan genteng atau waterproofing\n• Kran bocor → ganti seal atau kran\n\n💰 **Perkiraan Biaya:**\n• Ganti kran: Rp 100.000 - Rp 250.000\n• Perbaikan pipa: Rp 150.000 - Rp 400.000\n• Waterproofing atap: Rp 500.000 - Rp 2.000.000\n\n[REKOMENDASI: rumah] [PERKIRAAN_HARGA: Rp 100.000 - Rp 2.000.000]`;
  }
  if (lower.includes('listrik') || lower.includes('korsleting') || lower.includes('mcb') || lower.includes('stop kontak')) {
    return `🔍 **Diagnosis Listrik:**\n\nBerdasarkan deskripsi Anda:\n• MCB turun → beban berlebih atau ada korsleting\n• Stop kontak mati → kabel putus atau komponen rusak\n• Lampu berkedip → tegangan tidak stabil\n\n⚠️ **PENTING:** Jangan coba perbaiki listrik sendiri, berbahaya!\n\n💰 **Perkiraan Biaya:**\n• Ganti stop kontak: Rp 75.000 - Rp 200.000\n• Perbaikan instalasi: Rp 200.000 - Rp 500.000\n• Pasang MCB baru: Rp 150.000 - Rp 350.000\n\n[REKOMENDASI: elektronik] [PERKIRAAN_HARGA: Rp 75.000 - Rp 500.000]`;
  }
  if (lower.includes('cat') || lower.includes('dinding') || lower.includes('retak')) {
    return `🔍 **Diagnosis Tembok/Cat:**\n\nBerdasarkan deskripsi Anda:\n• Dinding retak → bisa karena penurunan pondasi atau susut\n• Cat mengelupas → lembab atau cat berkualitas rendah\n• Jamur di dinding → kelembaban tinggi\n\n💰 **Perkiraan Biaya:**\n• Cat ulang per m²: Rp 35.000 - Rp 75.000\n• Perbaikan retak: Rp 150.000 - Rp 400.000\n• Anti-jamur treatment: Rp 200.000 - Rp 500.000\n\n[REKOMENDASI: rumah] [PERKIRAAN_HARGA: Rp 150.000 - Rp 500.000]`;
  }
  
  return `🤔 **Analisis Awal:**\n\nTerima kasih sudah menjelaskan masalah Anda. Untuk diagnosis yang lebih akurat, saya butuh informasi tambahan:\n\n1. Kapan masalah ini pertama muncul?\n2. Apakah ada tanda-tanda lain (bunyi, bau, dll)?\n3. Sudah pernah diperbaiki sebelumnya?\n\nCeritakan lebih detail agar saya bisa memberikan estimasi biaya yang tepat! 😊`;
};
