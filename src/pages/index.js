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
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
				<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314z" />
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
				<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z"
				/>
			</svg>
		),
	},	
];

const Home = () => {
	return (
		<>
			<Navigation />
			<main className="min-h-screen bg-[#F0FDF4] flex flex-col pt-20">
				{/* Hero Section */}
				<section className="relative flex flex-1 flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-br from-[#E8F5E9] via-[#F0FDF4] to-[#E0F2F7] overflow-hidden">
				<motion.h1
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: 'easeOut' }}
					className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-6 tracking-tight drop-shadow-md"
				>
					Welcome to <span className="text-[#10B981]">MealBridge</span>
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
						className="inline-block px-10 py-5 bg-[#10B981] text-white font-bold rounded-full shadow-lg hover:bg-[#059669] hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-[#10B981]/50"
					>
						Browse Donations
					</Link>
				</motion.div>
				</section>
				<div className="w-full border-t border-slate-200"></div>
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
					className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-center items-start"
				>
					{features.map((feature, idx) => (
						<motion.div
							key={idx}
							variants={{
								hidden: { opacity: 0, y: 40 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: idx * 0.1 } },
							}}
							className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center border border-slate-100 hover:shadow-xl hover:border-[#10B981] transition-all"
						>
							<span className="mb-6 p-4 bg-slate-100 rounded-full">{feature.icon}</span>
							<h3 className="mt-2 text-xl font-bold text-slate-800">
								{feature.title}
							</h3>
							<p className="mt-3 text-slate-600 text-base leading-relaxed">{feature.description}</p>
						</motion.div>
					))}
				</motion.div>
			</section>
			<div className="w-full border-t border-slate-200"></div>
			{/* CTA Section */}
			<section className="bg-gradient-to-r from-[#ECFDF5] to-[#D1FAE5] px-4 py-20">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className="max-w-4xl mx-auto text-center"
				>
					<h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 drop-shadow-sm">
						Ready to make a difference?
					</h2>
					<p className="text-xl text-slate-600 mb-10 leading-relaxed">
						Post a donation today and help reduce food waste while supporting your community.
					</p>
					<Link
						href="/add-donation"
						className="inline-block px-10 py-5 bg-[#F59E0B] text-white font-bold rounded-full shadow-lg hover:bg-[#D97706] hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/50"
					>
						Post a Donation
					</Link>
				</motion.div>
			</section>
			{/* Footer */}
			<footer className="bg-slate-800 text-white py-8 px-4">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.6 }}
					className="max-w-5xl mx-auto text-center text-slate-400 text-sm"
				>
					&copy; {new Date().getFullYear()} MealBridge. All rights reserved. |{' '}
					<Link href="#" className="hover:underline">Privacy Policy</Link> |{' '}
					<Link href="#" className="hover:underline">Terms of Service</Link>
				</motion.div>
			</footer>
		</main>
	</>
	);
};

export default Home;