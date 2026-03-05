export const db = {
  getList: (key: string): any[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveList: (key: string, list: any[]) => {
    localStorage.setItem(key, JSON.stringify(list));
  },

  saveItem: (key: string, item: any) => {
    const list = db.getList(key);
    list.push(item);
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  },

  getStats: () => {
    const vendas = db.getList('vendas');
    const faturamento = vendas.reduce((acc, v) => acc + (Number(v.valorTotal) || 0), 0);
    return {
      faturamento,
      vendasCount: vendas.length,
      lucro: faturamento * 0.3,
      despesas: 2500
    };
  }
};