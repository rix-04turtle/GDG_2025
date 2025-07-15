import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserDonations, fetchUserClaimedDonations } from '../firebase';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import { User, Mail, Package, CheckCircle, XCircle, UploadCloud, Pencil, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default function Profile() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [claimedDonations, setClaimedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      const loadUserDonations = async () => {
        setLoading(true);
        setError('');
        try {
          const userDonations = await fetchUserDonations(user.uid);
          setDonations(userDonations);
          const claimed = await fetchUserClaimedDonations(user.uid);
          setClaimedDonations(claimed);
        } catch (err) {
          setError('Failed to fetch your donations.');
          console.error(err);
        }
        setLoading(false);
      };
      loadUserDonations();
    }
  }, [user]);

  // Edit profile handlers
  const handleEditProfile = () => {
    setEditMode(true);
    setEditError('');
    setEditSuccess('');
    setNewName(user?.displayName || '');
    setPhotoPreview(user?.photoURL || null);
    setNewPhoto(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (file) {
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setNewPhoto(null);
      setPhotoPreview(user?.photoURL || null);
    }
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      let photoURL = user.photoURL;
      if (newPhoto) {
        // Upload to Firebase Storage
        const { storage } = await import('../firebase');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const imageRef = ref(storage, `profile/${user.uid}/${Date.now()}_${newPhoto.name}`);
        await uploadBytes(imageRef, newPhoto);
        photoURL = await getDownloadURL(imageRef);
      }
      
      // Update the user's profile with Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: newName,
        photoURL,
      });
      
      setEditSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Clear the form
      setNewPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
    } catch (err) {
      console.error('Profile update error:', err);
      setEditError('Failed to update profile. Please try again.');
    }
    setEditLoading(false);
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      setResetError('Failed to send reset email. Please try again.');
    }
    setResetLoading(false);
  };

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-slate-50 pt-24">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="border-4 border-primary/20 p-1 rounded-full cursor-pointer hover:border-primary/40 transition-colors" onClick={() => user.photoURL && setShowProfileModal(true)}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full object-cover shadow-lg" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                {editMode && (
                  <button
                    onClick={() => document.getElementById('profile-pic').click()}
                    className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 hover:bg-amber-500 transition-colors shadow-lg"
                  >
                    <UploadCloud className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-1">{user.displayName || 'User Profile'}</h1>
                <div className="flex items-center text-slate-600 mb-2">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-lg">{user.email}</span>
                </div>
                <p className="text-slate-500">Member since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleEditProfile} className="rounded-xl px-4 py-2 font-semibold shadow-md hover:bg-primary hover:text-white transition-all">
                  <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(v => !v)} className="rounded-xl px-4 py-2 font-semibold shadow-md hover:bg-primary hover:text-white transition-all">
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </Button>
              </div>
            </div>
            
            {editMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border-t border-slate-200 pt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="name" className="text-lg font-semibold text-slate-800">Display Name</Label>
                    <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="text-lg" />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="profile-pic" className="text-lg font-semibold text-slate-800">Profile Picture</Label>
                    <Input id="profile-pic" type="file" accept="image/*" onChange={handlePhotoChange} className="text-lg" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveProfile} disabled={editLoading} className="bg-primary hover:bg-amber-500 rounded-xl px-6 py-2 font-bold shadow-md transition-all">
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} className="rounded-xl px-6 py-2 font-semibold">
                    Cancel
                  </Button>
                </div>
                {editError && <p className="text-red-500 text-sm mt-3 font-semibold animate-pulse">{editError}</p>}
                {editSuccess && <p className="text-green-600 text-sm mt-3 font-semibold animate-fade-in">{editSuccess}</p>}
              </motion.div>
            )}

            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border-t border-slate-200 pt-6"
              >
                <div className="space-y-4">
                  <Label htmlFor="reset-email" className="text-lg font-semibold text-slate-800">Send password reset to:</Label>
                  <Input id="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="text-lg" />
                  <Button onClick={handlePasswordReset} disabled={resetLoading} className="bg-amber-500 hover:bg-primary rounded-xl px-6 py-2 font-bold shadow-md transition-all">
                    {resetLoading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  {resetError && <p className="text-red-500 text-sm font-semibold animate-pulse">{resetError}</p>}
                  {resetSuccess && <p className="text-green-600 text-sm font-semibold animate-fade-in">{resetSuccess}</p>}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Donations Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Donations */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
                <Package className="h-7 w-7 mr-3 text-primary" /> Your Donations
              </h2>
              {loading ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">Loading your donations...</p>
                </div>
              ) : error ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <p className="text-red-500 font-semibold animate-pulse">{error}</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No donations yet</h3>
                  <p className="text-slate-600 mb-4">You haven't made any donations yet.</p>
                  <Link href="/add-donation">
                    <Button className="bg-primary hover:bg-amber-500 rounded-xl px-6 py-2 font-bold shadow-md transition-all">
                      Add Your First Donation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map(donation => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={donation.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'} alt={donation.title} className="h-16 w-16 rounded-xl object-cover shadow-md" />
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{donation.title}</h3>
                            <p className="text-slate-600 text-sm mb-1">{donation.description}</p>
                            <p className="text-slate-500 text-sm">Quantity: {donation.quantity} {donation.unit ? donation.unit : ''}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          {donation.claimedBy ? (
                            <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                              <CheckCircle className="h-4 w-4 mr-1.5" /> Claimed
                            </span>
                          ) : (
                            <span className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">
                              <XCircle className="h-4 w-4 mr-1.5" /> Available
                            </span>
                          )}
                          <Link href={`/chat/${donation.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 font-semibold shadow-md hover:bg-primary hover:text-white transition-all">
                              View Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Claimed Donations */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
                <Package className="h-7 w-7 mr-3 text-primary" /> Donations You've Claimed
              </h2>
              {loading ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">Loading claimed donations...</p>
                </div>
              ) : error ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <p className="text-red-500 font-semibold animate-pulse">{error}</p>
                </div>
              ) : claimedDonations.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No claimed donations</h3>
                  <p className="text-slate-600 mb-4">You haven't claimed any donations yet.</p>
                  <Link href="/browse">
                    <Button className="bg-primary hover:bg-amber-500 rounded-xl px-6 py-2 font-bold shadow-md transition-all">
                      Browse Donations
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {claimedDonations.map(donation => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={donation.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'} alt={donation.title} className="h-16 w-16 rounded-xl object-cover shadow-md" />
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{donation.title}</h3>
                            <p className="text-slate-600 text-sm mb-1">{donation.description}</p>
                            <p className="text-slate-500 text-sm">Quantity: {donation.quantity} {donation.unit ? donation.unit : ''}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Claimed
                          </span>
                          <Link href={`/chat/${donation.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 font-semibold shadow-md hover:bg-primary hover:text-white transition-all">
                              View Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Profile Picture Modal */}
      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <img src={user.photoURL} alt="Profile Large" className="w-full h-auto rounded-xl shadow-lg" />
            <Button className="mt-4 w-full rounded-xl font-bold" onClick={() => setShowProfileModal(false)}>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </ProtectedRoute>
  );
}
