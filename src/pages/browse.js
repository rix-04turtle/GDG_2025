import { useEffect, useState } from 'react';
import { fetchDonations, claimDonation } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, MapPin, Calendar, Package, User, MessageSquare, LogIn, UtensilsCrossed } from 'lucide-react';

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
      // Filter out donations that are claimed by someone other than the current user, unless the current user is the creator
      const filteredData = data.filter(d => !d.claimedBy || (user && (d.claimedBy === user.uid || d.createdBy === user.uid)));
      setDonations(filteredData);
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
  }, [user]); // Reload donations when user logs in or out

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Browse Donations</h1>
            <div className="flex items-center gap-4">
              <Link href="/add-donation">
                <Button>Add Donation</Button>
              </Link>
              <Button
                onClick={loadDonations}
                variant="outline"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : donations.length === 0 ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donations available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later or add a new donation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map(donation => (
                <Card key={donation.id} className="flex flex-col">
                  <CardHeader className="p-0">
                    <img src={donation.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'} alt={donation.title} className="w-full h-48 object-cover rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <CardTitle className="text-xl mb-2">{donation.title}</CardTitle>
                    <CardDescription className="mb-4">{donation.description}</CardDescription>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {donation.location}</div>
                      <div className="flex items-center"><Package className="h-4 w-4 mr-2 text-gray-400" /> Quantity: {donation.quantity}</div>
                      {donation.expiry && (
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" /> Expiry: {donation.expiry.seconds ? new Date(donation.expiry.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                      )}
                      <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-400" /> Donated by: {donation.createdByEmail || 'Anonymous'}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {donation.claimedBy ? (
                      (user && (user.uid === donation.createdBy || user.uid === donation.claimedBy)) ? (
                        <Link href={`/chat/${donation.id}`} className="w-full">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="secondary" className="w-full justify-center py-2">Claimed</Badge>
                      )
                    ) : user ? (
                      <Button 
                        onClick={() => handleClaim(donation.id)}
                        disabled={claimingId === donation.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {claimingId === donation.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {claimingId === donation.id ? 'Claiming...' : 'Claim'}
                      </Button>
                    ) : (
                      <Link href="/login" className="w-full">
                        <Button className="w-full">
                          <LogIn className="mr-2 h-4 w-4" /> Login to Claim
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
