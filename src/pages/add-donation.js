import { useState, useCallback } from 'react';
import { db, storage, model } from '../firebase';
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
import { MapPin, Loader2, CheckCircle, XCircle, UploadCloud, Search, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unit, setUnit] = useState('meals');
  const [isDragOver, setIsDragOver] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleLocationChange = useCallback((newCoords) => {
    setCoords(newCoords);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError('');
  };

  const handleImageAnalysis = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }
    setIsScanning(true);
    setError('');
    setAnalysisResult(null);

    try {
      const prompt = "Analyze this image of food. Provide a JSON response with three keys: 'foodName' (a short, descriptive name for the food), 'description' (a brief description suitable for a food donation listing), and 'isEatable' (a boolean, true if the food appears to be safe to eat, false otherwise). Your response must be only the JSON object, without any markdown formatting.";
      
      const result = await model.generateContent([prompt, {inlineData: {data: await image.arrayBuffer().then(buffer => btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))), mimeType: image.type}}]);
      const responseText = result.response.text();
      
      const jsonResponse = JSON.parse(responseText);
      
      if (jsonResponse.isEatable) {
        setTitle(jsonResponse.foodName);
        setDescription(jsonResponse.description);
        setAnalysisResult({ success: 'Image analyzed successfully! Form updated.' });
      } else {
        setError('AI analysis suggests this item may not be eatable. Please upload a different image.');
        setAnalysisResult({ error: 'Item may not be eatable.' });
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError('Failed to analyze image. Please try again or fill the form manually.');
    } finally {
      setIsScanning(false);
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
    
    // Check if the image has been analyzed and is eatable
    if (!analysisResult?.success) {
      setError('Please analyze the image first to verify it contains edible food items.');
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
        unit,
        expiry: expiry ? Timestamp.fromDate(new Date(expiry)) : null,
        imageUrl,
        coordinates: { latitude: coords.latitude, longitude: coords.longitude },
        createdAt: Timestamp.now(),
        createdBy: user.uid,
        createdByEmail: user.email,
        claimedBy: null,
      });
      setSuccess('Donation added successfully!');
      setTitle('');
      setDescription('');
      setLocation('');
      setQuantity('');
      setUnit('meals');
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
      <div className="min-h-screen bg-slate-50 pt-24">
  {/* Hero Section */}
  <div className="bg-gradient-to-r from-yellow-20 via-yellow-70 to-yellow-20 py-12">
    <div className="container mx-auto px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-4xl md:text-5xl font-extrabold text-black-800 mb-4"
      >
        Share Your Food
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        className="text-xl text-black-900/90 max-w-2xl mx-auto"
      >
        Help reduce food waste and support your community by donating surplus food items
      </motion.p>
    </div>
  </div>


        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload & Basic Information */}
                <div className="space-y-6">
                  {/* Food Image Section */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Food Image</h2>
                      <p className="text-slate-600">Upload a clear photo of the food you're donating</p>
                    </div>
                    
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        isDragOver 
                          ? 'border-primary bg-primary/5' 
                          : 'border-slate-200 bg-slate-50/60'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-64 w-auto rounded-xl object-cover shadow-lg" 
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="mx-auto h-16 w-16 text-primary/60" />
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-700">Upload your food image</h3>
                            <p className="text-slate-500">Drag and drop your image here, or click to browse</p>
                            <label
                              htmlFor="image"
                              className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-amber-500 transition-all text-lg shadow-lg hover:scale-105"
                            >
                              Choose File
                              <Input 
                                id="image" 
                                name="image" 
                                type="file" 
                                className="sr-only" 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                required 
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {imagePreview && (
                      <div className="flex gap-3 justify-center mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('image').click()}
                          className="rounded-xl px-4 py-2 font-semibold shadow-md"
                        >
                          Change Image
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleImageAnalysis} 
                          disabled={isScanning || !image}
                          className="bg-amber-500 hover:bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all"
                        >
                          {isScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isScanning ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                      </div>
                    )}
                    
                    {analysisResult?.success && (
                      <div className="text-center p-3 bg-green-50 rounded-xl mt-4 animate-fade-in">
                        <p className="text-green-600 font-semibold">{analysisResult.success}</p>
                      </div>
                    )}
                    {analysisResult?.error && (
                      <div className="text-center p-3 bg-red-50 rounded-xl mt-4 animate-pulse">
                        <p className="text-red-500 font-semibold">{analysisResult.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Basic Information Section */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Basic Information</h2>
                      <p className="text-slate-600">Tell us about the food you're donating</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-lg font-semibold text-slate-800">Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g., Leftover Sandwiches" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          required 
                          className="text-lg py-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-lg font-semibold text-slate-800">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Describe the food item(s) in detail..." 
                          value={description} 
                          onChange={e => setDescription(e.target.value)} 
                          required 
                          className="min-h-24 text-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-lg font-semibold text-slate-800">Quantity</Label>
                          <Input 
                            id="quantity" 
                            type="number" 
                            min="1" 
                            placeholder="e.g., 5" 
                            value={quantity} 
                            onChange={e => setQuantity(e.target.value)} 
                            required 
                            className="text-lg py-3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit" className="text-lg font-semibold text-slate-800">Unit</Label>
                          <select 
                            id="unit" 
                            value={unit} 
                            onChange={e => setUnit(e.target.value)} 
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                          >
                            <option value="meals">Meals</option>
                            <option value="packets">Packets</option>
                            <option value="kg">Kg</option>
                            <option value="liters">Liters</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-lg font-semibold text-slate-800">Expiry Date (Optional)</Label>
                        <Input 
                          id="expiry" 
                          type="date" 
                          value={expiry} 
                          onChange={e => setExpiry(e.target.value)} 
                          className="text-lg py-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Location & Submit */}
                <div className="space-y-6">
                  {/* Location Section */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Location</h2>
                      <p className="text-slate-600">Set the pickup location for your donation</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold text-slate-800">Search Location</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="Search for a location..."
                            value={mapSearchQuery}
                            onChange={(e) => setMapSearchQuery(e.target.value)}
                            className="pl-10 text-lg py-3"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-lg font-semibold text-slate-800">Location Description</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g., Central Park Bench, Downtown Area" 
                          value={location} 
                          onChange={e => setLocation(e.target.value)} 
                          required 
                          className="text-lg py-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-lg font-semibold text-slate-800">Pin Location on Map</Label>
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg h-48">
                          <GoogleMaps onLocationChange={handleLocationChange} />
                        </div>
                      </div>

                      {coords && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-green-700 font-semibold">Location Set</p>
                            <p className="text-green-600 text-sm">
                              Coordinates: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-red-700 font-semibold">Error</p>
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-green-700 font-semibold">Success</p>
                          <p className="text-green-600 text-sm">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Ready to Share?</h2>
                      <p className="text-slate-600 mb-6">Your donation will help someone in need</p>
                      <Button 
                        type="submit" 
                        className="w-full text-lg py-4 rounded-xl shadow-lg hover:bg-amber-500 hover:scale-105 transition-all font-bold" 
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                        {loading ? 'Adding Donation...' : 'Share Your Donation'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}