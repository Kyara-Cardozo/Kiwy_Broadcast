import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // Ajuste o caminho se o seu firebase.ts estiver noutro local
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 1. Ouvinte em tempo real (Substitui o onSnapshot)
export const subscribeToCollection = (collectionName: string, userId: string, callback: (data: any[]) => void) => {
    if (isLocal) {
        const load = () => {
            const data = JSON.parse(localStorage.getItem(`kiwy_${collectionName}`) || '[]');
            callback(data.filter((d: any) => d.clientId === userId));
        };
        load();
        
        // Dispara sempre que algo for salvo/apagado localmente para atualizar a tela na hora
        const handleUpdate = () => load();
        window.addEventListener('kiwy_update', handleUpdate);
        return () => window.removeEventListener('kiwy_update', handleUpdate);
    } else {
        const q = query(collection(db, collectionName), where('clientId', '==', userId));
        return onSnapshot(q, (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }
};

// 2. Adicionar Documento
export const addDocument = async (collectionName: string, data: any) => {
    if (isLocal) {
        const existing = JSON.parse(localStorage.getItem(`kiwy_${collectionName}`) || '[]');
        const newDoc = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
        existing.push(newDoc);
        localStorage.setItem(`kiwy_${collectionName}`, JSON.stringify(existing));
        window.dispatchEvent(new Event('kiwy_update')); // Atualiza a tela
        return newDoc.id;
    } else {
        const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
        return docRef.id;
    }
};

// 3. Atualizar Documento
export const updateDocument = async (collectionName: string, id: string, data: any) => {
    if (isLocal) {
        let existing = JSON.parse(localStorage.getItem(`kiwy_${collectionName}`) || '[]');
        existing = existing.map((doc: any) => doc.id === id ? { ...doc, ...data } : doc);
        localStorage.setItem(`kiwy_${collectionName}`, JSON.stringify(existing));
        window.dispatchEvent(new Event('kiwy_update'));
    } else {
        await updateDoc(doc(db, collectionName, id), data);
    }
};

// 4. Apagar Documento
export const deleteDocument = async (collectionName: string, id: string) => {
    if (isLocal) {
        let existing = JSON.parse(localStorage.getItem(`kiwy_${collectionName}`) || '[]');
        existing = existing.filter((doc: any) => doc.id !== id);
        localStorage.setItem(`kiwy_${collectionName}`, JSON.stringify(existing));
        window.dispatchEvent(new Event('kiwy_update'));
    } else {
        await deleteDoc(doc(db, collectionName, id));
    }
};