'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AuthModal } from '@/components/ui/auth-modal';

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState({ totalDistricts: 0, totalTrees: 0, totalOxygen: 0 });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show auth modal if auth_required param is present
  useEffect(() => {
    if (searchParams?.get('auth_required') === 'true') {
      setShowAuthModal(true);
    }
  }, [searchParams]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-50 via-white to-sky-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nature-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
              District Oxygen Intelligence
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Discover your district's oxygen demand, environmental health, and the trees needed to restore balance across India.
            </p>

            {/* CTA Button */}
            <div className="mb-20">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-3.5 bg-gray-900 text-white text-base font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              >
                Sign In to Get Started
              </button>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">All Indian Districts</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive coverage of every district across India
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Verified Data</h3>
                <p className="text-sm text-gray-600">
                  Government sources and validated environmental metrics
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Real Impact</h3>
                <p className="text-sm text-gray-600">
                  Track your contributions and see measurable environmental change
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                How It Works
              </h2>
              <p className="text-gray-500">
                Transparent methodology powered by scientific research
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Select District',
                  description: 'Choose any Indian district to analyze its environmental health',
                },
                {
                  step: '2',
                  title: 'Fetch Data',
                  description: 'We aggregate population, AQI, soil quality, and disaster data from verified sources',
                },
                {
                  step: '3',
                  title: 'Calculate Demand',
                  description: 'Scientific formulas estimate oxygen requirements based on population and environmental factors',
                },
                {
                  step: '4',
                  title: 'Take Action',
                  description: 'Plant trees or donate to verified NGOs to bridge the oxygen gap',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                Why Vayura?
              </h2>
              <p className="text-gray-500">
                Comprehensive environmental intelligence for every Indian district
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verified Data Sources
                </h3>
                <p className="text-sm text-gray-600">
                  All data comes from government sources, validated and attributed
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Transparent Calculations
                </h3>
                <p className="text-sm text-gray-600">
                  Every formula and assumption is visible and explained
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Impact
                </h3>
                <p className="text-sm text-gray-600">
                  Track your contributions and see state-level rankings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Every tree counts. Start by exploring your district's environmental health and contributing to India's green movement.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3.5 bg-white text-gray-900 text-base font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign In to Get Started
            </button>
          </div>
        </section>
      </div>
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-50 via-white to-sky-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    }>
      <HomeContent />
    </Suspense>
  );
}
