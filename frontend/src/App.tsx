import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ImportPage from './pages/ImportPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
