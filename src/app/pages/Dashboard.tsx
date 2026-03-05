import React, { useEffect, useState } from 'react';
import { db } from '../services/database';

const Dashboard = () => {
  const [stats, setStats] = useState({ faturamento: 0, lucro: 0, despesas: 2500, vendasCount: 0 });

  useEffect(() => {
    const s = db.getStats();
    setStats(prev => ({ ...prev, faturamento: s.faturamento, lucro: s.lucro, vendasCount: s.vendasCount }));
  }, []);

  const cards = [
    { label: 'Faturamento', value: `R$ ${stats.faturamento.toFixed(2)}`, color: 'bg-[#1e5bb9]', icon: '💰' },
    { label: 'Despesas', value: `R$ ${stats.despesas.toFixed(2)}`, color: 'bg-[#ef4444]', icon: '📉' },
    { label: 'Lucro Líquido', value: `R$ ${(stats.faturamento - stats.despesas).toFixed(2)}`, color: 'bg-[#22c55e]', icon: '📈' },
    { label: 'Vendas do Mês', value: stats.vendasCount, color: 'bg-[#f59e0b]', icon: '👜' },
  ];

  return (
    <div>
      <div className="bg-[#1e5bb9] p-4 text-center">
        <h2 className="text-white font-bold">LK Street - Dashboard</h2>
      </div>
      <div className="p-6 space-y-3">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} p-4 rounded-xl text-white flex justify-between items-center shadow-md`}>
            <span className="font-bold text-sm">{card.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">{card.icon}</span>
              <span className="font-black text-lg">{card.value}</span>
            </div>
          </div>
        ))}
        <div className="mt-6">
          <p className="text-sm font-bold text-gray-700 mb-2">Top Produtos</p>
          <p className="text-xs text-gray-400 italic">Nenhuma venda registrada</p>
        </div>
        <button className="w-full bg-[#1e5bb9] text-white py-3 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all">
          Ver Relatório Completo
        </button>
      </div>
    </div>
  );
};

export default Dashboard;