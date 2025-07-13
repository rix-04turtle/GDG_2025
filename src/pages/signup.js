import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Signup successful!');
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSignup}>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-2 text-center">{success}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition">Sign Up</button>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </form>
    </div>
    </>
  );
}