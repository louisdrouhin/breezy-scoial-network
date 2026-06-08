'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  return (
    <>
      {!isAuthPage && (
        <>
          {/* Desktop Navbar */}
          <div className="desktop-navbar">
            <Navbar />
          </div>

          {/* Mobile Header */}
          <div className="mobile-header">
            <MobileHeader />
          </div>

          {/* Mobile Bottom Nav */}
          <div className="mobile-bottom-nav">
            <MobileBottomNav />
          </div>
        </>
      )}
      {children}
    </>
  );
}
