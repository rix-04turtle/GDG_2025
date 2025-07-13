import { useEffect, useState } from 'react';
import { fetchDonations, claimDonation } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BrowseDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const { user } = useAuth();

  const loadDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDonations();
      setDonations(data);
    } catch (err) {
      setError('Failed to fetch donations.');
    }
    setLoading(false);
  };

  const handleClaim = async (donationId) => {
    if (!user) {
      alert('Please login to claim a donation');
      return;
    }
    
    setClaimingId(donationId);
    try {
      await claimDonation(donationId, user.uid);
      // Refresh the donations list
      await loadDonations();
    } catch (err) {
      setError('Failed to claim donation.');
    }
    setClaimingId(null);
  };

  useEffect(() => {
    loadDonations();
  }, []);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Browse Donations</h1>
        <div className="flex justify-center mb-6">
          <button
            onClick={loadDonations}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium shadow hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-600">No donations available.</p>
        ) : (
          <ul className="space-y-6">
            {donations.map(donation => (
              <li key={donation.id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{donation.title}</h2>
                  <p className="text-gray-700 mb-1">{donation.description}</p>
                  <p className="text-gray-500 text-sm mb-1">Location: {donation.location}</p>
                  <p className="text-gray-500 text-sm mb-1">Quantity: {donation.quantity}</p>
                  {donation.expiry && (
                    <p className="text-gray-500 text-sm">Expiry: {donation.expiry.seconds ? new Date(donation.expiry.seconds * 1000).toLocaleDateString() : ''}</p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                  {donation.claimedBy ? (
                    <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium">Claimed</span>
                  ) : user ? (
                    <Button 
                      onClick={() => handleClaim(donation.id)}
                      disabled={claimingId === donation.id}
                      className="px-4 py-2 rounded font-medium transition bg-green-600 text-white hover:bg-green-700"
                    >
                      {claimingId === donation.id ? 'Claiming...' : 'Claim'}
                    </Button>
                  ) : (
                    <div className="text-center">
                      <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition">
                        Login to Claim
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 text-center">
          <Link href="/add-donation" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            Add Donation
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
