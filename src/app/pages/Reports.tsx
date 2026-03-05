import React, { useState, useEffect } from 'react';
import { db } from '../services/database';

const Reports = () => {
  const [vendas, setVendas] = useState<any[]>([]);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    // Busca dados garantindo que sejam arrays para não quebrar o reduce
    setVendas(db.getList('vendas') || []);
    setDespesas(db.getList('despesas') || []);
    setProdutos(db.getList('produtos') || []);
    setClientes(db.getList('clientes') || []);
  }, []);

  // Cálculos blindados contra NaN utilizando fallback para zero
  const faturamento = vendas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
  const lucro = faturamento - totalDespesas;
  const ticket = vendas.length > 0 ? faturamento / vendas.length : 0;
  const estoqueTotal = produtos.reduce((acc, p) => acc + (Number(p.estoque) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f4f7fe] p-4 flex justify-center items-start pt-10 font-sans">
      
      {/* Container Centralizado Estilo Folha */}
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-xl p-10 flex flex-col items-center">
        
        {/* Cabeçalho de Título */}
        <div className="text-center mb-10">
          <h2 className="text-gray-800 font-black text-xl uppercase tracking-tighter">
            <span className="bg-gray-200 px-2 py-0.5 rounded mr-1">RESUMO</span> FINANCEIRO
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Dados atualizados em tempo real
          </p>
        </div>

        {/* Grade de Cards Cápsula (Design Vertical) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          
          {/* Faturamento - Verde */}
          <div className="bg-[#22c55e] rounded-[3rem] p-6 flex flex-col items-center justify-center text-white shadow-lg h-52 transition-transform hover:scale-105">
            <p className="text-[9px] font-black uppercase mb-4 tracking-tighter">Faturamento</p>
            <p className="text-lg font-black italic">R$</p>
            <p className="text-2xl font-black italic leading-none">{faturamento.toFixed(2)}</p>
          </div>

          {/* Despesas - Vermelho */}
          <div className="bg-[#ef4444] rounded-[3rem] p-6 flex flex-col items-center justify-center text-white shadow-lg h-52 transition-transform hover:scale-105">
            <p className="text-[9px] font-black uppercase mb-4 tracking-tighter">Despesas</p>
            <p className="text-lg font-black italic">R$</p>
            <p className="text-2xl font-black italic leading-none">{totalDespesas.toFixed(2)}</p>
          </div>

          {/* Lucro - Laranja */}
          <div className="bg-[#f59e0b] rounded-[3rem] p-6 flex flex-col items-center justify-center text-white shadow-lg h-52 transition-transform hover:scale-105">
            <p className="text-[9px] font-black uppercase mb-4 tracking-tighter">Lucro Líquido</p>
            <p className="text-lg font-black italic">R$</p>
            <p className="text-2xl font-black italic leading-none">{lucro.toFixed(2)}</p>
          </div>

          {/* Ticket Médio - Roxo */}
          <div className="bg-[#a855f7] rounded-[3rem] p-6 flex flex-col items-center justify-center text-white shadow-lg h-52 transition-transform hover:scale-105">
            <p className="text-[9px] font-black uppercase mb-4 tracking-tighter">Ticket Médio</p>
            <p className="text-lg font-black italic">R$</p>
            <p className="text-2xl font-black italic leading-none">{ticket.toFixed(2)}</p>
          </div>
        </div>

        {/* Grade de Status Inferior (Cards Brancos Arredondados) */}
        <div className="grid grid-cols-3 gap-6 w-full">
          <div className="bg-white rounded-[2.5rem] p-6 flex flex-col items-center shadow-md border border-gray-50 transition-all hover:shadow-lg">
            <p className="text-[9px] font-black text-gray-400 uppercase text-center leading-tight mb-3 tracking-tighter">Produtos em Estoque</p>
            <p className="text-4xl font-black text-gray-800">{estoqueTotal}</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 flex flex-col items-center shadow-md border border-gray-50 transition-all hover:shadow-lg">
            <p className="text-[9px] font-black text-gray-400 uppercase text-center leading-tight mb-3 tracking-tighter">Clientes na Base</p>
            <p className="text-4xl font-black text-gray-800">{clientes.length}</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 flex flex-col items-center shadow-md border border-gray-50 transition-all hover:shadow-lg">
            <p className="text-[9px] font-black text-gray-400 uppercase text-center leading-tight mb-3 tracking-tighter">Vendas Realizadas</p>
            <p className="text-4xl font-black text-gray-800">{vendas.length}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;