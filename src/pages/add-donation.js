import { useState, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';
import GoogleMaps from '../components/GoogleMaps'; // Import the new component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2, CheckCircle, XCircle, UploadCloud } from 'lucide-react';

export default function AddDonation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleLocationChange = useCallback((newCoords) => {
    setCoords(newCoords);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!coords) {
      setError('Please set a location on the map.');
      setLoading(false);
      return;
    }
    if (!image) {
      setError('Please upload an image for the donation.');
      setLoading(false);
      return;
    }
    try {
      // 1. Upload image to Firebase Storage
      const imageRef = ref(storage, `donations/${user.uid}/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // 2. Add donation to Firestore with image URL
      await addDoc(collection(db, 'donations'), {
        title,
        description,
        location,
        quantity,
        expiry: expiry ? Timestamp.fromDate(new Date(expiry)) : null,
        imageUrl,
        coordinates: { latitude: coords.latitude, longitude: coords.longitude },
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
      setImage(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setCoords(null);
      setTimeout(() => router.push('/browse'), 1500);
    } catch (err) {
      setError('Failed to add donation.');
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Add a New Food Donation</CardTitle>
            <CardDescription>Fill out the form below to list a new donation.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Food Image</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-md object-cover" />
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <Input id="image" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {image && !imagePreview && <p className="text-sm text-green-600 text-center pt-2">{`Image selected: ${image.name}`}</p>}
                {imagePreview && (
                  <div className="text-center pt-2">
                    <Button type="button" variant="link" onClick={() => document.getElementById('image').click()}>
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Leftover Sandwiches" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the food item(s)" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (e.g. Area, Landmark)</Label>
                <Input id="location" placeholder="e.g., Central Park Bench" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pin Location on Map</Label>
                <GoogleMaps onLocationChange={handleLocationChange} />
                {coords && <p className="text-sm text-green-600 text-center pt-2">{`Coordinates captured: Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (meals)</Label>
                  <Input id="quantity" type="number" min="1" placeholder="e.g., 5" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
                </div>
              </div>
              {error && (
                <div className="flex items-center justify-center text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  <XCircle className="mr-2 h-4 w-4" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center justify-center text-sm text-green-500 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="mr-2 h-4 w-4" /> {success}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Adding...' : 'Add Donation'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}