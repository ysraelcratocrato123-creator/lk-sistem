import React, { useState, useEffect } from 'react';
import { db } from '../services/database';

const CustomerRegister = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    setClientes(db.getList('clientes'));
  }, []);

  // MÁSCARA DE TELEFONE AUTOMÁTICA
  const aplicarMascaraTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 11);
    return limitado
      .replace(/^(\d{2})(\d)/g, "($1) $2") 
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = aplicarMascaraTelefone(e.target.value);
    setTelefone(valorFormatado);
  };

  const salvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || telefone.length < 14) {
      return alert("Preencha o nome e o telefone completo (DDD + Número)!");
    }

    const novoCliente = {
      id: Date.now(),
      nome,
      telefone,
      email,
      observacoes,
      isVip,
      compras: 0
    };

    db.saveItem('clientes', novoCliente);
    
    // Reset campos
    setNome(''); setTelefone(''); setEmail(''); setObservacoes(''); setIsVip(false);
    setClientes(db.getList('clientes'));
  };

  const excluirCliente = (id: number) => {
    if (window.confirm("Deseja excluir este cliente?")) {
      const novas = clientes.filter(c => c.id !== id);
      setClientes(novas);
      db.saveList('clientes', novas);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-[#f4f7fe] min-h-screen font-sans">
      
      {/* LADO AZUL: CADASTRO DE CLIENTE */}
      <div className="w-full lg:w-[45%] bg-white rounded-[2rem] shadow-xl border border-blue-50 overflow-hidden h-fit">
        <div className="bg-[#1e5bb9] p-5 text-center">
          <h2 className="text-white font-black uppercase text-xs tracking-[0.2em]">Cadastro de Cliente</h2>
        </div>
        
        <form onSubmit={salvarCliente} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Nome do Cliente *</label>
            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none shadow-inner" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Telefone (DDD + Número) *</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none shadow-inner" 
              placeholder="(88) 99999-9999" 
              value={telefone} 
              onChange={handleTelefoneChange} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Email</label>
            <input type="email" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none shadow-inner" placeholder="cliente@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Observações / Preferências</label>
            <textarea className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none shadow-inner h-24 resize-none" placeholder="Ex: Gosta de cores escuras..." value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="vip" className="w-4 h-4 rounded border-gray-300" checked={isVip} onChange={e => setIsVip(e.target.checked)} />
            <label htmlFor="vip" className="text-[11px] font-bold text-gray-600 cursor-pointer">
              ⭐ Marcar como Cliente VIP
            </label>
          </div>

          <button type="submit" className="w-full bg-[#1e5bb9] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
            Salvar Cliente
          </button>
        </form>
      </div>

      {/* LADO VERDE: CLIENTES CADASTRADOS (VOLTOU!) */}
      <div className="w-full lg:w-[55%] bg-[#22c55e] rounded-[2rem] shadow-2xl overflow-hidden h-[85vh] flex flex-col">
        <div className="p-5 text-center">
          <h2 className="text-white font-black uppercase text-xs tracking-widest">Clientes Ativos ({clientes.length})</h2>
        </div>
        
        <div className="bg-white m-1.5 rounded-[1.8rem] flex-1 overflow-y-auto p-4 space-y-4">
          {clientes.map((c) => (
            <div key={c.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm relative hover:border-blue-100 transition-all">
              <button onClick={() => excluirCliente(c.id)} className="absolute top-5 right-5 text-gray-200 hover:text-red-500">🗑️</button>
              
              <div className="flex items-start gap-4">
                {/* Avatar Circular */}
                <div className="w-12 h-12 bg-[#1e5bb9] rounded-full flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0">
                  {c.nome.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-800 text-sm uppercase truncate">{c.nome}</h3>
                    {c.isVip && <span className="text-yellow-500 text-sm">⭐</span>}
                  </div>
                  
                  <div className="flex gap-2 mt-1">
                    {c.isVip && <span className="bg-yellow-50 text-yellow-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">VIP</span>}
                    <span className="bg-blue-50 text-blue-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                       🛍️ {c.compras} compras
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">📞 {c.telefone}</p>
                    {c.email && <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">✉️ {c.email}</p>}
                  </div>

                  {c.observacoes && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                       <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Nota:</p>
                       <p className="text-[10px] font-medium text-gray-600 italic">"{c.observacoes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {clientes.length === 0 && (
            <div className="text-center py-20 text-gray-300 font-bold uppercase text-[10px] tracking-widest">
              Nenhum cliente na lista
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;