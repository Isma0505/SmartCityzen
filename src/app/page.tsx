'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LandingPage from '@/components/landing/LandingPage';
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import WargaDashboard from '@/components/dashboard/WargaDashboard';
import CreateReportForm from '@/components/reports/CreateReportForm';
import AIAnalysisResult from '@/components/reports/AIAnalysisResult';
import CityMap from '@/components/map/CityMap';
import GovernmentDashboard from '@/components/government/GovernmentDashboard';
import TrackingPage from '@/components/tracking/TrackingPage';
import StatisticsPage from '@/components/statistics/StatisticsPage';
import ProfilePage from '@/components/profile/ProfilePage';
import ReportDetail from '@/components/reports/ReportDetail';

export default function Home() {
  const { currentPage, user } = useStore();

  const { setCurrentPage } = useStore();

  // Pages accessible without login
  const publicPages = ['landing', 'login', 'register', 'peta', 'statistik'];

  // Reset to landing if no user and on protected page
  useEffect(() => {
    if (!user && !publicPages.includes(currentPage)) {
      setCurrentPage('landing');
    }
  }, [user, currentPage, setCurrentPage]);

  // Seed data on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }, []);

  // Redirect to login if trying to access protected pages
  const protectedPages = [
    'dashboard-warga', 'buat-laporan', 'analisis', 'tracking',
    'dashboard-pemerintah', 'profil', 'report-detail',
  ];
  const needsAuth = protectedPages.includes(currentPage);

  const showNavbar = !['landing', 'login', 'register'].includes(currentPage);
  const showFooter = !['login', 'register'].includes(currentPage);

  const renderPage = () => {
    if (needsAuth && !user) {
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard-warga':
        return <WargaDashboard />;
      case 'buat-laporan':
        return <CreateReportForm />;
      case 'analisis':
        return <AIAnalysisResult />;
      case 'peta':
        return <CityMap />;
      case 'dashboard-pemerintah':
        return <GovernmentDashboard />;
      case 'tracking':
        return <TrackingPage />;
      case 'statistik':
        return <StatisticsPage />;
      case 'profil':
        return <ProfilePage />;
      case 'report-detail':
        return <ReportDetail />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNavbar && <Navbar />}
      <main className={`flex-1 ${showNavbar ? 'pt-14' : ''}`}>
        {['landing', 'login', 'register', 'peta'].includes(currentPage) ? (
          renderPage()
        ) : (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
            {renderPage()}
          </div>
        )}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}