import { useEffect, useState } from 'react';
import { fetchDonations, claimDonation } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, MapPin, Calendar, Package, User, MessageSquare, LogIn, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function BrowseDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const { user } = useAuth();
  // Filter state
  const [filter, setFilter] = useState({ search: '', location: '', unit: '' });

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

  // Filtered donations
  const filteredDonations = donations.filter(d => {
    const matchesSearch = filter.search === '' || d.title.toLowerCase().includes(filter.search.toLowerCase());
    const matchesLocation = filter.location === '' || (d.location && d.location.toLowerCase().includes(filter.location.toLowerCase()));
    const matchesUnit = filter.unit === '' || (d.unit && d.unit === filter.unit);
    return matchesSearch && matchesLocation && matchesUnit;
  });

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 pt-24">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-primary drop-shadow-sm mb-4 sm:mb-0">Browse Donations</h1>
            <div className="flex items-center gap-4">
              <Link href="/add-donation">
                <Button className="rounded-xl px-6 py-2 text-base font-semibold shadow-md hover:bg-amber-500 hover:scale-105 transition-all">Add Donation</Button>
              </Link>
              <Button
                onClick={loadDonations}
                variant="outline"
                disabled={loading}
                className="rounded-xl px-6 py-2 text-base font-semibold shadow-md hover:bg-primary hover:text-white transition-all"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center"
          >
            <Input
              placeholder="Search by title..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full md:w-64"
            />
            <Input
              placeholder="Location..."
              value={filter.location}
              onChange={e => setFilter(f => ({ ...f, location: e.target.value }))}
              className="w-full md:w-64"
            />
            <select
              value={filter.unit}
              onChange={e => setFilter(f => ({ ...f, unit: e.target.value }))}
              className="w-full md:w-40 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            >
              <option value="">All Units</option>
              <option value="meals">Meals</option>
              <option value="packets">Packets</option>
              <option value="kg">Kg</option>
              <option value="liters">Liters</option>
              <option value="other">Other</option>
            </select>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 font-semibold animate-pulse">{error}</p>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-slate-400 animate-fade-in" />
              <h3 className="mt-2 text-lg font-bold text-slate-800">No donations available</h3>
              <p className="mt-1 text-base text-slate-500">Check back later or add a new donation.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredDonations.map(donation => (
                <motion.div
                  key={donation.id}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                  }}
                >
                  <Card className="flex flex-col hover:shadow-2xl hover:scale-[1.03] transition-all">
                    <CardHeader className="p-0">
                      <img src={donation.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'} alt={donation.title} className="w-full h-48 object-cover rounded-t-xl" />
                    </CardHeader>
                    <CardContent className="flex-grow p-4">
                      <CardTitle className="text-xl mb-2 font-bold text-slate-800">{donation.title}</CardTitle>
                      <CardDescription className="mb-4 text-slate-600">{donation.description}</CardDescription>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> {donation.location}</div>
                        <div className="flex items-center"><Package className="h-4 w-4 mr-2 text-primary" /> Quantity: {donation.quantity} {donation.unit ? donation.unit : ''}</div>
                        {donation.expiry && (
                          <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-primary" /> Expiry: {donation.expiry.seconds ? new Date(donation.expiry.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                        )}
                        <div className="flex items-center"><User className="h-4 w-4 mr-2 text-primary" /> Donated by: {donation.createdByEmail || 'Anonymous'}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      {donation.claimedBy ? (
                        (user && (user.uid === donation.createdBy || user.uid === donation.claimedBy)) ? (
                          <Link href={`/chat/${donation.id}`} className="w-full">
                            <Button className="w-full bg-primary hover:bg-amber-500 rounded-xl font-bold">
                              <MessageSquare className="mr-2 h-4 w-4" /> Chat
                            </Button>
                          </Link>
                        ) : (
                          <Badge variant="secondary" className="w-full justify-center py-2 rounded-xl text-base">Claimed</Badge>
                        )
                      ) : user ? (
                        <Button 
                          onClick={() => handleClaim(donation.id)}
                          disabled={claimingId === donation.id}
                          className="w-full bg-amber-500 hover:bg-primary rounded-xl font-bold"
                        >
                          {claimingId === donation.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {claimingId === donation.id ? 'Claiming...' : 'Claim'}
                        </Button>
                      ) : (
                        <Link href="/login" className="w-full">
                          <Button className="w-full rounded-xl font-bold">
                            <LogIn className="mr-2 h-4 w-4" /> Login to Claim
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
