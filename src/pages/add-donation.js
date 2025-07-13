import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';

export default function AddDonation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'donations'), {
        title,
        description,
        location,
        quantity,
        expiry: expiry ? Timestamp.fromDate(new Date(expiry)) : null,
        createdAt: Timestamp.now(),
        createdBy: user.uid, // Add the user ID who created the donation
        createdByEmail: user.email, // Optionally store the email too
        claimedBy: null,
      });
      setSuccess('Donation added successfully!');
      setTitle('');
      setDescription('');
      setLocation('');
      setQuantity('');
      setExpiry('');
      setTimeout(() => router.push('/browse'), 1500);
    } catch (err) {
      setError('Failed to add donation.');
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add Food Donation</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Quantity (e.g. meals)"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Expiry Date"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-2 text-center">{success}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Donation'}
        </button>
      </form>
    </div>
    </ProtectedRoute>
  );
}
