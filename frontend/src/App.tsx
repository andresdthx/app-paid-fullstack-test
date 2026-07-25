import { Routes, Route } from 'react-router-dom';
import ProductPage from './pages/ProductPage/ProductPage';
import StatusPage from './pages/StatusPage/StatusPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/status/:id" element={<StatusPage />} />
    </Routes>
  );
}

export default App;
