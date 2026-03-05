import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Nova Venda', path: '/vendas', icon: '🛒' },
    { label: 'Histórico', path: '/historico', icon: '🕙' },
    { label: 'Produtos', path: '/produtos', icon: '📦' },
    { label: 'Clientes', path: '/clientes', icon: '👥' },
    { label: 'Relatórios', path: '/relatorios', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Header com Nome e Logout */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-black text-[#1e5bb9]">LK Street</h1>
          <p className="text-xs text-gray-500 font-bold uppercase">Sistema de Gestão</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400">Administrador</p>
            <p className="text-xs font-bold text-gray-600">@admin</p>
          </div>
          <button onClick={() => { auth.logout(); navigate('/login'); }} className="text-gray-400 hover:text-red-500 text-xl">🚪</button>
        </div>
      </header>

      {/* Menu de Botões Arredondados */}
      <nav className="flex flex-wrap justify-center gap-2 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm
              ${location.pathname === item.path 
                ? 'bg-[#1e5bb9] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>

      {/* Container Centralizado do Conteúdo */}
      <main className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;