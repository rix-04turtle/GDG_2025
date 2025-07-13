// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';

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

export { app, auth, db, fetchDonations, claimDonation, addDonation };