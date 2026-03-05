import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/database';

const ProductRegister = () => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Camisa', 'Boné', 'Shorts', 'Tênis']);
  const [showCatModal, setShowCatModal] = useState(false);
  const [novaCat, setNovaCat] = useState('');

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Camisa');
  const [tamanho, setTamanho] = useState('Não aplicável');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [estoque, setEstoque] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const custoNum = Number(precoCusto) || 0;
  const vendaNum = Number(precoVenda) || 0;
  const margemLucro = vendaNum > 0 ? (((vendaNum - custoNum) / vendaNum) * 100).toFixed(1) : "0.0";
  const lucroReal = vendaNum - custoNum;

  useEffect(() => {
    setProdutos(db.getList('produtos'));
    const catSalvas = db.getList('config_categorias');
    if (catSalvas.length > 0) setCategorias(catSalvas);
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const salvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !precoCusto || !precoVenda) return alert("Preencha os campos obrigatórios!");

    const novoProduto = {
      id: Date.now(),
      nome, categoria, tamanho,
      precoCusto: custoNum,
      precoVenda: vendaNum,
      estoque: Number(estoque) || 0,
      margem: margemLucro,
      foto: foto
    };

    db.saveItem('produtos', novoProduto);
    setNome(''); setPrecoCusto(''); setPrecoVenda(''); setEstoque(''); setFoto(null);
    setProdutos(db.getList('produtos'));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-[#f4f7fe] min-h-screen font-sans">
      
      {/* LADO AZUL: PAINEL DE CADASTRO PROFISSIONAL (50%) */}
      <div className="w-full lg:w-1/2 bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden flex flex-col h-fit">
        <div className="bg-[#1e5bb9] p-6 flex justify-between items-center">
          <h2 className="text-white font-black uppercase text-sm tracking-[0.2em]">Gestão de Estoque</h2>
          <span className="bg-blue-400/30 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">Novo Item</span>
        </div>
        
        <form onSubmit={salvarProduto} className="p-10 space-y-6">
          
          {/* SEÇÃO DA FOTO COM DESIGNER CIRCULAR */}
          <div className="flex flex-col items-center justify-center pb-4">
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFotoChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden"
            >
              {foto ? (
                <img src={foto} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-3xl block grayscale group-hover:grayscale-0 transition-all">📷</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase">Anexar</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase transition-opacity">Trocar</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nome Comercial</label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" placeholder="Ex: Tênis Casual Premium" value={nome} onChange={e => setNome(e.target.value)} />
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Categoria</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none cursor-pointer" value={categoria} onChange={e => setCategoria(e.target.value)}>
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>
              <button type="button" onClick={() => setShowCatModal(true)} className="text-[10px] text-blue-600 font-black mt-2 ml-1 uppercase hover:underline italic">＋ Configurar Categorias</button>
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Grade / Tamanho</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none cursor-pointer" value={tamanho} onChange={e => setTamanho(e.target.value)}>
                <option>Não aplicável</option>
                <option>P</option><option>M</option><option>G</option><option>GG</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl">
              <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block tracking-tighter">Custo Bruto (R$)</label>
              <input type="number" className="w-full bg-transparent text-lg font-black outline-none" placeholder="0.00" value={precoCusto} onChange={e => setPrecoCusto(e.target.value)} />
            </div>

            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <label className="text-[11px] font-black text-green-600 uppercase mb-2 block tracking-tighter">Venda Final (R$)</label>
              <input type="number" className="w-full bg-transparent text-lg font-black text-green-700 outline-none" placeholder="0.00" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} />
            </div>

            <div className="md:col-span-2">
               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Unidades em Estoque</label>
               <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold border-none outline-none" placeholder="Quantidade inicial" value={estoque} onChange={e => setEstoque(e.target.value)} />
            </div>
          </div>

          {/* PAINEL DE MARGEM FLUTUANTE */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-[2rem] shadow-lg flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-black uppercase opacity-80">Lucro Estimado</p>
              <p className="text-2xl font-black italic">R$ {lucroReal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-80">Margem</p>
              <p className="text-2xl font-black italic">{margemLucro}%</p>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1e5bb9] text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl active:scale-95 transition-all">Salvar no Sistema ➔</button>
        </form>
      </div>

      {/* LADO VERDE: CATÁLOGO (50%) */}
      <div className="w-full lg:w-1/2 bg-[#22c55e] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-white font-black uppercase text-sm tracking-widest">Catálogo Ativo</h2>
          <span className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full font-bold">{produtos.length} Produtos</span>
        </div>
        
        <div className="bg-white m-2 rounded-[2.3rem] flex-1 overflow-y-auto p-6 space-y-4">
          {produtos.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm relative hover:border-blue-100 transition-all flex flex-col gap-4">
              <button onClick={() => {const n = produtos.filter(x => x.id !== p.id); setProdutos(n); db.saveList('produtos', n)}} className="absolute top-5 right-6 text-red-200 hover:text-red-500 transition-colors">🗑️</button>
              
              <div className="flex gap-5">
                <div className="w-24 h-24 bg-gray-50 rounded-[1.5rem] overflow-hidden border border-gray-100 flex-shrink-0">
                  {p.foto ? <img src={p.foto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-300 font-bold uppercase tracking-tighter">No Image</div>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{p.categoria}</p>
                  <h3 className="font-black text-gray-800 text-lg uppercase truncate leading-none mb-2">{p.nome}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">TAM: {p.tamanho}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${p.estoque > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>QTD: {p.estoque}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Custo</p>
                  <p className="font-black text-gray-700 text-sm">R$ {Number(p.precoCusto).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Venda</p>
                  <p className="font-black text-[#22c55e] text-sm italic underline">R$ {Number(p.precoVenda).toFixed(2)}</p>
                </div>
                <div className="text-center bg-[#22c55e]/10 rounded-xl py-1">
                  <p className="text-[9px] font-black text-[#22c55e] uppercase">Margem</p>
                  <p className="font-black text-[#22c55e] text-sm">{p.margem}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CATEGORIAS (MANTIDO) */}
      {showCatModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl">
            <h3 className="font-black text-center text-gray-800 uppercase text-xs tracking-[0.2em] mb-6">Configurar Filtros</h3>
            <div className="flex gap-2 mb-6">
              <input type="text" className="flex-1 p-3 bg-gray-50 rounded-2xl outline-none font-bold text-sm" placeholder="Nova..." value={novaCat} onChange={e => setNovaCat(e.target.value)} />
              <button onClick={() => {if(novaCat){const n = [...categorias, novaCat]; setCategorias(n); db.saveList('config_categorias', n); setNovaCat('')}}} className="bg-blue-600 text-white px-5 rounded-2xl font-black">＋</button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {categorias.map(c => (
                <div key={c} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl font-black text-[10px] text-gray-500 uppercase tracking-widest">{c} <button onClick={() => {const n = categorias.filter(x => x !== c); setCategorias(n); db.saveList('config_categorias', n)}} className="text-red-300 hover:text-red-500 text-sm">✕</button></div>
              ))}
            </div>
            <button onClick={() => setShowCatModal(false)} className="w-full py-4 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Salvar e Voltar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRegister;