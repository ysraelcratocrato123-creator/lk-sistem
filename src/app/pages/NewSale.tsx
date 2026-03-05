import React, { useState, useEffect } from 'react';
import { db } from '../services/database';

const NewSale = () => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');

  useEffect(() => {
    setProdutos(db.getList('produtos'));
    setClientes(db.getList('clientes'));
  }, []);

  const adicionarAoCarrinho = (p: any) => {
    setCarrinho([...carrinho, { ...p, idCarrinho: Date.now() }]);
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho(carrinho.filter(item => item.idCarrinho !== id));
  };

  const subtotal = carrinho.reduce((acc, item) => acc + Number(item.precoVenda), 0);
  const total = subtotal - desconto;
  const porcentagemDesconto = subtotal > 0 ? (desconto / subtotal) * 100 : 0;

  const finalizarVenda = () => {
    if (carrinho.length === 0) return alert("Adicione produtos!");
    
    const venda = {
      id: Date.now(),
      produtoPrincipal: carrinho[0].nome, 
      quantidadeTotal: carrinho.length,
      cliente: clientes.find(c => String(c.id) === clienteId)?.nome || 'Consumidor Geral',
      subtotal,
      desconto,
      valorTotal: total,
      observacoes: observacao || "Sem observações",
      formaPagamento,
      data: new Date().toLocaleString('pt-BR')
    };

    db.saveItem('vendas', venda);
    alert("Venda realizada com sucesso!");
    
    setCarrinho([]);
    setDesconto(0);
    setObservacao('');
    setClienteId('');
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4 items-start bg-gray-100 p-2 font-sans">
      {/* Coluna Produtos */}
      <div className="w-full lg:w-1/2 bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden h-[85vh] flex flex-col">
        <div className="bg-[#1e5bb9] p-4 text-white font-black uppercase text-xs text-center tracking-widest">Estoque</div>
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {produtos.map(p => (
            <button key={p.id} onClick={() => adicionarAoCarrinho(p)} className="w-full flex justify-between items-center p-4 bg-white border border-gray-50 rounded-2xl hover:bg-blue-50 transition-all shadow-sm">
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">{p.nome}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase">Qtd: {p.estoque}</p>
              </div>
              <p className="font-black text-green-600">R$ {Number(p.precoVenda).toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Coluna Checkout */}
      <div className="w-full lg:w-1/2 bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden h-[85vh] flex flex-col">
        <div className="bg-[#22c55e] p-4 text-white font-black uppercase text-xs text-center tracking-widest">Resumo</div>
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <select className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold outline-none" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Consumidor Geral</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          <div className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200 min-h-[100px]">
            {carrinho.map((item) => (
              <div key={item.idCarrinho} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                <span className="text-[11px] font-bold text-gray-600">{item.nome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black">R$ {Number(item.precoVenda).toFixed(2)}</span>
                  <button onClick={() => removerDoCarrinho(item.idCarrinho)} className="text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <textarea className="w-full p-3 bg-gray-50 rounded-xl text-[10px] h-14 resize-none outline-none" placeholder="Observações..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            <div className="bg-gray-50 p-2 rounded-xl">
              <label className="text-[9px] font-black text-gray-400 uppercase">Desconto R$</label>
              <input type="number" className="w-full bg-transparent font-black text-red-500 outline-none" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase"><span>Desconto:</span><span>-{porcentagemDesconto.toFixed(1)}%</span></div>
            <div className="flex justify-between items-center mt-2 border-t pt-2"><span className="text-xs font-black uppercase italic">Total:</span><span className="text-2xl font-black text-[#22c55e] italic">R$ {total.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Dinheiro', 'PIX', 'Cartão'].map(m => (
              <button key={m} onClick={() => setFormaPagamento(m)} className={`py-2 rounded-xl text-[9px] font-black uppercase border ${formaPagamento === m ? 'bg-gray-800 text-white' : 'bg-white text-gray-400'}`}>{m}</button>
            ))}
          </div>
          <button onClick={finalizarVenda} className="w-full bg-[#1e5bb9] text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95">Finalizar Venda ➔</button>
        </div>
      </div>
    </div>
  );
};

export default NewSale;