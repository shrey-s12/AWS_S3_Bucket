import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import GalleryPage from './pages/GalleryPage';
import Layout from './components/Layout';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
