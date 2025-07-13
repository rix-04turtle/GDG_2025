import Link from 'next/link';

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
		<main className="min-h-screen bg-gray-50 flex flex-col">
			{/* Hero Section */}
			<section className="flex flex-1 flex-col justify-center items-center text-center px-4 py-12 bg-gradient-to-br from-blue-100 to-green-100">
				<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
					Welcome to KindBite
				</h1>
				<p className="text-xl md:text-2xl text-gray-700 mb-8">
					Share Food. Share Kindness.
				</p>
				<Link
					href="/browse"
					className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
				>
					Browse Donations
				</Link>
			</section>
			{/* Features Section */}
			<section className="max-w-4xl mx-auto w-full px-4 py-10">
				<div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
					{features.map((feature, idx) => (
						<div
							key={idx}
							className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center text-center"
						>
							{feature.icon}
							<h3 className="mt-4 text-lg font-bold text-gray-900">
								{feature.title}
							</h3>
							<p className="mt-2 text-gray-600">{feature.description}</p>
						</div>
					))}
				</div>
			</section>
		</main>
	);
};

export default Home;