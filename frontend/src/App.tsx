import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductPage from './pages/ProductPage/ProductPage';

const StatusPage = lazy(() => import('./pages/StatusPage/StatusPage'));

function App() {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/status/:id" element={<StatusPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
