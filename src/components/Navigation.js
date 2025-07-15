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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-lg border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">
              MealBridge
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/browse"
                className="relative group text-slate-700 hover:text-primary px-3 py-2 rounded-md text-base font-semibold transition-colors duration-150"
              >
                Browse Donations
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
              </Link>
              <Link
                href="/add-donation"
                className="relative group text-slate-700 hover:text-primary px-3 py-2 rounded-md text-base font-semibold transition-colors duration-150"
              >
                Add Donation
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className="relative group text-slate-700 hover:text-primary px-3 py-2 rounded-md text-base font-semibold transition-colors duration-150"
                >
                  Profile
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            {user ? (
              <Button onClick={handleLogout} variant="outline" className="rounded-xl px-5 py-2 text-base font-semibold shadow-md hover:bg-primary hover:text-white transition-all">
                Logout
              </Button>
            ) : (
              <div className="space-x-2">
                <Button asChild variant="ghost" className="rounded-xl px-5 py-2 text-base font-semibold">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-xl px-5 py-2 text-base font-semibold">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* Implement hamburger menu here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}