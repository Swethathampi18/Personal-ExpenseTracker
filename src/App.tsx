import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  X,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Calendar as CalendarIcon,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, compareDesc } from 'date-fns';
import { Expense, Category, CATEGORIES, CATEGORY_COLORS } from './types';
import { cn, formatCurrency } from './lib/utils';
import { SEED_DATA } from './seed';

// --- Components ---

const Badge = ({ category }: { category: Category }) => {
  const config = CATEGORY_COLORS[category];
  return (
    <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider", config.bg, config.color)}>
      {category}
    </span>
  );
};

const Modal = ({ onClose, title, children }: { onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md glass rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'summary'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  // Initialize data
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    } else {
      setExpenses(SEED_DATA);
      localStorage.setItem('expenses', JSON.stringify(SEED_DATA));
    }
  }, []);

  // Save data
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as Category;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;

    if (editingExpense) {
      setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? { ...ex, amount, category, description, date } : ex));
      toast.success('Expense updated successfully');
    } else {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        amount,
        category,
        description,
        date
      };
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Expense added successfully');
    }

    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(ex => ex.id !== id));
      toast.success('Expense deleted');
    }
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // --- Computed Stats ---
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const transactionCount = expenses.length;
  
  const now = new Date();
  const startOfCurrMonth = startOfMonth(now);
  const endOfCurrMonth = endOfMonth(now);
  const thisMonthTotal = expenses
    .filter(ex => isWithinInterval(parseISO(ex.date), { start: startOfCurrMonth, end: endOfCurrMonth }))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const categoryTotals = CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(ex => ex.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
  })).sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0]?.total > 0 ? categoryTotals[0].category : 'N/A';
  const maxCategoryTotal = Math.max(...categoryTotals.map(c => c.total), 1);

  const monthlySummary = expenses.reduce((acc, ex) => {
    const monthKey = format(parseISO(ex.date), 'MMMM yyyy');
    if (!acc[monthKey]) acc[monthKey] = { total: 0, count: 0 };
    acc[monthKey].total += ex.amount;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { total: number, count: number }>);

  const filteredExpenses = expenses
    .filter(ex => {
      const matchesSearch = ex.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || ex.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ExpenseTrack</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'dashboard' ? "bg-white/10 text-white font-medium" : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'expenses' ? "bg-white/10 text-white font-medium" : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <ReceiptText size={20} />
            All Expenses
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'summary' ? "bg-white/10 text-white font-medium" : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <PieChart size={20} />
            Summary
          </button>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-red-500" size={24} />
            <span className="font-bold text-lg">ExpenseTrack</span>
          </div>
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className="p-2 bg-white text-black rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted mt-1">Overview of your spending habits</p>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-full border border-border">
                <CalendarIcon size={16} className="text-muted" />
                <span>{format(now, 'MMMM yyyy')}</span>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Transactions</p>
                  <p className="text-2xl font-bold">{transactionCount}</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted">Top Category</p>
                  <p className="text-2xl font-bold">{topCategory}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Category Breakdown */}
              <div className="lg:col-span-2 glass p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold">Category Breakdown</h3>
                <div className="space-y-6">
                  {categoryTotals.map(({ category, total }) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted">{formatCurrency(total)}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(total / maxCategoryTotal) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn("h-full rounded-full", CATEGORY_COLORS[category].bg.replace('/10', ''))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Recent</h3>
                  <button onClick={() => setActiveTab('expenses')} className="text-sm text-muted hover:text-white flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {expenses.slice(0, 5).map(ex => (
                    <div key={ex.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", CATEGORY_COLORS[ex.category].bg)}>
                          <div className={cn("w-2 h-2 rounded-full", CATEGORY_COLORS[ex.category].bg.replace('/10', ''))} />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[100px]">{ex.description || ex.category}</p>
                          <p className="text-[10px] text-muted uppercase tracking-wider">{format(parseISO(ex.date), 'MMM dd')}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">{formatCurrency(ex.amount)}</p>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-muted text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* All Expenses Tab */}
        {activeTab === 'expenses' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">All Expenses</h2>
                <p className="text-muted mt-1">Manage and track every transaction</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search description..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20 w-full sm:w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
                    className="pl-10 pr-8 py-2 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20 appearance-none w-full"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </header>

            <div className="glass rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-white/5">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Description</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredExpenses.map(ex => (
                      <tr key={ex.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{format(parseISO(ex.date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4"><Badge category={ex.category} /></td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{ex.description || '-'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-right">{formatCurrency(ex.amount)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(ex)}
                              className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(ex.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-muted">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                              <Search size={32} />
                            </div>
                            <p>No expenses found matching your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <header>
              <h2 className="text-3xl font-bold tracking-tight">Monthly Summary</h2>
              <p className="text-muted mt-1">Track your spending trends over time</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(monthlySummary)
                .sort((a, b) => compareDesc(parseISO(a[0]), parseISO(b[0])))
                .map(([month, data]) => (
                <div key={month} className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CalendarIcon size={80} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{month}</h3>
                    <p className="text-sm text-muted">{data.count} transactions</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-3xl font-bold">{formatCurrency(data.total)}</p>
                  </div>
                </div>
              ))}
              {Object.keys(monthlySummary).length === 0 && (
                <div className="col-span-full glass p-20 rounded-3xl text-center text-muted">
                  No summary data available yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border px-6 py-4 flex justify-between items-center z-40">
        <button onClick={() => setActiveTab('dashboard')} className={cn("p-2 rounded-xl", activeTab === 'dashboard' ? "text-white bg-white/10" : "text-muted")}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setActiveTab('expenses')} className={cn("p-2 rounded-xl", activeTab === 'expenses' ? "text-white bg-white/10" : "text-muted")}>
          <ReceiptText size={24} />
        </button>
        <button onClick={() => setActiveTab('summary')} className={cn("p-2 rounded-xl", activeTab === 'summary' ? "text-white bg-white/10" : "text-muted")}>
          <PieChart size={24} />
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            onClose={() => { setIsModalOpen(false); setEditingExpense(null); }} 
            title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
          >
            <form onSubmit={handleAddExpense} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Amount (Rs.)</label>
                <input 
                  required
                  name="amount"
                  type="number" 
                  defaultValue={editingExpense?.amount}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20 text-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Category</label>
                <select 
                  required
                  name="category"
                  defaultValue={editingExpense?.category || 'Food'}
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20 appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
                <input 
                  name="description"
                  type="text" 
                  defaultValue={editingExpense?.description}
                  placeholder="What was this for?"
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Date</label>
                <input 
                  required
                  name="date"
                  type="date" 
                  defaultValue={editingExpense?.date || format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:outline-none focus:border-white/20"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-95 mt-4"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
