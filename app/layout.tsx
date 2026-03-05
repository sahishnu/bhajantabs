import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BhajanTabs',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕉</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body style={{ backgroundColor: '#FBF7F0' }}>
        <AuthProvider>
          <div className="min-h-screen bg-cream flex flex-col">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
              {children}
            </main>
            <footer className="border-t border-border py-6 text-center text-sm text-ink-muted">
              🙏 BhajanTabs
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
