import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Languages, Layers, BookOpen, BarChart3, Settings } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LingoRevive - Translate & Review',
  description: 'Translate naturally and review smartly with Spaced Repetition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Languages className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">LingoRevive</span>
            </div>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link href="/" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">Translate</span>
              </Link>
              <Link href="/history" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <Link href="/review" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Review</span>
              </Link>
              <Link href="/report" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </Link>
              <Link href="/settings" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
