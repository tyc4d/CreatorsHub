import { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background-light to-gray-100 dark:from-background-dark dark:to-gray-900">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <header className="relative z-10 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
        <nav className="container-custom">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold gradient-text">CreatorsHub</h1>
              <div className="hidden sm:flex space-x-6">
                <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  首頁
                </a>
                <a href="/history" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  交易歷史
                </a>
                {/* 未來可以在這裡添加更多導航連結 */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
          {/* 手機版導航 */}
          <div className="sm:hidden py-2 -mt-1 flex space-x-6">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              首頁
            </a>
            <a href="/history" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              交易歷史
            </a>
            {/* 未來可以在這裡添加更多導航連結 */}
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex-grow w-full py-12">
        <div className="container-custom flex justify-center">
          {children}
        </div>
      </main>

      <footer className="relative z-10 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-t border-gray-200 dark:border-gray-700">
        <div className="container-custom py-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2024 CreatorsHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}; 