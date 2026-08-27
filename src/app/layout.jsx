import '@/styles/globals.css';
import '@/styles/navbar.css';
import '@/styles/sidebar.css';
import '@/styles/login.css';
import '@/styles/dashboard.css';
import '@/styles/booking.css';
import '@/styles/ride.css';
import '@/styles/admin.css';
import '@/styles/modal.css';
import '@/styles/responsive.css';

import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Ride Sharing System | Car & Bike Platform (MCA Project)',
  description: 'Frontend-only Web-Based Ride Sharing System for Car and Bike rides with dynamic fare calculation and LocalStorage persistence.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
