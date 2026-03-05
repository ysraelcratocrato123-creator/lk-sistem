import React, { useEffect, useState } from 'react';
import { db } from '../services/database';

const SalesHistory = () => {
  const [vendas, setVendas] = useState<any[]>([]);

  const carregar = () => {
    const dados = db.getList('vendas');
    setVendas([...dados].reverse());
  };

  useEffect(() => { carregar(); }, []);

  const excluir = (id: number) => {
    if (window.confirm("Excluir esta venda?")) {
      const novaLista = db.getList('vendas').filter((v: any) => v.id !== id);
      db.saveList('vendas', novaLista);
      carregar();
    }
  };

  const totalGeral = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1e5bb9] py-4 text-center text-white font-black text-xs uppercase tracking-widest">Histórico</div>
        
        <div className="m-5 bg-[#22c55e] rounded-2xl p-6 flex justify-between items-center text-white shadow-lg">
          <div><p className="text-[10px] font-bold uppercase opacity-90">Total Acumulado</p><p className="text-3xl font-black italic">R$ {totalGeral.toFixed(2)}</p></div>
          <div className="text-right"><p className="text-[10px] font-bold uppercase opacity-90">Vendas</p><p className="text-3xl font-black italic">{vendas.length}</p></div>
        </div>

        <div className="p-5 space-y-4">
          {vendas.map((v) => (
            <div key={v.id} className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm relative">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black text-gray-800 text-lg uppercase tracking-tighter">{v.produtoPrincipal}</h3>
                <button onClick={() => excluir(v.id)} className="text-red-400 hover:text-red-600 text-xl">🗑️</button>
              </div>
              <p className="text-gray-400 text-[10px] font-bold mb-4">📅 {v.data} | 👤 {v.cliente}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-xl"><p className="text-[9px] font-black text-gray-400 uppercase">Itens</p><p className="font-black text-gray-700">{v.quantidadeTotal} un</p></div>
                <div className="bg-gray-50 p-3 rounded-xl border-l-4 border-[#22c55e]"><p className="text-[9px] font-black text-gray-400 uppercase">Pago</p><p className="font-black text-[#22c55e]">R$ {Number(v.valorTotal).toFixed(2)}</p></div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 mb-3 uppercase">💳 {v.formaPagamento}</div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-[9px] font-black text-gray-300 uppercase">Obs:</p>
                <p className="text-[11px] text-gray-500 italic">{v.observacoes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;