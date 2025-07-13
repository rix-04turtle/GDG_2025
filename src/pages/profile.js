import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserDonations } from '../firebase';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import { User, Mail, Package, CheckCircle, XCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const loadUserDonations = async () => {
        setLoading(true);
        setError('');
        try {
          const userDonations = await fetchUserDonations(user.uid);
          setDonations(userDonations);
        } catch (err) {
          setError('Failed to fetch your donations.');
          console.error(err);
        }
        setLoading(false);
      };
      loadUserDonations();
    }
  }, [user]);

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Profile Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.displayName || 'User Profile'}</h1>
                <div className="flex items-center text-gray-500 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User's Donations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="h-6 w-6 mr-2" />
              Your Donations
            </h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading your donations...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : donations.length === 0 ? (
              <div className="text-center bg-white shadow rounded-lg p-8">
                <p className="text-gray-600">You haven't made any donations yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {donations.map(donation => (
                  <li key={donation.id} className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{donation.title}</h3>
                      <p className="text-gray-600 text-sm">{donation.description}</p>
                      <p className="text-gray-500 text-sm mt-1">Quantity: {donation.quantity}</p>
                    </div>
                    <div>
                      {donation.claimedBy ? (
                        <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Claimed
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Not Claimed
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
