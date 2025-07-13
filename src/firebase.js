// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';

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

export { app, auth, db, getCurrentUser, fetchDonations, claimDonation, addDonation, fetchUserDonations };