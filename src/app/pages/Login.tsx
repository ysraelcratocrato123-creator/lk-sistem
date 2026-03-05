import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.login(user, pass)) navigate('/');
    else alert('Usuário ou senha incorretos!');
  };

  return (
    <div className="min-h-screen bg-[#1e5bb9] flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center text-white">
        <div className="bg-white text-[#1e5bb9] w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black mx-auto mb-2 shadow-lg">LK</div>
        <h1 className="text-3xl font-bold">LK Street</h1>
        <p className="text-sm opacity-80">Sistema de Gestão</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Fazer Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-1">Usuário</label>
            <input type="text" placeholder="Digite seu usuário" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={user} onChange={e => setUser(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-1">Senha</label>
            <input type="password" placeholder="Digite sua senha" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button className="w-full bg-[#1e5bb9] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 hover:bg-blue-800 transition-all">
            <span>➔</span> Entrar
          </button>
        </form>

        <div className="mt-8 bg-blue-50 p-4 rounded-xl text-xs text-blue-900 leading-relaxed">
          <p className="font-bold mb-2">Credenciais de teste:</p>
          <p className="flex items-center gap-2">👤 admin / senha: admin123</p>
          <p className="flex items-center gap-2">👤 gerente / senha: gerente123</p>
        </div>
      </div>
      <p className="mt-8 text-white text-[10px] opacity-70">© 2026 LK Street. Todos os direitos reservados.</p>
    </div>
  );
};

export default Login;