import React, { useState, useEffect } from 'react';
import { db } from '../services/database';

const Expenses = () => {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Fixo');

  useEffect(() => {
    setDespesas(db.getList('despesas'));
  }, []);

  const salvarDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = Number(valor);
    if (!titulo || valorNum <= 0) return alert("Preencha o título e um valor válido!");

    const novaDespesa = {
      id: Date.now(),
      titulo,
      valor: valorNum,
      categoria,
      data: new Date().toLocaleDateString('pt-BR')
    };

    db.saveItem('despesas', novaDespesa);
    setTitulo(''); setValor('');
    setDespesas(db.getList('despesas'));
  };

  const excluirDespesa = (id: number) => {
    const novas = despesas.filter(d => d.id !== id);
    setDespesas(novas);
    db.saveList('despesas', novas);
  };

  const totalDespesas = despesas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-[#f4f7fe] min-h-screen font-sans">
      {/* LADO AZUL: CADASTRO */}
      <div className="w-full lg:w-[40%] bg-white rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden h-fit">
        <div className="bg-[#1e5bb9] p-5 text-center text-white font-black uppercase text-xs tracking-widest">
          Lançar Despesa
        </div>
        <form onSubmit={salvarDespesa} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Título da Conta</label>
            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none" placeholder="Ex: Aluguel, Luz, Internet" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Valor (R$)</label>
            <input type="number" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none text-red-500" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Categoria</label>
            <select className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none" value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option>Fixo</option><option>Variável</option><option>Emergência</option><option>Pessoal</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[#1e5bb9] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Registrar Saída</button>
        </form>
      </div>

      {/* LADO VERDE: LISTAGEM */}
      <div className="w-full lg:w-[60%] bg-[#ef4444] rounded-[2.5rem] shadow-2xl overflow-hidden h-[85vh] flex flex-col">
        <div className="p-5 text-center text-white font-black uppercase text-xs tracking-widest flex justify-between px-10">
          <span>Contas Registradas</span>
          <span>Total: R$ {totalDespesas.toFixed(2)}</span>
        </div>
        <div className="bg-white m-1.5 rounded-[2.3rem] flex-1 overflow-y-auto p-4 space-y-3">
          {despesas.map((d) => (
            <div key={d.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-bold">R$</div>
                <div>
                  <h3 className="font-black text-gray-800 text-[11px] uppercase">{d.titulo}</h3>
                  <p className="text-[9px] font-bold text-gray-400">{d.categoria} • {d.data}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-red-500 text-sm">- R$ {Number(d.valor).toFixed(2)}</span>
                <button onClick={() => excluirDespesa(d.id)} className="text-gray-300 hover:text-red-500">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Expenses;