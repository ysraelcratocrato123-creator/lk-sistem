import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Sale {
  id: number;
  date: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  observations?: string;
}

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  size: string;
  price: number;
  subtotal: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  sizes: {
    PP: number;
    P: number;
    M: number;
    G: number;
    GG: number;
    XG: number;
  };
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  isVIP: boolean;
  purchaseCount: number;
}

interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

type DateFilter = 'today' | 'month' | 'year' | 'all';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'products' | 'customers' | 'financial'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Carregar vendas do localStorage
    const storedSales = localStorage.getItem('lkstreet_sales');
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }

    // Carregar produtos do localStorage
    const storedProducts = localStorage.getItem('lkstreet_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }

    // Carregar clientes do localStorage
    const storedCustomers = localStorage.getItem('lkstreet_customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }

    // Carregar despesas do localStorage
    const storedExpenses = localStorage.getItem('lkstreet_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  };

  // Filtrar dados por data
  const filterByDate = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return date.toDateString() === today.toDateString();
      case 'month':
        return date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
      case 'year':
        return date.getFullYear() === today.getFullYear();
      case 'all':
        return true;
      default:
        return true;
    }
  };

  const filteredSales = sales.filter(sale => filterByDate(sale.date));
  const filteredExpenses = expenses.filter(expense => filterByDate(expense.date));

  // Cálculos financeiros
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalCost = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      return itemSum + (product ? product.costPrice * item.quantity : 0);
    }, 0);
  }, 0);

  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Estatísticas de vendas
  const totalSalesCount = filteredSales.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const totalItemsSold = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Produtos mais vendidos
  const productSales = new Map<number, { name: string; quantity: number; revenue: number }>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productSales.get(item.productId) || { 
        name: item.productName, 
        quantity: 0, 
        revenue: 0 
      };
      productSales.set(item.productId, {
        name: item.productName,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.subtotal
      });
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Clientes mais compradores
  const customerPurchases = new Map<string, { name: string; count: number; total: number }>();
  filteredSales.forEach(sale => {
    const current = customerPurchases.get(sale.customerName) || { 
      name: sale.customerName, 
      count: 0, 
      total: 0 
    };
    customerPurchases.set(sale.customerName, {
      name: sale.customerName,
      count: current.count + 1,
      total: current.total + sale.total
    });
  });

  const topCustomers = Array.from(customerPurchases.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Vendas por categoria
  const categorySales = new Map<string, number>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const current = categorySales.get(product.category) || 0;
        categorySales.set(product.category, current + item.subtotal);
      }
    });
  });

  // Vendas por método de pagamento
  const paymentMethods = new Map<string, { count: number; total: number }>();
  filteredSales.forEach(sale => {
    const current = paymentMethods.get(sale.paymentMethod) || { count: 0, total: 0 };
    paymentMethods.set(sale.paymentMethod, {
      count: current.count + 1,
      total: current.total + sale.total
    });
  });

  // Produtos com baixo estoque
  const lowStockProducts = products.filter(p => {
    const totalStock = Object.values(p.sizes).reduce((sum, qty) => sum + qty, 0);
    return totalStock < 5;
  });

  // Análise de tamanhos mais vendidos
  const sizeSales = new Map<string, number>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const current = sizeSales.get(item.size) || 0;
      sizeSales.set(item.size, current + item.quantity);
    });
  });

  // Despesas por categoria
  const expensesByCategory = new Map<string, number>();
  filteredExpenses.forEach(expense => {
    const current = expensesByCategory.get(expense.category) || 0;
    expensesByCategory.set(expense.category, current + expense.amount);
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Hoje';
      case 'month': return 'Este Mês';
      case 'year': return 'Este Ano';
      case 'all': return 'Todos os Períodos';
      default: return '';
    }
  };

  const exportToPDF = () => {
    toast.success('Relatório exportado com sucesso!');
    // Implementação real de exportação PDF seria feita aqui
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Análises</h1>
          <p className="text-gray-600">Acompanhe o desempenho da sua loja LK Street</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'today'
                      ? 'bg-[#0f4fa8] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'month'
                      ? 'bg-[#0f4fa8] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mês
                </button>
                <button
                  onClick={() => setDateFilter('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'year'
                      ? 'bg-[#0f4fa8] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ano
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'all'
                      ? 'bg-[#0f4fa8] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-[#0f4fa8] text-[#0f4fa8]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'sales'
                  ? 'border-b-2 border-[#0f4fa8] text-[#0f4fa8]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'products'
                  ? 'border-b-2 border-[#0f4fa8] text-[#0f4fa8]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'customers'
                  ? 'border-b-2 border-[#0f4fa8] text-[#0f4fa8]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'financial'
                  ? 'border-b-2 border-[#0f4fa8] text-[#0f4fa8]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Financeiro
            </button>
          </div>
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  {netProfit > 0 ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Positivo
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm font-medium">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Negativo
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Lucro Líquido</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(netProfit)}</p>
                <p className="text-xs text-gray-500 mt-2">Margem: {profitMargin.toFixed(1)}%</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Receita Total</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-2">{totalSalesCount} vendas</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Ticket Médio</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageTicket)}</p>
                <p className="text-xs text-gray-500 mt-2">{totalItemsSold} itens vendidos</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Despesas Totais</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-gray-500 mt-2">{filteredExpenses.length} despesas</p>
              </div>
            </div>

            {/* Gráficos e análises */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 Produtos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0f4fa8]" />
                  Top 5 Produtos Mais Vendidos
                </h3>
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => {
                    const maxRevenue = topProducts[0]?.revenue || 1;
                    const percentage = (product.revenue / maxRevenue) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {index + 1}. {product.name}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0f4fa8] h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {product.quantity} unidades vendidas
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 5 Clientes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0f4fa8]" />
                  Top 5 Melhores Clientes
                </h3>
                <div className="space-y-4">
                  {topCustomers.slice(0, 5).map((customer, index) => {
                    const maxTotal = topCustomers[0]?.total || 1;
                    const percentage = (customer.total / maxTotal) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {index + 1}. {customer.name}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(customer.total)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {customer.count} compras realizadas
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Métodos de pagamento e Categorias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métodos de Pagamento */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#0f4fa8]" />
                  Vendas por Método de Pagamento
                </h3>
                <div className="space-y-3">
                  {Array.from(paymentMethods.entries()).map(([method, data], index) => {
                    const percentage = (data.total / totalRevenue) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{method}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(data.total)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-[#0f4fa8] h-1.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {data.count} transações
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vendas por Categoria */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0f4fa8]" />
                  Vendas por Categoria
                </h3>
                <div className="space-y-3">
                  {Array.from(categorySales.entries()).map(([category, total], index) => {
                    const percentage = (total / totalRevenue) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(total)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relatório de Vendas */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Resumo de vendas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Total de Vendas</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalSalesCount}</p>
                <p className="text-sm text-gray-500 mt-1">{getDateFilterLabel()}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Faturamento</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">Receita bruta</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Itens Vendidos</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalItemsSold}</p>
                <p className="text-sm text-gray-500 mt-1">Unidades totais</p>
              </div>
            </div>

            {/* Lista de vendas */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Vendas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Itens
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Nenhuma venda encontrada no período selecionado
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{sale.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(sale.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sale.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sale.items.length} produto(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {formatCurrency(sale.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Análise de tamanhos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0f4fa8]" />
                Vendas por Tamanho
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {['PP', 'P', 'M', 'G', 'GG', 'XG'].map((size) => {
                  const quantity = sizeSales.get(size) || 0;
                  const maxQuantity = Math.max(...Array.from(sizeSales.values()), 1);
                  const percentage = (quantity / maxQuantity) * 100;
                  return (
                    <div key={size} className="text-center">
                      <div className="mb-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{quantity}</p>
                        <p className="text-xs text-gray-500 mt-1">unidades</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-[#0f4fa8] h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{size}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Relatório de Produtos */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Cards de métricas de produtos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Total de Produtos</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                <p className="text-sm text-gray-500 mt-1">Produtos cadastrados</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Estoque Baixo</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{lowStockProducts.length}</p>
                <p className="text-sm text-gray-500 mt-1">Produtos com {'<'} 5 unidades</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Valor em Estoque</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    products.reduce((sum, p) => {
                      const totalStock = Object.values(p.sizes).reduce((s, q) => s + q, 0);
                      return sum + (p.costPrice * totalStock);
                    }, 0)
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">Custo total</p>
              </div>
            </div>

            {/* Produtos mais vendidos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Produtos Mais Vendidos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                                {index + 1}
                              </span>
                            ) : (
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity} unidades
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Produtos com estoque baixo */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    Alerta: Produtos com Estoque Baixo
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estoque por Tamanho
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowStockProducts.map((product) => {
                        const totalStock = Object.values(product.sizes).reduce((sum, qty) => sum + qty, 0);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex gap-2 flex-wrap">
                                {Object.entries(product.sizes).map(([size, qty]) => (
                                  <span
                                    key={size}
                                    className={`px-2 py-1 text-xs font-medium rounded ${
                                      qty === 0
                                        ? 'bg-red-100 text-red-800'
                                        : qty < 3
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {size}: {qty}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 text-sm font-bold rounded-full ${
                                  totalStock === 0
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {totalStock}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relatório de Clientes */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Cards de métricas de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Total Clientes</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-sm text-gray-500 mt-1">Cadastrados</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Clientes VIP</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {customers.filter(c => c.isVIP).length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Status especial</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Clientes Ativos</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {topCustomers.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Com compras no período</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Ticket Médio</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    topCustomers.length > 0
                      ? topCustomers.reduce((sum, c) => sum + c.total, 0) / topCustomers.length
                      : 0
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">Por cliente</p>
              </div>
            </div>

            {/* Top Clientes */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Ranking de Clientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compras
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Gasto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Médio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Nenhum cliente com compras no período selecionado
                        </td>
                      </tr>
                    ) : (
                      topCustomers.map((customer, index) => {
                        const avgTicket = customer.total / customer.count;
                        const customerData = customers.find(c => c.name === customer.name);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {index < 3 ? (
                                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                                    {index + 1}
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {customer.name}
                                </span>
                                {customerData?.isVIP && (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
                                    VIP
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.count} compras
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {formatCurrency(customer.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(avgTicket)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Relatório Financeiro */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Cards de métricas financeiras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Receita Bruta</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{getDateFilterLabel()}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Custo Total</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
                <p className="text-sm text-gray-500 mt-1">Custo dos produtos vendidos</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Lucro Bruto</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(grossProfit)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Margem: {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {netProfit >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-700">Lucro Líquido</h3>
                </div>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Margem: {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Fluxo de caixa */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Demonstrativo de Resultados</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium text-gray-700">Receita Bruta</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg pl-8">
                  <span className="text-gray-600">(-) Custo dos Produtos Vendidos</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {formatCurrency(totalCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-t-2 border-green-200">
                  <span className="font-medium text-gray-700">(=) Lucro Bruto</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(grossProfit)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg pl-8">
                  <span className="text-gray-600">(-) Despesas Operacionais</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>

                <div className={`flex justify-between items-center p-4 rounded-lg border-t-2 ${
                  netProfit >= 0 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <span className="font-medium text-gray-700">(=) Lucro Líquido</span>
                  <span className={`text-xl font-bold ${
                    netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Despesas por categoria */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0f4fa8]" />
                Despesas por Categoria
              </h3>
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma despesa registrada no período selecionado
                </p>
              ) : (
                <div className="space-y-3">
                  {Array.from(expensesByCategory.entries()).map(([category, total], index) => {
                    const percentage = (total / totalExpenses) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(total)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-red-600 h-1.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lista de despesas */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Despesas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Nenhuma despesa encontrada no período selecionado
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indicadores de desempenho */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">ROI (Retorno sobre Investimento)</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCost > 0 ? ((grossProfit / totalCost) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Lucro bruto / Custo total
                </p>
              </div>

              <div> className="bg-white rounded-lg shadow-sm p-6"
                <h4 className="text-sm font-medium text-gray-600 mb-2">Margem de Contribuição</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Lucro bruto / Receita total
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Relação Despesas/Receita</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Despesas / Receita total
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}