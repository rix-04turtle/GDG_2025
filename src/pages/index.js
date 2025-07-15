import Link from 'next/link';
import Navigation from '../components/Navigation';
import { motion } from 'framer-motion';

const features = [
	{
		title: 'Post a Donation',
		description: 'Help others by giving',
		icon: (
			<svg
				className="h-8 w-8 text-blue-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		),
	},
	{
		title: 'Claim Food Nearby',
		description: 'Real-time map and listings',
		icon: (
			<svg
				className="h-8 w-8 text-green-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314z"
				/>
			</svg>
		),
	},
	{
		title: 'Chat & Coordinate',
		description: 'Built-in chat and AI assistant',
		icon: (
			<svg
				className="h-8 w-8 text-purple-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z"
				/>
			</svg>
		),
	},
];

const Home = () => {
	return (
		<>
			<Navigation />
			<main className="min-h-screen bg-slate-50 flex flex-col pt-20">
			{/* Hero Section */}
			<section className="flex flex-1 flex-col justify-center items-center text-center px-4 py-16 bg-gradient-to-br from-primary/10 via-amber-50 to-slate-50 relative overflow-hidden">
				<motion.h1
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: 'easeOut' }}
					className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight drop-shadow-lg"
				>
					Welcome to <span className="text-primary">MealBridge</span>
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
					className="text-xl md:text-2xl text-slate-600 mb-8"
				>
					Share Food. Share Kindness.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
				>
					<Link
						href="/browse"
						className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-amber-500 hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-primary/30"
					>
						Browse Donations
					</Link>
				</motion.div>
			</section>
			{/* Features Section */}
			<section className="max-w-5xl mx-auto w-full px-4 py-14">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={{
						hidden: {},
						visible: { transition: { staggerChildren: 0.15 } },
					}}
					className="flex flex-col md:flex-row gap-8 justify-center items-stretch"
				>
					{features.map((feature, idx) => (
						<motion.div
							key={idx}
							variants={{
								hidden: { opacity: 0, y: 40 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
							}}
							className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-slate-200 hover:shadow-xl hover:scale-[1.025] transition-all"
						>
							<span className="mb-4">{feature.icon}</span>
							<h3 className="mt-2 text-xl font-bold text-slate-800">
								{feature.title}
							</h3>
							<p className="mt-2 text-slate-600 text-base">{feature.description}</p>
						</motion.div>
					))}
				</motion.div>
			</section>
		</main>
	</>
	);
};

export default Home;