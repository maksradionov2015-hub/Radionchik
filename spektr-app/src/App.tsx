import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Landing } from '@/pages/Landing';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Остальные маршруты будут добавлены по мере разработки */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
