import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { BsList, BsX } from 'react-icons/bs';
import Sidebar from '../Sidebar';
import Player from '../Player';
import LoadingState from '../LoadingState';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, loadingMessage } = useSelector(state => state.loading);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-green-500 rounded-full shadow-lg"
      >
        {isMobileMenuOpen ? <BsX size={24} /> : <BsList size={24} />}
      </button>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-0 bg-black z-40 lg:relative lg:translate-x-0"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 relative">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50"
              >
                <LoadingState message={loadingMessage} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Player */}
      <Player />
    </div>
  );
};

export default Layout;
