import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Button } from './ui/button';

export default function Navigation() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Nourish
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/browse"
                className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Donations
              </Link>
              <Link
                href="/add-donation"
                className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Add Donation
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            {user ? (
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            ) : (
              <div className="space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}