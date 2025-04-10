import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Store and Redux setup
import store from './store';
import { setUser } from './store/slices/authSlice';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Wrapped = lazy(() => import('./pages/Wrapped'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const Player = lazy(() => import('./components/Player'));
const Playlists = lazy(() => import('./pages/Playlists'));
const Library = lazy(() => import('./pages/Library'));
const History = lazy(() => import('./pages/History'));
const Layout = lazy(() => import('./components/Layout'));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));

// Fallback loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen bg-black text-white">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-green-500"></div>
  </div>
);

// Wrapper to handle initial user setup
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Create an anonymous user session
    const anonymousUser = {
      id: 'anonymous-user',
      username: 'Anonymous',
      email: 'anonymous@mimo.com',
      isAnonymous: true
    };

    dispatch(setUser(anonymousUser));
  }, [dispatch]);

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="wrapped" element={<Wrapped />} />
            <Route path="history" element={<History />} />
            <Route path="playlists" element={<Playlists />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Suspense>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Provider>
  );
}

export default App;
