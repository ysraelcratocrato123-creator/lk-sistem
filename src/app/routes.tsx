import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/auth';

// Importações das Páginas
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewSale from './pages/NewSale';
import CustomerRegister from './pages/CustomerRegister';
import ProductRegister from './pages/ProductRegister';
import Reports from './pages/Reports';
import SalesHistory from './pages/SalesHistory';

// Componente para proteger as telas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return auth.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota de Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas Protegidas */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/vendas" element={<PrivateRoute><NewSale /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><CustomerRegister /></PrivateRoute>} />
      <Route path="/produtos" element={<PrivateRoute><ProductRegister /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/historico" element={<PrivateRoute><SalesHistory /></PrivateRoute>} />

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};