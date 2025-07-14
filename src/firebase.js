// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, onSnapshot, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { getGenerativeModel, GoogleAIBackend, getAI } from "firebase/ai";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv-xNm98bFz0Ay8013KVYjiAbEoTHpVdc",
  authDomain: "extension-fiem-tejas.firebaseapp.com",
  databaseURL: "https://extension-fiem-tejas-default-rtdb.firebaseio.com",
  projectId: "extension-fiem-tejas",
  storageBucket: "extension-fiem-tejas.firebasestorage.app",
  messagingSenderId: "515379981399",
  appId: "1:515379981399:web:5eeb9061da37dc64ad8712",
  measurementId: "G-T4KJQW2KQB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });


// Get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Fetch all donations from Firestore
async function fetchDonations() {
  const donationsCol = collection(db, 'donations');
  const snapshot = await getDocs(donationsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Claim a donation by updating its claimedBy field
async function claimDonation(donationId, userId) {
  const donationRef = doc(db, 'donations', donationId);
  await updateDoc(donationRef, { claimedBy: userId });
}

// Fetch a single donation by its ID
async function fetchDonationById(donationId) {
  const donationRef = doc(db, 'donations', donationId);
  const docSnap = await getDoc(donationRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Donation not found");
  }
}

// Add a new donation to Firestore
async function addDonation(donationData) {
  try {
    const donationsCol = collection(db, 'donations');
    const docRef = await addDoc(donationsCol, donationData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

// Fetch donations created by a specific user
async function fetchUserDonations(userId) {
  const donationsCol = collection(db, 'donations');
  const q = query(donationsCol, where("createdBy", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Fetch donations claimed by a specific user
async function fetchUserClaimedDonations(userId) {
  const donationsCol = collection(db, 'donations');
  const q = query(donationsCol, where("claimedBy", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Send a chat message
async function sendMessage(donationId, message) {
  const messagesCol = collection(db, 'chats', donationId, 'messages');
  await addDoc(messagesCol, {
    ...message,
    timestamp: Timestamp.now(),
  });
}

// Get real-time messages for a chat
function getMessages(donationId, callback) {
  const messagesCol = collection(db, 'chats', donationId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));
  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

export { app, auth, db, storage,ai, model, getCurrentUser, fetchDonations, claimDonation, fetchDonationById, addDonation, fetchUserDonations, fetchUserClaimedDonations, sendPasswordResetEmail, sendMessage, getMessages };