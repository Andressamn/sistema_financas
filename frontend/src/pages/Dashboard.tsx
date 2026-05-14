import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  Plus,
  Tag,
  FolderOpen,
  Target,
  Briefcase,
  Pencil,
  Trash2,
  Paperclip,
  Users,
  Download,
  CreditCard,
  Repeat,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import TransactionModal, { type Transaction } from '../components/TransactionModal';
import CategoryModal, { type Category } from '../components/CategoryModal';
import GoalModal, { type Goal } from '../components/GoalModal';
import BudgetModal, { type Budget } from '../components/BudgetModal';
import CategoriesManageModal from '../components/CategoriesManageModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpensePieChart from '../components/ExpensePieChart';
import BudgetSection from '../components/BudgetSection';
import InsightsSection from '../components/InsightsSection';

type BudgetWithCategory = Budget & { category: { id: number; name: string } };

function getCurrentMonth() {
  return new Date().toISOString().substring(0, 7);
}

function monthRange(month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  const from = `${month}-01`;
  const next = new Date(year, monthNum, 1);
  const to = next.toISOString().substring(0, 10);
  return { from, to };
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [month, setMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showManageCats, setShowManageCats] = useState(false);
  const [catsRefreshKey, setCatsRefreshKey] = useState(0);
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { from, to } = monthRange(month);
    try {
      const [txRes, goalsRes, budgetsRes] = await Promise.all([
        api.get<Transaction[]>(`/transactions?from=${from}&to=${to}`),
        api.get<Goal[]>('/goals'),
        api.get<BudgetWithCategory[]>('/budgets'),
      ]);
      setTransactions(txRes.data);
      setGoals(goalsRes.data);
      setBudgets(budgetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleLogout() { logout(); navigate('/login'); }

  function openNewTransaction() { setEditingTx(null); setShowTxModal(true); }
  function openEditTransaction(tx: Transaction) { setEditingTx(tx); setShowTxModal(true); }
  function openNewCategory() { setEditingCat(null); setShowCatModal(true); }
  function openEditCategory(c: Category) { setShowManageCats(false); setEditingCat(c); setShowCatModal(true); }
  function openNewGoal() { setEditingGoal(null); setShowGoalModal(true); }
  function openEditGoal(g: Goal) { setEditingGoal(g); setShowGoalModal(true); }
  function openNewBudget() { setEditingBudget(null); setShowBudgetModal(true); }
  function openEditBudget(b: Budget) { setEditingBudget(b); setShowBudgetModal(true); }

  function deleteTransaction(tx: Transaction) {
    setConfirm({
      title: t('confirm.deleteTx'),
      message: t('confirm.deleteTxMsg'),
      onConfirm: async () => { await api.delete(`/transactions/${tx.id}`); loadData(); },
    });
  }

  function deleteCategory(c: Category) {
    setShowManageCats(false);
    setConfirm({
      title: t('confirm.deleteCat'),
      message: t('confirm.deleteCatMsg', { name: c.name }),
      onConfirm: async () => {
        await api.delete(`/categories/${c.id}`);
        setCatsRefreshKey((k) => k + 1);
        loadData();
      },
    });
  }

  function deleteGoal(g: Goal) {
    setConfirm({
      title: t('confirm.deleteGoal'),
      message: t('confirm.deleteGoalMsg', { name: g.name }),
      onConfirm: async () => { await api.delete(`/goals/${g.id}`); loadData(); },
    });
  }

  function deleteBudget(b: Budget) {
    setConfirm({
      title: t('budget.edit'),
      message: t('confirm.deleteGoalMsg', { name: (b as BudgetWithCategory).category?.name ?? '' }),
      onConfirm: async () => { await api.delete(`/budgets/${b.id}`); loadData(); },
    });
  }

  const totalIncome = transactions.filter(x => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0);
  const totalExpense = transactions.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0);
  const balance = totalIncome - totalExpense;

  const expensesByCategory = transactions
    .filter((x) => x.type === 'expense' && x.category)
    .reduce<Record<string, number>>((acc, x) => {
      const name = x.category!.name;
      acc[name] = (acc[name] ?? 0) + Number(x.amount);
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const topCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a).slice(0, 5);

  const currencyByLang: Record<string, string> = { 'pt-BR': 'BRL', 'pt-PT': 'EUR', en: 'USD', fr: 'EUR' };
  const currency = currencyByLang[i18n.language] ?? 'BRL';
  const formatMoney = (n: number) => n.toLocaleString(i18n.language, { style: 'currency', currency });
  const formatDate = (s: string) => new Date(s).toLocaleDateString(i18n.language);
  const formatMonthLabel = (m: string) => {
    const [year, monthNum] = m.split('-').map(Number);
    return new Date(year, monthNum - 1, 1).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Wallet size={20} className="shrink-0" />
              <span className="truncate">{t('dashboard.title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t('dashboard.hello', { name: user?.name })}</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              aria-label={t('dashboard.logout')}
              title={t('dashboard.logout')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition active:scale-95 p-2 sm:px-3 sm:py-1.5 rounded-lg inline-flex items-center gap-1.5"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('dashboard.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Filtro de mês */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.month')}:</span>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input-base !w-auto px-3 py-1.5 text-sm" />
            {month !== getCurrentMonth() && (
              <button onClick={() => setMonth(getCurrentMonth())} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline transition active:scale-95">
                {t('common.today')}
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{formatMonthLabel(month)}</span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title={t('dashboard.balanceMonth')} value={formatMoney(balance)} positive={balance >= 0} />
          <SummaryCard title={t('dashboard.income')} value={formatMoney(totalIncome)} positive={true} />
          <SummaryCard title={t('dashboard.expenses')} value={formatMoney(totalExpense)} positive={false} />
        </div>

        {/* Atalhos */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={openNewTransaction} className="btn-primary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2"><Plus size={16} /> {t('dashboard.newTransaction')}</button>
          <button onClick={openNewCategory} className="btn-secondary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2"><Tag size={16} /> {t('dashboard.newCategory')}</button>
          <button onClick={() => setShowManageCats(true)} className="btn-secondary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2"><FolderOpen size={16} /> {t('dashboard.manageCategories')}</button>
          <button onClick={openNewGoal} className="btn-secondary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2"><Target size={16} /> {t('dashboard.newGoal')}</button>
          <button onClick={openNewBudget} className="btn-secondary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base inline-flex items-center gap-1.5 sm:gap-2"><Briefcase size={16} /> {t('budget.new')}</button>
        </div>

        {/* Insights */}
        <InsightsSection currentMonth={month} currentTransactions={transactions} formatMoney={formatMoney} />

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {t('dashboard.lastTransactions')}
              {transactions.length > 5 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {t('dashboard.showingOf', { shown: 5, total: transactions.length })}
                </span>
              )}
            </h2>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-3">{t('dashboard.noTransactionsThisMonth')}</p>
                <button onClick={openNewTransaction} className="btn-primary px-4 py-2">{t('dashboard.addFirst')}</button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.slice(0, 5).map((tx) => (
                  <li key={tx.id} className="py-3 flex justify-between items-center group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate flex items-center gap-1.5">
                        {tx.description || tx.category?.name || t('dashboard.noDescription')}
                        {tx.receiptUrl && <Paperclip size={12} className="text-gray-400 shrink-0" />}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(tx.date)}
                        {tx.category && ` · ${tx.category.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatMoney(Number(tx.amount))}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEditTransaction(tx)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90 text-gray-600 dark:text-gray-300" title={t('common.edit')}><Pencil size={14} /></button>
                        <button onClick={() => deleteTransaction(tx)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90 text-red-500 dark:text-red-400" title={t('common.delete')}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.expensesByCategory')}</h2>
            <ExpensePieChart data={pieData} emptyMessage={t('dashboard.noExpenseData')} formatMoney={formatMoney} />
          </section>
        </div>

        {/* Budgets + Top categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetSection
            budgets={budgets}
            transactions={transactions}
            formatMoney={formatMoney}
            onNew={openNewBudget}
            onEdit={openEditBudget}
            onDelete={deleteBudget}
          />

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.whereYouSpend')}</h2>
            {topCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noCategorizedExpenses')}</p>
            ) : (
              <ul className="space-y-3">
                {topCategories.map(([name, total]) => {
                  const percent = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
                  return (
                    <li key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{formatMoney(total)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Metas */}
        <section className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Target size={20} className="text-emerald-600 dark:text-emerald-400" />
              {t('dashboard.goals')}
            </h2>
            <button onClick={openNewGoal} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline transition active:scale-95">{t('dashboard.newShort')}</button>
          </div>
          {goals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noGoalsYet')}</p>
          ) : (
            <ul className="space-y-4">
              {goals.map((g) => {
                const target = Number(g.targetAmount);
                const current = Number(g.currentAmount);
                const percent = target > 0 ? (current / target) * 100 : 0;
                return (
                  <li key={g.id} className="group">
                    <div className="flex justify-between mb-1 items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatMoney(current)} / {formatMoney(target)}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => openEditGoal(g)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-90 text-gray-600 dark:text-gray-300" title={t('common.edit')}><Pencil size={14} /></button>
                          <button onClick={() => deleteGoal(g)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90 text-red-500 dark:text-red-400" title={t('common.delete')}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('dashboard.achieved', { percent: percent.toFixed(0) })}
                      {g.deadline && ` · ${t('dashboard.until', { date: formatDate(g.deadline) })}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{t('dashboard.comingSoon')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Feature icon={Users} label={t('dashboard.sharedWallet')} />
            <Feature icon={Download} label="OFX/CSV" />
            <Feature icon={CreditCard} label="Cartão de crédito" />
            <Feature icon={Repeat} label={t('dashboard.recurring')} />
          </div>
        </section>
      </main>

      <TransactionModal open={showTxModal} onClose={() => setShowTxModal(false)} onSaved={loadData} transaction={editingTx} />
      <CategoryModal open={showCatModal} onClose={() => setShowCatModal(false)} onSaved={() => { setCatsRefreshKey(k => k + 1); loadData(); }} category={editingCat} />
      <GoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} onSaved={loadData} goal={editingGoal} />
      <BudgetModal open={showBudgetModal} onClose={() => setShowBudgetModal(false)} onSaved={loadData} budget={editingBudget} />
      <CategoriesManageModal open={showManageCats} onClose={() => setShowManageCats(false)} onEdit={openEditCategory} onDelete={deleteCategory} refreshKey={catsRefreshKey} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmText={t('common.delete')}
        destructive
      />
    </div>
  );
}

function SummaryCard({ title, value, positive }: { title: string; value: string; positive: boolean }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{value}</p>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition hover:scale-105">
      <Icon size={24} className="text-emerald-600 dark:text-emerald-400 mb-2" strokeWidth={1.75} />
      <span className="text-gray-700 dark:text-gray-300 text-center">{label}</span>
    </div>
  );
}
