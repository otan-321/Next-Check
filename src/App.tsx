/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Settings,
  Plus,
  Bell,
  User,
  ArrowRight,
  ArrowLeftRight,
  ShoppingBag,
  Utensils,
  Plane,
  Home,
  Check,
  AlertTriangle,
  Trash2,
  FileText,
  MoreHorizontal,
  RotateCcw,
  Download,
  Upload,
  X,
  CreditCard,
  Edit,
  Sliders,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Account, Transaction, Budget, SavingsGoal, AppSettings, TransactionType } from './types';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  PHILIPPINE_INSTITUTIONS,
  CATEGORY_ICONS
} from './mockData';
import { InstitutionLogo } from './components/InstitutionLogo';

export default function App() {
  // --- Persistent Storage State ---
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('ledger_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ledger_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('ledger_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('ledger_savings');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ledger_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Write changes to localStorage
  useEffect(() => {
    localStorage.setItem('ledger_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ledger_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('ledger_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('ledger_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // --- UI Routing State ---
  // views: 'dashboard' | 'accounts' | 'budget' | 'reports' | 'settings'
  const [currentView, setCurrentView] = useState<'dashboard' | 'accounts' | 'budget' | 'reports' | 'settings'>('dashboard');
  
  // Dashboard toggle: 'MONTH' | 'QUARTER' | 'YEAR'
  const [dashboardPeriod, setDashboardPeriod] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  // Currency view toggle on Dashboard header card (USD vs PHP)
  const [dashboardCurrency, setDashboardCurrency] = useState<'PHP' | 'USD'>('PHP');

  // --- Modal Forms State ---
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // --- Form Fields State ---
  // 1. Transaction Form
  const [txType, setTxType] = useState<TransactionType>('Expense');
  const [txAmount, setTxAmount] = useState('');
  const [txSourceAccountId, setTxSourceAccountId] = useState('');
  const [txDestinationAccountId, setTxDestinationAccountId] = useState('');
  const [txCategory, setTxCategory] = useState('Food & Dining');
  const [txDate, setTxDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [txTime, setTxTime] = useState(() => {
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, '0');
    const mins = String(today.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  });
  const [txNote, setTxNote] = useState('');

  // 2. Account Form
  const [accName, setAccName] = useState('');
  const [accInstitutionId, setAccInstitutionId] = useState('bdo');
  const [accType, setAccType] = useState<'Savings' | 'Checking' | 'E-Wallet' | 'Payroll' | 'Cash' | 'Credit Card' | 'Other'>('Savings');
  const [accBalance, setAccBalance] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accCurrency, setAccCurrency] = useState<'PHP' | 'USD'>('PHP');

  // 3. Edit Balance Form (on-site helper)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState('');

  // 4. Transfer Form
  const [transferFromId, setTransferFromId] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // 5. Budget Form
  const [newBudgetCategory, setNewBudgetCategory] = useState('Food & Dining');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');

  // 6. Savings Goal Form
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Automatically configure transfer or transaction default accounts
  useEffect(() => {
    if (accounts.length > 0) {
      if (!txSourceAccountId) setTxSourceAccountId(accounts[0].id);
      if (!transferFromId) setTransferFromId(accounts[0].id);
      if (accounts.length > 1) {
        if (!transferToId) setTransferToId(accounts[1].id);
      }
    }
  }, [accounts, txSourceAccountId, transferFromId, transferToId]);

  // --- Financial Computations ---

  // Convert USD <-> PHP based on settings
  const formatCurrencyValue = (val: number, forceCurrency?: 'PHP' | 'USD') => {
    const targetCurrency = forceCurrency || settings.currency;
    if (targetCurrency === 'USD') {
      const usdVal = val / settings.usdToPhpRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdVal);
    } else {
      // PHP formatting
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
    }
  };

  // Dedicated utility to format any stored balance based on account config directly
  const formatValueByAccountCurrency = (val: number, accountCurrency: 'PHP' | 'USD') => {
    if (accountCurrency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    } else {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
    }
  };

  // Convert balance arrays to total sum in PHP
  const totalBalancePHP = useMemo(() => {
    return accounts
      .filter(a => !a.isArchived)
      .reduce((sum, a) => {
        // if account is stored as USD, convert it to PHP internally for tracking
        if (a.currency === 'USD') {
          return sum + (a.balance * settings.usdToPhpRate);
        }
        return sum + a.balance;
      }, 0);
  }, [accounts, settings.usdToPhpRate]);

  // Helper: zero-padded YYYY-MM-DD key for a Date, used for lexical comparison against tx.date
  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Resolve the active reporting window's start date based on the MONTH/QUARTER/YEAR segment control.
  // Previously this was hardcoded to '2026-10', so real transactions logged on any other date never counted.
  const periodStartKey = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (dashboardPeriod === 'MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dashboardPeriod === 'QUARTER') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return toDateKey(start);
  }, [dashboardPeriod]);

  // Income computation within the active reporting period (respects the Month/Quarter/Year toggle)
  const monthlyIncomePHP = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'Income' && tx.date >= periodStartKey)
      .reduce((sum, tx) => {
        const acc = accounts.find(a => a.id === tx.sourceAccountId);
        if (acc && acc.currency === 'USD') {
          return sum + (tx.amount * settings.usdToPhpRate);
        }
        return sum + tx.amount;
      }, 0);
  }, [transactions, accounts, settings.usdToPhpRate, periodStartKey]);

  // Expenses computation within the active reporting period (respects the Month/Quarter/Year toggle)
  const monthlyExpensesPHP = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'Expense' && tx.date >= periodStartKey)
      .reduce((sum, tx) => {
        const acc = accounts.find(a => a.id === tx.sourceAccountId);
        if (acc && acc.currency === 'USD') {
          return sum + (tx.amount * settings.usdToPhpRate);
        }
        return sum + tx.amount;
      }, 0);
  }, [transactions, accounts, settings.usdToPhpRate, periodStartKey]);

  // Savings rate
  const savingsRate = useMemo(() => {
    if (monthlyIncomePHP <= 0) return 0;
    const rate = ((monthlyIncomePHP - monthlyExpensesPHP) / monthlyIncomePHP) * 100;
    return Math.max(0, Math.round(rate));
  }, [monthlyIncomePHP, monthlyExpensesPHP]);

  // Category aggregate spending for Progress Bars - scoped to the current calendar month so it
  // matches "Monthly" budgets and doesn't silently keep accumulating forever.
  const categorySpending = useMemo(() => {
    const now = new Date();
    const monthStartKey = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
    const spendingMap: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'Expense' && tx.date >= monthStartKey)
      .forEach(tx => {
        const acc = accounts.find(a => a.id === tx.sourceAccountId);
        const phpAmt = acc && acc.currency === 'USD' ? tx.amount * settings.usdToPhpRate : tx.amount;
        spendingMap[tx.category] = (spendingMap[tx.category] || 0) + phpAmt;
      });
    return spendingMap;
  }, [transactions, accounts, settings.usdToPhpRate]);

  // Real (non-mocked) cash flow for the trailing 6 months, used by the Dashboard bar chart.
  // Replaces hardcoded sample figures so the chart accurately reflects (and empties out after) a data wipe.
  const cashFlowMonths = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expense: 0,
      };
    });
    transactions.forEach(tx => {
      const txKey = tx.date.slice(0, 7);
      const bucket = months.find(m => m.key === txKey);
      if (!bucket) return;
      const acc = accounts.find(a => a.id === tx.sourceAccountId);
      const phpAmt = acc && acc.currency === 'USD' ? tx.amount * settings.usdToPhpRate : tx.amount;
      if (tx.type === 'Income') bucket.income += phpAmt;
      else if (tx.type === 'Expense') bucket.expense += phpAmt;
    });
    return months;
  }, [transactions, accounts, settings.usdToPhpRate]);

  // Up to 2 highest-balance active accounts, used for the Dashboard's featured account widgets.
  // Replaces two permanently hardcoded "BDO" / "GCash" demo cards that used to show fake balances
  // even after a reset/wipe, regardless of which accounts actually exist.
  const featuredAccounts = useMemo(() => {
    return [...accounts]
      .filter(a => !a.isArchived)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 2);
  }, [accounts]);

  // Category list for selection options
  const transactionCategories = [
    'Food & Dining',
    'Rent & Utilities',
    'Transport',
    'Entertainment',
    'Shopping',
    'Utilities & Bills',
    'Salary',
    'Investment',
    'Other'
  ];

  // --- Actions ---

  // Global reset state to default matching template screenshot exactly
  const handleResetData = () => {
    if (window.confirm('Reset all to default premium template records?')) {
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setSavingsGoals(INITIAL_SAVINGS_GOALS);
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('ledger_accounts', JSON.stringify(INITIAL_ACCOUNTS));
      localStorage.setItem('ledger_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('ledger_budgets', JSON.stringify(INITIAL_BUDGETS));
      localStorage.setItem('ledger_savings', JSON.stringify(INITIAL_SAVINGS_GOALS));
      localStorage.setItem('ledger_settings', JSON.stringify(DEFAULT_SETTINGS));
      alert('Next Check re-seeded successfully with premium demo assets!');
    }
  };

  const handleWipeAllData = () => {
    if (window.confirm('Wipe all bookkeeping records for a completely fresh, empty start? This will clear all accounts, transactions, and savings targets.')) {
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setSettings(DEFAULT_SETTINGS);
      localStorage.clear();
      alert('Workspace cleared completely! You can now configure this blank slate with your custom accounts.');
    }
  };

  // Add a new manual transition
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      alert('Please state a valid positive numerical amount.');
      return;
    }

    const amt = Number(txAmount);

    // Adjust Account Balance
    const sourceAcc = accounts.find(a => a.id === txSourceAccountId);
    if (!sourceAcc) {
      alert('Account not found.');
      return;
    }

    // Deduct/Credit logic
    if (txType === 'Expense' && sourceAcc.balance < amt) {
      // Just flag warning of overdraft, let the manual entry proceed anyway since user manages it
      if (!window.confirm(`Insufficient funds in source account. Present balance is ${formatValueByAccountCurrency(sourceAcc.balance, sourceAcc.currency)}. Proceed anyway?`)) {
        return;
      }
    }

    // Construct transaction record
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: amt,
      type: txType,
      sourceAccountId: txSourceAccountId,
      category: txCategory,
      date: txDate,
      time: txTime,
      note: txNote.trim() || undefined,
    };

    if (txType === 'Transfer') {
      if (!txDestinationAccountId || txDestinationAccountId === txSourceAccountId) {
        alert('Please map a distinct target destination account for this transfer.');
        return;
      }
      newTx.destinationAccountId = txDestinationAccountId;
      newTx.category = 'Transfer';
    }

    // Process Ledger math
    setAccounts(prev =>
      prev.map(a => {
        if (a.id === txSourceAccountId) {
          if (txType === 'Expense') return { ...a, balance: a.balance - amt };
          if (txType === 'Income') return { ...a, balance: a.balance + amt };
          if (txType === 'Transfer') return { ...a, balance: a.balance - amt };
        }
        if (txType === 'Transfer' && a.id === txDestinationAccountId) {
          // If destination is USD account structure, we need to convert transaction amount to proper destination currency
          let targetAmt = amt;
          if (sourceAcc.currency === 'PHP' && a.currency === 'USD') {
            targetAmt = amt / settings.usdToPhpRate;
          } else if (sourceAcc.currency === 'USD' && a.currency === 'PHP') {
            targetAmt = amt * settings.usdToPhpRate;
          }
          return { ...a, balance: a.balance + targetAmt };
        }
        return a;
      })
    );

    setTransactions(prev => [newTx, ...prev]);

    // Reset Fields
    setTxAmount('');
    setTxNote('');
    setIsAddTransactionOpen(false);
  };

  // Add Account manually
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !accBalance || isNaN(Number(accBalance))) {
      alert('Please fill out custom name and valid numeric initial balance.');
      return;
    }

    const matchedInst = PHILIPPINE_INSTITUTIONS.find(i => i.id === accInstitutionId);
    if (!matchedInst) return;

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: accName.trim(),
      institution: matchedInst.institution as any,
      type: accType,
      balance: Number(accBalance),
      accountNumber: accNumber.trim() || `${Math.floor(1000 + Math.random() * 9000)}`,
      currency: accCurrency,
      isArchived: false,
    };

    setAccounts(prev => [...prev, newAcc]);
    
    // Clear
    setAccName('');
    setAccBalance('');
    setAccNumber('');
    setIsAddAccountOpen(false);
  };

  // Perform quick account balance manual update
  const handleQuickBalanceUpdate = (accountId: string, newBalRaw: string) => {
    const balNum = Number(newBalRaw);
    if (isNaN(balNum)) return;

    setAccounts(prev =>
      prev.map(a => (a.id === accountId ? { ...a, balance: balNum } : a))
    );
    setEditingAccountId(null);
  };

  // Archive or Delete Account
  const handleToggleArchiveAccount = (accountId: string) => {
    setAccounts(prev =>
      prev.map(a => (a.id === accountId ? { ...a, isArchived: !a.isArchived } : a))
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm('Delete this account from your ledger registry? Transactions mapping to this account will remain but balance totals will exclude it.')) {
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    }
  };

  // Quick Direct Transfer Tool
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromId || !transferToId) {
      alert('Source and target accounts must be defined.');
      return;
    }
    if (transferFromId === transferToId) {
      alert('Source and destination accounts must be distinct.');
      return;
    }
    const amt = Number(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid numeric transfer amount.');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === transferFromId);
    const destAcc = accounts.find(a => a.id === transferToId);
    if (!sourceAcc || !destAcc) return;

    // Log the transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount: amt,
      type: 'Transfer',
      sourceAccountId: transferFromId,
      destinationAccountId: transferToId,
      category: 'Transfer',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
      note: transferNote.trim() || 'Internal Account Transfer',
    };

    // Calculate balances
    setAccounts(prev =>
      prev.map(a => {
        if (a.id === transferFromId) {
          return { ...a, balance: a.balance - amt };
        }
        if (a.id === transferToId) {
          let convertedAmt = amt;
          if (sourceAcc.currency === 'PHP' && a.currency === 'USD') {
            convertedAmt = amt / settings.usdToPhpRate;
          } else if (sourceAcc.currency === 'USD' && a.currency === 'PHP') {
            convertedAmt = amt * settings.usdToPhpRate;
          }
          return { ...a, balance: a.balance + convertedAmt };
        }
        return a;
      })
    );

    setTransactions(prev => [newTx, ...prev]);
    setTransferAmount('');
    setTransferNote('');
    setIsTransferOpen(false);
    alert('Transfer logged successfully!');
  };

  // Manage Category Budgets
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetAmount || isNaN(Number(newBudgetAmount))) return;

    const existingIndex = budgets.findIndex(b => b.category === newBudgetCategory);
    const amt = Number(newBudgetAmount);

    if (existingIndex !== -1) {
      // update
      setBudgets(prev =>
        prev.map((b, i) => (i === existingIndex ? { ...b, amount: amt } : b))
      );
    } else {
      // create
      const newB: Budget = {
        id: `b-${Date.now()}`,
        category: newBudgetCategory,
        amount: amt,
        period: newBudgetPeriod,
      };
      setBudgets(prev => [...prev, newB]);
    }

    setNewBudgetAmount('');
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  // Manage Savings Goals
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTargetAmount) return;

    const newG: SavingsGoal = {
      id: `g-${Date.now()}`,
      name: goalName,
      targetAmount: Number(goalTargetAmount),
      currentAmount: Number(goalCurrentAmount) || 0,
      targetDate: goalTargetDate || undefined,
    };

    setSavingsGoals(prev => [...prev, newG]);
    setGoalName('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('');
    setGoalTargetDate('');
    setIsGoalModalOpen(false);
  };

  const handleUpdateGoalProgress = (goalId: string, valueRaw: string) => {
    const val = Number(valueRaw);
    if (isNaN(val)) return;

    setSavingsGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: val } : g))
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Data Export & Imports
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ accounts, transactions, budgets, savingsGoals, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ledger_premium_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    // Generate simple recent transactions list CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Date,Time,Type,Amount,Category,Account,Note\n';
    
    transactions.forEach(tx => {
      const acc = accounts.find(a => a.id === tx.sourceAccountId);
      const accNameStr = acc ? acc.name.replace(/,/g, ' ') : 'Unknown';
      const noteStr = tx.note ? tx.note.replace(/,/g, ' ') : '';
      csvContent += `"${tx.id}","${tx.date}","${tx.time}","${tx.type}",${tx.amount},"${tx.category}","${accNameStr}","${noteStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', encodedUri);
    linkElement.setAttribute('download', 'ledger_transactions_export.csv');
    linkElement.click();
  };

  // Utility to locate matched brand logo config
  const getInstitutionMeta = (instName: string) => {
    return PHILIPPINE_INSTITUTIONS.find(i => i.institution === instName) || {
      id: 'other',
      badge: instName.substring(0, 3).toUpperCase(),
      bgColor: '#7E7576',
      textColor: '#ffffff',
      name: instName
    };
  };

  return (
    <div className={`min-h-screen text-ink bg-page flex flex-col md:flex-row pb-24 md:pb-0 font-sans`}>
      {/* 280px left Fixed Sidebar for Desktop/Web navigations */}
      <aside className="fixed hidden md:flex left-0 top-0 h-screen w-[280px] bg-surface border-r border-border-fine flex-col py-8 px-6 z-40">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-ink tracking-tight leading-none">Next Check</h1>
          <p className="text-[10px] text-ink-muted font-semibold tracking-widest uppercase mt-1">Premium Finance</p>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] text-left group ${
              currentView === 'dashboard'
                ? 'text-ink font-bold border-r-4 border-black bg-surface-mid'
                : 'text-ink-muted hover:text-ink hover:bg-surface-low'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('accounts')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] text-left group ${
              currentView === 'accounts'
                ? 'text-ink font-bold border-r-4 border-black bg-surface-mid'
                : 'text-ink-muted hover:text-ink hover:bg-surface-low'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Accounts</span>
          </button>

          <button
            onClick={() => setCurrentView('budget')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] text-left group ${
              currentView === 'budget'
                ? 'text-ink font-bold border-r-4 border-black bg-surface-mid'
                : 'text-ink-muted hover:text-ink hover:bg-surface-low'
            }`}
          >
            <PiggyBank className="w-5 h-5" />
            <span className="text-sm font-medium">Budget</span>
          </button>

          <button
            onClick={() => setCurrentView('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] text-left group ${
              currentView === 'reports'
                ? 'text-ink font-bold border-r-4 border-black bg-surface-mid'
                : 'text-ink-muted hover:text-ink hover:bg-surface-low'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Reports</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] text-left group ${
              currentView === 'settings'
                ? 'text-ink font-bold border-r-4 border-black bg-surface-mid'
                : 'text-ink-muted hover:text-ink hover:bg-surface-low'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>

        {/* Desktop CTA Trigger */}
        <div className="mt-auto pt-6 border-t border-border-fine">
          <button
            onClick={() => setIsAddTransactionOpen(true)}
            className="w-full bg-black text-white hover:opacity-95 py-4 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </aside>

      {/* Persistent Mobile Sticky Header */}
      <header className="fixed md:hidden top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-fine px-5 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink leading-none">Next Check</h1>
          <p className="text-[8px] text-ink-muted font-bold tracking-widest uppercase">Premium Finance</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAddTransactionOpen(true)}
            className="w-8 h-8 rounded-full bg-surface-mid flex items-center justify-center text-ink"
            title="Quick Transaction"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative">
            <Bell className="w-5 h-5 text-ink-muted hover:text-ink duration-150 cursor-pointer" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black border border-white rounded-full"></span>
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className="w-8 h-8 rounded-full bg-surface-mid border border-border-fine flex items-center justify-center text-ink-muted hover:text-ink duration-150"
            title="Profile / Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container viewport wrapper */}
      <main className="flex-1 md:ml-[280px] pt-16 md:pt-0 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-8 md:py-12">
          
          {/* VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header Titles Row */}
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold mb-1.5 block">Monthly Overview</span>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink flex items-center gap-3">
                    Dashboard
                  </h2>
                </div>

                {/* Monthly/Quarter/Year Segment Filter */}
                <div className="flex items-center gap-1 border border-border-fine p-1 bg-surface">
                  {(['MONTH', 'QUARTER', 'YEAR'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setDashboardPeriod(p)}
                      className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-150 ${
                        dashboardPeriod === p
                          ? 'bg-black text-white'
                          : 'text-ink-muted hover:text-ink hover:bg-surface-low'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="bg-surface border border-border-fine p-12 text-center max-w-lg mx-auto my-12 animate-fadeIn flex flex-col items-center">
                  <div className="w-14 h-14 bg-surface-low border border-border-fine flex items-center justify-center mb-6">
                    <Sliders className="w-6 h-6 text-ink" />
                  </div>
                  <h3 className="text-xl font-extrabold text-ink tracking-tight mb-2">Workspace Unconfigured</h3>
                  <p className="text-ink-muted text-xs leading-relaxed max-w-sm mb-8">
                    Welcome to Next Check. Your premium offline finance log is ready. Start by opening your first custom wallet or seed our premium mockup sandbox.
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => setIsAddAccountOpen(true)}
                      className="bg-black text-white hover:opacity-95 py-3.5 px-6 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Custom Wallet
                    </button>
                    <button
                      onClick={handleResetData}
                      className="border border-black text-ink hover:bg-surface-low py-3.5 px-6 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Load Demo Sandbox
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Grid 1: Hero available balance (2/3 width) and BDO/GCash featured widgets (1/3 width) */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Available Balance card */}
                <div className="col-span-1 lg:col-span-8 bg-surface border border-border-fine p-8 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                  
                  {/* Top line currency selection */}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">Total Available Balance</span>
                      
                      {/* Interactive currency slider toggle */}
                      <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider text-ink-muted">
                        <span className={dashboardCurrency === 'PHP' ? 'text-ink-faint font-medium' : 'text-ink'}>USD</span>
                        <div
                          onClick={() => setDashboardCurrency(prev => prev === 'PHP' ? 'USD' : 'PHP')}
                          className="w-10 h-5 bg-surface-mid rounded-full relative p-0.5 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 bg-black rounded-full transition-all duration-150 ${
                              dashboardCurrency === 'PHP' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          ></div>
                        </div>
                        <span className={dashboardCurrency === 'PHP' ? 'text-ink' : 'text-ink-faint font-medium'}>PHP</span>
                      </div>
                    </div>

                    {/* Bold Balance figure */}
                    <h3 className="text-4xl md:text-5xl font-black text-ink tracking-tighter mb-2 font-tabular">
                      {formatCurrencyValue(totalBalancePHP, dashboardCurrency)}
                    </h3>

                    {/* Net cash flow indicator line - derived from real transactions in the selected period, not a fabricated figure */}
                    <div className={`flex items-center gap-1.5 ${monthlyIncomePHP - monthlyExpensesPHP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      <TrendingUp className={`w-4 h-4 ${monthlyIncomePHP - monthlyExpensesPHP >= 0 ? '' : 'rotate-180'}`} />
                      <span className="text-xs font-semibold tracking-tight">
                        {monthlyIncomePHP - monthlyExpensesPHP >= 0 ? '+' : ''}
                        {formatCurrencyValue(monthlyIncomePHP - monthlyExpensesPHP, dashboardCurrency)} net this {dashboardPeriod.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Summary metric rows */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mt-8 pt-6 border-t border-border-fine">
                    <div className="min-w-0">
                      <p className="text-[9px] text-ink-muted uppercase tracking-widest font-bold mb-1 truncate">
                        {dashboardPeriod === 'MONTH' ? 'Monthly' : dashboardPeriod === 'QUARTER' ? 'Quarterly' : 'Yearly'} Income
                      </p>
                      <p className="text-sm md:text-xl font-bold text-ink font-tabular truncate">
                        {formatCurrencyValue(monthlyIncomePHP, dashboardCurrency)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-ink-muted uppercase tracking-widest font-bold mb-1 truncate">
                        {dashboardPeriod === 'MONTH' ? 'Monthly' : dashboardPeriod === 'QUARTER' ? 'Quarterly' : 'Yearly'} Expenses
                      </p>
                      <p className="text-sm md:text-xl font-bold text-ink font-tabular truncate">
                        {formatCurrencyValue(monthlyExpensesPHP, dashboardCurrency)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-ink-muted uppercase tracking-widest font-bold mb-1 truncate">Savings Rate</p>
                      <p className="text-sm md:text-xl font-bold text-ink font-tabular truncate">{savingsRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Featured Account widgets - now derived from the user's real, highest-balance active accounts.
                    These used to be permanently hardcoded "BDO" and "GCash" demo cards that kept showing fake
                    balances even after a reset/wipe, regardless of whether those accounts actually existed. */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
                  {featuredAccounts.map(acc => {
                    const meta = getInstitutionMeta(acc.institution);
                    const phpBalance = acc.currency === 'USD' ? acc.balance * settings.usdToPhpRate : acc.balance;
                    return (
                      <div
                        key={acc.id}
                        style={{ backgroundColor: meta.bgColor, color: meta.textColor }}
                        className="p-6 flex flex-col justify-between h-[162px] shadow-sm relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold truncate pr-2">
                            {acc.name}
                          </span>
                          <CreditCard className="w-5 h-5 opacity-90 shrink-0" />
                        </div>
                        <div>
                          <p className="font-mono text-xs tracking-wider opacity-90 mb-2">{acc.accountNumber}</p>
                          <p className="text-xl md:text-2xl font-black">{formatCurrencyValue(phpBalance, dashboardCurrency)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {featuredAccounts.length === 0 && (
                    <div className="border-2 border-dashed border-border-fine flex-1 min-h-[162px] flex flex-col items-center justify-center text-center p-6">
                      <Wallet className="w-6 h-6 text-ink-faint mb-2" />
                      <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">No Active Accounts</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Grid 2: Cash Flow Bar Chart (Monochrome list column bars) and Budgets indicators (1/2 width each) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Cash Flow Grayscale overview bar chart */}
                <div className="col-span-1 lg:col-span-7 bg-surface border border-border-fine p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-bold text-ink tracking-tight">Cash Flow</h4>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 text-ink">
                        <span className="w-2.5 h-2.5 bg-black"></span>
                        <span className="uppercase text-ink-muted">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-ink">
                        <span className="w-2.5 h-2.5 bg-ink-faint"></span>
                        <span className="uppercase text-ink-muted">Expense</span>
                      </div>
                    </div>
                  </div>

                  {/* Layout Columns representing real trailing-6-month income/expense totals from actual transactions */}
                  <div className="h-64 flex items-end justify-between gap-3 font-tabular">
                    {(() => {
                      const maxVal = Math.max(...cashFlowMonths.map(m => Math.max(m.income, m.expense)), 1);
                      return cashFlowMonths.map((bar, i) => {
                        const incHeight = Math.min(100, (bar.income / maxVal) * 100);
                        const expHeight = Math.min(100, (bar.expense / maxVal) * 100);

                        return (
                          <div key={bar.key + i} className="flex-1 flex flex-col font-sans group items-center">
                            <div className="w-full flex justify-center items-end gap-1 h-44 relative bg-surface-low border-t border-border-fine pt-2 px-1">
                              {/* Income Bar (pure black) */}
                              <div
                                style={{ height: `${incHeight}%` }}
                                className="w-full bg-black hover:opacity-85 duration-100 cursor-pointer self-end"
                                title={`Income: ${formatCurrencyValue(bar.income)}`}
                              ></div>
                              {/* Expense Bar (gray) */}
                              <div
                                style={{ height: `${expHeight}%` }}
                                className="w-full bg-ink-faint hover:opacity-80 duration-100 cursor-pointer self-end"
                                title={`Expense: ${formatCurrencyValue(bar.expense)}`}
                              ></div>
                            </div>
                            <span className="text-[10px] text-ink-muted uppercase tracking-wider font-bold mt-3 block">{bar.label}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Budget Progress visual checklist on Home */}
                <div className="col-span-1 lg:col-span-5 bg-surface border border-border-fine p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-ink tracking-tight mb-8">Budget Progress</h4>
                    
                    <div className="space-y-6">
                      {budgets.filter(b => b.category !== 'Overall').slice(0, 3).map(b => {
                        const spent = categorySpending[b.category] || 0;
                        const ratio = b.amount > 0 ? spent / b.amount : 0;
                        const pctStr = `${Math.min(100, Math.round(ratio * 100))}%`;
                        const isNearingLimit = ratio >= 0.85;

                        return (
                          <div key={b.id} className="space-y-2">
                            <div className="flex justify-between items-end font-tabular">
                              <span className="text-sm font-semibold text-ink">{b.category}</span>
                              <span className={`text-[11px] font-bold ${isNearingLimit ? 'text-red-600' : 'text-ink-muted'}`}>
                                {formatCurrencyValue(spent, dashboardCurrency)} / {formatCurrencyValue(b.amount, dashboardCurrency)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-mid overflow-hidden">
                              <div
                                style={{ width: pctStr }}
                                className={`h-full transition-all duration-300 ${
                                  isNearingLimit ? 'bg-red-600' : 'bg-black'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {budgets.filter(b => b.category !== 'Overall').length === 0 && (
                        <p className="text-xs text-ink-muted uppercase tracking-wider text-center py-4">No budgets set yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => setCurrentView('budget')}
                      className="w-full text-center py-3 border border-black font-semibold text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-all active:scale-95 duration-100"
                    >
                      Manage All Budgets
                    </button>
                  </div>
                </div>
              </section>

              {/* Transactions Activity Feed list rows */}
              <section className="bg-surface border border-border-fine">
                <div className="p-6 md:p-8 border-b border-border-fine flex justify-between items-center">
                  <h4 className="text-xl font-bold text-ink tracking-tight">Recent Transactions</h4>
                  <button
                    onClick={() => {
                      // switch to accounts view lower table or settings
                      setCurrentView('accounts');
                    }}
                    className="text-ink-muted hover:text-ink font-semibold text-xs uppercase tracking-wider underline"
                  >
                    View All Activity
                  </button>
                </div>

                <div className="divide-y divide-border-fine font-tabular">
                  {transactions.slice(0, 6).map(tx => {
                    const acc = accounts.find(a => a.id === tx.sourceAccountId);
                    const instMeta = getInstitutionMeta(acc?.institution || 'Other');
                    const isIncoming = tx.type === 'Income';

                    return (
                      <div key={tx.id} className="p-5 md:p-6 flex items-center hover:bg-surface-low transition-colors group cursor-pointer justify-between">
                        <div className="flex items-center gap-4">
                          {/* leading circle colored container or fallback */}
                          <div className="w-10 h-10 overflow-hidden shrink-0">
                            <InstitutionLogo id={instMeta.id || 'other'} badge={instMeta.badge} />
                          </div>
                          
                          <div>
                            <p className="text-sm font-bold text-ink line-clamp-1">{tx.note || tx.category}</p>
                            <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider mt-0.5">
                              {tx.category} • {tx.date} {tx.time}
                            </p>
                          </div>
                        </div>

                        {/* Trail info */}
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm font-bold ${
                              isIncoming ? 'text-emerald-600' : 'text-ink'
                            }`}
                          >
                            {isIncoming ? '+' : '-'}{formatCurrencyValue(tx.amount, dashboardCurrency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
                </>
              )}
            </div>
          )}

          {/* VIEW: ACCOUNTS LINKED */}
          {currentView === 'accounts' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Profile Net Worth Rows */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5 block">Total Net Worth</span>
                  <h3 className="text-4xl md:text-5xl font-black text-ink tracking-tight font-tabular">
                    {formatCurrencyValue(totalBalancePHP)}
                  </h3>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="border border-black text-ink px-5 py-2.5 hover:bg-surface-low transition-colors text-xs font-semibold uppercase tracking-wider active:scale-95"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    className="border border-black bg-surface-mid text-ink px-5 py-2.5 hover:bg-surface-mid transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Internal Transfer
                  </button>
                  <button
                    onClick={() => setIsAddAccountOpen(true)}
                    className="bg-black text-white px-5 py-2.5 hover:opacity-90 transition-opacity text-xs font-semibold uppercase tracking-wider active:scale-95"
                  >
                    Add Custom Account
                  </button>
                </div>
              </div>

              {/* Grid 2: Horizontal or Bento card accounts collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-tabular">
                {accounts.map(acc => {
                  const instMeta = getInstitutionMeta(acc.institution);
                  const isCurEditing = editingAccountId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className={`bg-surface border border-border-fine p-6 flex flex-col justify-between min-h-[200px] transition-all hover:scale-[1.01] ${
                        acc.isArchived ? 'opacity-60 bg-surface-low' : ''
                      }`}
                    >
                      {/* Logo header row */}
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 overflow-hidden shrink-0">
                          <InstitutionLogo id={instMeta.id || 'other'} badge={instMeta.badge} />
                        </div>
                        <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">
                          {acc.type} {acc.isArchived && '(Archived)'}
                        </span>
                      </div>

                      {/* Info layout */}
                      <div className="my-4">
                        <h4 className="text-base font-bold text-ink line-clamp-1">{acc.name}</h4>
                        <p className="text-xs text-ink-muted mt-1">{acc.accountNumber}</p>
                      </div>

                      {/* Interactive Bottom action bar */}
                      <div className="border-t border-border-fine pt-4 flex justify-between items-center">
                        {isCurEditing ? (
                          <div className="flex gap-2 items-center w-full">
                            <input
                              type="number"
                              defaultValue={acc.balance}
                              onBlur={(e) => handleQuickBalanceUpdate(acc.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleQuickBalanceUpdate(acc.id, (e.target as HTMLInputElement).value);
                                }
                              }}
                              autoFocus
                              className="border-b border-black text-sm py-1 font-bold w-24 outline-none"
                            />
                            <p className="text-[9px] text-ink-muted font-bold">Press Enter</p>
                          </div>
                        ) : (
                          <p
                            onClick={() => {
                              setEditingAccountId(acc.id);
                              setEditBalanceValue(String(acc.balance));
                            }}
                            className="text-base font-bold text-ink cursor-pointer hover:underline"
                            title="Click to edit balance manually"
                          >
                            {formatValueByAccountCurrency(acc.balance, acc.currency)}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleArchiveAccount(acc.id)}
                            className="text-[9px] font-bold text-ink-muted uppercase hover:text-ink tracking-widest mr-1.5"
                            title="Toggle Archive"
                          >
                            {acc.isArchived ? 'Unarchive' : 'Archive'}
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="text-ink-faint hover:text-red-600 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add new account callout placeholder block matching screenshot 3 bottom card */}
                <div
                  onClick={() => setIsAddAccountOpen(true)}
                  className="border-2 border-dashed border-border-fine transition-colors hover:bg-surface-low cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                >
                  <Plus className="w-8 h-8 text-ink-faint mb-2" />
                  <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">Link Account</span>
                </div>
              </div>

              {/* Bottom Consolidated Activity Logs Table */}
              <section className="bg-surface border border-border-fine font-tabular">
                <div className="p-6 md:p-8 border-b border-border-fine">
                  <h3 className="text-xl font-bold text-ink tracking-tight">Consolidated Activity Logs</h3>
                  <p className="text-xs text-ink-muted mt-1">Manual transaction bookkeeping audit history</p>
                </div>

                <div className="divide-y divide-border-fine">
                  {transactions.map(tx => {
                    const acc = accounts.find(a => a.id === tx.sourceAccountId);
                    const instMeta = getInstitutionMeta(acc?.institution || 'Other');
                    const isIncome = tx.type === 'Income';

                    return (
                      <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-low transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 overflow-hidden shrink-0">
                            <InstitutionLogo id={instMeta.id || 'other'} badge={instMeta.badge} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">{tx.note || tx.category}</p>
                            <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider mt-0.5">
                              {acc ? acc.name : 'Deleted Account'} • {tx.category} • {tx.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 justify-between md:justify-end">
                          <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-ink'}`}>
                            {isIncome ? '+' : '-'}{formatCurrencyValue(tx.amount)}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm('Delete this transaction? This won\'t revert your account balance.')) {
                                setTransactions(prev => prev.filter(t => t.id !== tx.id));
                              }
                            }}
                            className="text-ink-faint hover:text-red-500 duration-150"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}

          {/* VIEW: BUDGET PLANNER */}
          {currentView === 'budget' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5 block">Budget planner</span>
                  <h2 className="text-4xl font-extrabold tracking-tight text-ink">Allocations Overview</h2>
                </div>

                {/* Inline budget adder */}
                <form onSubmit={handleAddBudget} className="flex flex-wrap items-end gap-3 bg-surface-low p-4 border border-border-fine">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-ink-muted mb-1">Category</label>
                    <select
                      value={newBudgetCategory}
                      onChange={(e) => setNewBudgetCategory(e.target.value)}
                      className="border-b border-black py-2 bg-transparent text-xs w-36 outline-none"
                    >
                      {transactionCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-ink-muted mb-1">Limit (PHP)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={newBudgetAmount}
                      onChange={(e) => setNewBudgetAmount(e.target.value)}
                      className="border-b border-border-fine focus:border-black py-1.5 bg-transparent text-xs w-28 outline-none font-tabular"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white hover:opacity-90 font-bold text-[10px] uppercase tracking-widest py-2.5 px-4 active:scale-95 transition-transform"
                  >
                    Set Budget
                  </button>
                </form>
              </div>

              {/* Progress layouts for budgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-tabular">
                {budgets.map(b => {
                  const spent = categorySpending[b.category] || 0;
                  const ratio = b.amount > 0 ? Math.min(1, spent / b.amount) : 0;
                  const isSafe = ratio < 0.75;
                  const isDanger = ratio >= 0.85;

                  return (
                    <div key={b.id} className="bg-surface border border-border-fine p-6 md:p-8 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-ink">{b.category}</h4>
                          <p className="text-[10px] text-ink-muted font-semibold tracking-wider uppercase mt-1">{b.period} Target</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(b.id)}
                          className="text-ink-faint hover:text-red-500 transition-colors"
                          title="Remove budget setting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-ink-muted">Progress</span>
                          <span className={isDanger ? 'text-red-600 font-bold' : 'text-ink'}>
                            {Math.round(ratio * 100)}% Spent
                          </span>
                        </div>
                        
                        {/* High fidelity thick line bar layout */}
                        <div className="h-2 w-full bg-surface-mid overflow-hidden">
                          <div
                            style={{ width: `${ratio * 100}%` }}
                            className={`h-full transition-all duration-300 ${
                              isDanger ? 'bg-red-600' : 'bg-black'
                            }`}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[11px] text-ink-muted pt-1">
                          <span>Spent {formatCurrencyValue(spent)}</span>
                          <span>Limit {formatCurrencyValue(b.amount)}</span>
                        </div>
                      </div>

                      {/* Warnings row */}
                      {isDanger && (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50/50 p-2.5 text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Critical spent warning indicator
                        </div>
                      )}
                      {!isDanger && ratio >= 0.75 && (
                        <div className="flex items-center gap-1.5 text-ink-muted bg-surface-low p-2.5 text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Approaching set limit threshold
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Savings Goals tracker widget section */}
              <section className="bg-surface border border-border-fine p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-ink tracking-tight">Active Savings Goal Targets</h3>
                    <p className="text-xs text-ink-muted mt-0.5">Simple micro progress indicators for manual milestone assets</p>
                  </div>
                  <button
                    onClick={() => setIsGoalModalOpen(true)}
                    className="border border-black px-4 py-2 hover:bg-surface-low text-[10px] font-bold uppercase tracking-widest active:scale-95"
                  >
                    New Goal
                  </button>
                </div>

                <div className="space-y-6 font-tabular">
                  {savingsGoals.map(goal => {
                    const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                    return (
                      <div key={goal.id} className="border-b border-border-fine pb-5 last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                          <div>
                            <span className="font-bold text-sm text-ink">{goal.name}</span>
                            {goal.targetDate && (
                              <span className="text-[10px] text-ink-muted uppercase font-black tracking-widest ml-3">
                                Target Date: {goal.targetDate}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-ink-muted">Current Saved:</span>
                            <input
                              type="number"
                              defaultValue={goal.currentAmount}
                              onChange={(e) => handleUpdateGoalProgress(goal.id, e.target.value)}
                              className="w-24 border-b border-border-fine text-xs py-0.5 px-1 font-bold focus:border-black outline-none font-tabular text-right"
                            />
                            <span className="text-xs font-bold text-ink-muted">of {formatCurrencyValue(goal.targetAmount)}</span>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-ink-faint hover:text-red-500 transition-colors ml-2"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-surface-mid overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-black"></div>
                        </div>
                        <div className="text-right text-[10px] font-bold text-ink-muted mt-1">{pct}% Secured</div>

                        {/* Live Saving Calculations Engine */}
                        {goal.targetDate && (
                          (() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const target = new Date(goal.targetDate);
                            target.setHours(0,0,0,0);
                            const diffTime = target.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const isOverdue = diffDays < 0;
                            const remainingToSave = Math.max(0, goal.targetAmount - goal.currentAmount);

                            if (remainingToSave <= 0) {
                              return (
                                <div className="mt-2 text-[9px] text-emerald-650 bg-emerald-50 border border-emerald-200 font-extrabold px-2.5 py-1 uppercase tracking-widest inline-block">
                                  Goal complete! Fully funded. 🎉
                                </div>
                              );
                            }

                            if (isOverdue) {
                              return (
                                <div className="mt-2 text-[9px] text-ink-muted bg-surface-low border border-border-fine font-extrabold px-2.5 py-1 uppercase tracking-widest inline-block">
                                  Passed Target Date
                                </div>
                              );
                            }

                            const daysLeft = Math.max(1, diffDays);
                            const savePerDay = remainingToSave / daysLeft;
                            const savePerWeek = remainingToSave / (daysLeft / 7);
                            const savePerMonth = remainingToSave / (daysLeft / 30.43);
                            const savePerYear = remainingToSave / (daysLeft / 365.25);

                            return (
                              <div className="mt-3 bg-surface-low border border-border-fine p-3.5 text-xs text-ink grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted block mb-0.5">TO SAVE DAILY</span>
                                  <span className="font-bold text-ink text-[13px]">{formatCurrencyValue(savePerDay, settings.currency)}</span>
                                </div>
                                {daysLeft >= 7 && (
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted block mb-0.5">TO SAVE WEEKLY</span>
                                    <span className="font-bold text-ink text-[13px]">{formatCurrencyValue(savePerWeek, settings.currency)}</span>
                                  </div>
                                )}
                                {daysLeft >= 30 && (
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted block mb-0.5">TO SAVE MONTHLY</span>
                                    <span className="font-bold text-ink text-[13px]">{formatCurrencyValue(savePerMonth, settings.currency)}</span>
                                  </div>
                                )}
                                {daysLeft >= 365 && (
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted block mb-0.5">TO SAVE YEARLY</span>
                                    <span className="font-bold text-ink text-[13px]">{formatCurrencyValue(savePerYear, settings.currency)}</span>
                                  </div>
                                )}
                                <div className="col-span-2 sm:col-span-4 text-[9px] text-ink-muted uppercase tracking-widest font-black border-t border-border-fine/60 pt-2 flex justify-between">
                                  <span>TIME RUNWAY</span>
                                  <span className="text-ink">{daysLeft} calendar days left</span>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* VIEW: REPORTS & ANALYTICS */}
          {currentView === 'reports' && (
            <div className="space-y-8 animate-fadeIn font-tabular">
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5 block">Reports &amp; Analytics</span>
                <h2 className="text-4xl font-extrabold tracking-tight text-ink">Consolidated Auditing Graphs</h2>
              </div>

              {/* Grid bento layout for spending indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Category wise spending chart (7 cols) */}
                <div className="col-span-1 lg:col-span-7 bg-surface border border-border-fine p-6 md:p-8">
                  <h3 className="text-lg font-bold text-ink mb-6">Spending Breakdown by Category</h3>
                  
                  <div className="space-y-4">
                    {transactionCategories.map(cat => {
                      const spend = categorySpending[cat] || 0;
                      if (spend <= 0) return null;
                      const maxSpend = Math.max(...(Object.values(categorySpending) as number[]), 1);
                      const pctWidth = `${(spend / maxSpend) * 100}%`;

                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-ink">{cat}</span>
                            <span className="font-bold text-ink-muted">{formatCurrencyValue(spend)}</span>
                          </div>
                          <div className="h-4 bg-surface-mid">
                            <div style={{ width: pctWidth }} className="h-full bg-black hover:opacity-85 cursor-pointer"></div>
                          </div>
                        </div>
                      );
                    })}
                    {(Object.values(categorySpending) as number[]).filter(v => v > 0).length === 0 && (
                      <p className="text-xs text-ink-muted py-8 text-center uppercase tracking-wider">No categorized records found within the current period.</p>
                    )}
                  </div>
                </div>

                {/* 2. Spending trends overview line graph (5 cols) */}
                <div className="col-span-1 lg:col-span-5 bg-surface border border-border-fine p-6 md:p-8">
                  <h3 className="text-lg font-bold text-ink mb-1">Monthly Spending Trend</h3>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider font-bold mb-4 block">Sept - Oct Timeline</span>

                  {/* High fidelity line chart mockup overlay styled in monochrome */}
                  <div className="h-44 w-full flex items-center justify-center relative mt-6 border-b border-border-fine">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#E5E5E5" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#E5E5E5" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#E5E5E5" strokeWidth="0.5" />
                      
                      {/* Trend path */}
                      <path
                        d="M 5,85 Q 25,60 45,72 T 85,30 T 95,45"
                        fill="none"
                        stroke="black"
                        strokeWidth="3"
                      />
                      
                      {/* Active point dots */}
                      <circle cx="85" cy="30" r="3" fill="black" />
                      <circle cx="45" cy="72" r="2" fill="black" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] text-ink-muted mt-4 font-bold uppercase tracking-wider">
                    <span>Sept 01</span>
                    <span>Sept 15</span>
                    <span>Oct 24</span>
                  </div>
                </div>
              </div>

              {/* Grid 3: Account wise distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface border border-border-fine p-6 md:p-8">
                  <h3 className="text-lg font-bold text-ink mb-6">Asset Allocation by Account</h3>
                  <div className="space-y-4">
                    {accounts.map(acc => {
                      const ratio = totalBalancePHP > 0 ? (acc.balance / totalBalancePHP) * 100 : 0;
                      return (
                        <div key={acc.id} className="flex justify-between items-center gap-3 text-xs">
                          <span className="font-semibold text-ink truncate min-w-0">{acc.name}</span>
                          <div className="flex items-center gap-3 w-28 sm:w-48 font-tabular shrink-0">
                            <div className="h-2 flex-1 bg-surface-mid overflow-hidden">
                              <div style={{ width: `${ratio}%` }} className="h-full bg-black"></div>
                            </div>
                            <span className="font-bold text-ink-muted text-[11px] w-10 text-right">{Math.round(ratio)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-surface border border-border-fine p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-ink mb-1">Monthly Financial Report</h3>
                    <p className="text-xs text-ink-muted mt-1">Direct statistics review parameters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-surface-low p-4 border border-border-fine">
                      <span className="text-[9px] text-ink-muted font-bold uppercase tracking-widest block mb-1">Average spent (Day)</span>
                      <p className="text-xl font-bold text-ink">₱{Math.round(monthlyExpensesPHP / 30)}</p>
                    </div>
                    <div className="bg-surface-low p-4 border border-border-fine">
                      <span className="text-[9px] text-ink-muted font-bold uppercase tracking-widest block mb-1">Net Flow Balance</span>
                      <p className={`text-xl font-bold ${monthlyIncomePHP >= monthlyExpensesPHP ? 'text-ink' : 'text-red-600'}`}>
                        {monthlyIncomePHP >= monthlyExpensesPHP ? '+' : ''}₱{Math.round(monthlyIncomePHP - monthlyExpensesPHP)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS CONTEXT */}
          {currentView === 'settings' && (
            <div className="space-y-8 animate-fadeIn font-tabular">
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5 block">APP SETTINGS</span>
                <h2 className="text-4xl font-extrabold tracking-tight text-ink">Configuration Panel</h2>
              </div>

              <div className="bg-surface border border-border-fine divide-y divide-border-fine text-sm">

                {/* 0. Dark mode toggle */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-ink">Dark Mode</span>
                    <p className="text-xs text-ink-muted mt-1">Switch the interface to a low-light dark theme</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.darkMode}
                    onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                    className={`relative w-14 h-8 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] border border-border-fine ${
                      settings.darkMode ? 'bg-ink' : 'bg-surface-mid'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-surface transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        settings.darkMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 1. Default currency switch */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-ink">Default Base Currency</span>
                    <p className="text-xs text-ink-muted mt-1">Configure default formatting symbols across reports and ledger balances</p>
                  </div>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value as any }))}
                    className="border border-border-fine p-2 text-xs bg-transparent uppercase tracking-wider w-36 outline-none cursor-pointer text-ink"
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                {/* 2. Start of periods preference */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-ink">Temporal Start Preferences</span>
                    <p className="text-xs text-ink-muted mt-1">Define starting days parameters for weekly/monthly calculations audits</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={settings.startOfWeek}
                      onChange={(e) => setSettings(prev => ({ ...prev, startOfWeek: e.target.value as any }))}
                      className="border border-border-fine p-2 text-xs bg-transparent uppercase tracking-wider outline-none cursor-pointer text-ink"
                    >
                      <option value="Sunday">Sunday start</option>
                      <option value="Monday">Monday start</option>
                    </select>
                  </div>
                </div>

                {/* 3. Conversion rates multiplier configuration */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-ink">Manual Conversion Rate (USD / PHP)</span>
                    <p className="text-xs text-ink-muted mt-1">Configure live local Philippine conversion multiplier parameters for reference</p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="1000"
                    value={settings.usdToPhpRate}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0) {
                        setSettings(prev => ({ ...prev, usdToPhpRate: val }));
                      }
                    }}
                    className="border border-border-fine focus:border-black p-2 text-sm text-right font-bold w-40 outline-none font-tabular"
                  />
                </div>

                {/* 4. Data migration export/reset features mapping the mockup settings options */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-ink">Workspace Operations &amp; Migration</span>
                    <p className="text-xs text-ink-muted mt-1">Export your offline transaction log, or reset the workspace to a blank state for production tracking</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="border border-black hover:bg-surface-low px-4 py-2 text-xs uppercase font-bold tracking-widest flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Backup
                    </button>
                    <button
                      onClick={handleResetData}
                      className="border border-black hover:bg-surface-mid text-ink px-4 py-2 text-xs uppercase font-bold tracking-widest flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Load Demo Sandbox
                    </button>
                    <button
                      onClick={handleWipeAllData}
                      className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 text-xs uppercase font-bold tracking-widest flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Wipe Workspace (Clean State)
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer copyright credit and disclaimer matches high-end minimalist print look */}
              <div className="text-center text-[10px] text-ink-muted font-bold uppercase tracking-widest space-y-2 py-8 opacity-60">
                <p>Synced with Local Storage Offline Database Cache</p>
                <p>© 2026 Next Check Premium Personal Finance. Manual tracking only.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAL 1: ADD TRANSACTION (Exactly styled to mockup screen 4) --- */}
      {isAddTransactionOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-backdropIn">
          <div className="bg-surface w-full max-w-lg border border-border-fine flex flex-col max-h-[90vh] overflow-hidden animate-modalIn">
            
            {/* Modal Header */}
            <header className="flex justify-between items-center h-16 px-6 border-b border-border-fine">
              <button
                type="button"
                onClick={() => setIsAddTransactionOpen(false)}
                className="hover:opacity-70 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-ink" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-ink">Add Transaction</h1>
              <div className="w-5"></div> {/* spacer */}
            </header>

            {/* Scrollable Entry Form */}
            <form onSubmit={handleSaveTransaction} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Type selector toggle exactly matching mockup segmented item tabs */}
              <div className="flex justify-center">
                <div className="inline-flex bg-surface-mid p-1.5 border border-border-fine rounded-none">
                  {(['Expense', 'Income', 'Transfer'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTxType(t)}
                      className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                        txType === t
                          ? 'bg-black text-white'
                          : 'text-ink-muted hover:text-ink hover:bg-surface-low'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real time amount display mockup */}
              <div className="text-center font-tabular">
                <label className="block text-[10px] text-ink-muted uppercase tracking-widest font-bold mb-2">Amount</label>
                <div className="relative inline-block w-full max-w-xs">
                  <span className="absolute left-4 bottom-2 text-3xl font-extrabold text-ink-muted">
                    {txType === 'Income' ? '+' : txType === 'Transfer' ? '⇆' : '-'}₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-transparent text-center text-4xl font-extrabold tracking-tight pb-2 border-b border-border-fine outline-none w-full pl-12"
                  />
                </div>
              </div>

              {/* Transaction details block */}
              <div className="space-y-6">
                
                {/* Account selector */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">
                    {txType === 'Transfer' ? 'Source Account (From)' : 'Account Source'}
                  </label>
                  <select
                    value={txSourceAccountId}
                    onChange={(e) => setTxSourceAccountId(e.target.value)}
                    className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none cursor-pointer"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency} {a.balance})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Account only active on Transfer */}
                {txType === 'Transfer' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">
                      Destination Account (To)
                    </label>
                    <select
                      value={txDestinationAccountId}
                      onChange={(e) => setTxDestinationAccountId(e.target.value)}
                      className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none cursor-pointer"
                    >
                      <option value="">-- Map destination --</option>
                      {accounts
                        .filter(a => a.id !== txSourceAccountId)
                        .map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.currency} {a.balance})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Category Selector (Hidden on Transfer, default set automatically) */}
                {txType !== 'Transfer' && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Category</label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none cursor-pointer"
                    >
                      {transactionCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date & Time Grid Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Date</label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Time</label>
                    <input
                      type="time"
                      required
                      value={txTime}
                      onChange={(e) => setTxTime(e.target.value)}
                      className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Optional note textbox entry */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Optional Note</label>
                  <textarea
                    placeholder="What was this transaction for?"
                    rows={2}
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    className="w-full bg-transparent border-b border-border-fine font-medium text-sm py-3 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Save Trigger bottom elements */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black hover:opacity-95 text-white h-14 rounded-none font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  Save Transaction
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
                <p className="text-center text-[10px] text-ink-muted font-bold uppercase tracking-widest mt-4 opacity-60">
                  Syncing with Local Storage Cache
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD CUSTOM ACCOUNT --- */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-backdropIn">
          <div className="bg-surface w-full max-w-md border border-border-fine flex flex-col animate-modalIn">
            <header className="flex justify-between items-center h-16 px-6 border-b border-border-fine">
              <h3 className="text-lg font-bold text-ink tracking-tight">Add Custom Account</h3>
              <button onClick={() => setIsAddAccountOpen(false)}>
                <X className="w-5 h-5 text-ink" />
              </button>
            </header>

            <form onSubmit={handleCreateAccount} className="p-6 md:p-8 space-y-6">
              
              {/* Institution brand mapper dropdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Financial Institution</label>
                  <span className="text-[9px] text-ink-muted uppercase font-black tracking-widest">TAP BRAND LOGO QUICK PICK</span>
                </div>
                
                {/* Popular Grid Quick Selectors with actual Logos */}
                <div className="grid grid-cols-4 gap-2 border border-border-fine p-2 bg-surface-low">
                  {[
                    { id: 'gcash', label: 'GCash' },
                    { id: 'paymaya', label: 'Maya' },
                    { id: 'bdo', label: 'BDO' },
                    { id: 'bpi', label: 'BPI' },
                    { id: 'union', label: 'Union' },
                    { id: 'metro', label: 'Metro' },
                    { id: 'gotyme', label: 'GoTyme' },
                    { id: 'seabank', label: 'SeaBank' }
                  ].map(quick => (
                    <button
                      key={quick.id}
                      type="button"
                      onClick={() => setAccInstitutionId(quick.id)}
                      className={`relative p-1.5 flex flex-col items-center justify-center border transition-all rounded-xs select-none ${
                        accInstitutionId === quick.id
                          ? 'border-black bg-surface scale-[1.04] shadow-xs ring-1 ring-black/10'
                          : 'border-border-fine bg-surface hover:bg-surface-low'
                      }`}
                    >
                      <div className="w-8 h-8 overflow-hidden shrink-0 mb-1">
                        <InstitutionLogo id={quick.id} />
                      </div>
                      <span className="text-[8px] font-extrabold tracking-tight uppercase text-ink">{quick.label}</span>
                    </button>
                  ))}
                </div>

                <select
                  value={accInstitutionId}
                  onChange={(e) => setAccInstitutionId(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-2.5 text-sm font-medium outline-none cursor-pointer text-ink"
                >
                  {PHILIPPINE_INSTITUTIONS.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      [{inst.type}] {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name label */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Account Label Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Spending Wallet"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none"
                />
              </div>

              {/* Account number / identifier */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Account Mask Number</label>
                <input
                  type="text"
                  placeholder="e.g. •••• 9021 or 0917 •••• 123"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none"
                />
              </div>

              {/* Balance & Currency row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 font-tabular">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Balance Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Currency</label>
                  <select
                    value={accCurrency}
                    onChange={(e) => setAccCurrency(e.target.value as any)}
                    className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none cursor-pointer"
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Account type category */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Account Class Type</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none cursor-pointer"
                >
                  <option value="Savings">Savings</option>
                  <option value="Checking">Checking</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Cash">Cash option</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black hover:opacity-95 text-white py-4 font-bold text-xs uppercase tracking-widest"
                >
                  Create Custom Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: INTERNAL ACCOUNT TRANSFER QUICK TOOL --- */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-backdropIn">
          <div className="bg-surface w-full max-w-md border border-border-fine flex flex-col animate-modalIn">
            <header className="flex justify-between items-center h-16 px-6 border-b border-border-fine">
              <h3 className="text-lg font-bold text-ink tracking-tight">Internal Account Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)}>
                <X className="w-5 h-5 text-ink" />
              </button>
            </header>

            <form onSubmit={handleExecuteTransfer} className="p-6 md:p-8 space-y-6">
              
              {/* From accounts selection */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">From Source Account</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none cursor-pointer"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency} {a.balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* To accounts selection */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">To Destination Target</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none cursor-pointer"
                >
                  {accounts
                    .filter(a => a.id !== transferFromId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency} {a.balance})
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount value */}
              <div className="space-y-1.5 font-tabular">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Transfer Magnitude Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-bold outline-none"
                />
              </div>

              {/* Transfer explanation note */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Booking Details Note</label>
                <input
                  type="text"
                  placeholder="e.g. Bank load to GCASH"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-3 text-sm font-medium outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black hover:opacity-95 text-white py-4 font-bold text-xs uppercase tracking-widest"
                >
                  Execute Booking Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: NEW SAVINGS GOAL TARGET --- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-backdropIn">
          <div className="bg-surface w-full max-w-sm border border-border-fine flex flex-col animate-modalIn">
            <header className="flex justify-between items-center h-16 px-6 border-b border-border-fine">
              <h3 className="text-base font-bold text-ink tracking-tight">Create Milestone Savings Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)}>
                <X className="w-5 h-5 text-ink" />
              </button>
            </header>

            <form onSubmit={handleAddGoal} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Pool Fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-2 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 font-tabular">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Target Value</label>
                  <input
                    type="number"
                    required
                    placeholder="PHP"
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-border-fine py-2 text-sm outline-none font-bold"
                  />
                </div>
                <div className="space-y-1.5 font-tabular">
                  <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Starting Saved</label>
                  <input
                    type="number"
                    placeholder="Optional starting value"
                    value={goalCurrentAmount}
                    onChange={(e) => setGoalCurrentAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-border-fine py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] text-ink-muted uppercase tracking-widest font-bold">Future Target Date</label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full bg-transparent border-b border-border-fine py-2 text-sm outline-none cursor-pointer"
                />
              </div>

              {/* Dynamic Live Preview Calculation in Modal */}
              {goalTargetAmount && goalTargetDate && (() => {
                const targetVal = Number(goalTargetAmount);
                const currentVal = Number(goalCurrentAmount) || 0;
                const remaining = targetVal - currentVal;
                
                const today = new Date();
                today.setHours(0,0,0,0);
                const target = new Date(goalTargetDate);
                target.setHours(0,0,0,0);
                const diffTime = target.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (remaining <= 0) {
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 text-center text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                      Already fully funded. 🌸
                    </div>
                  );
                }
                if (diffDays <= 0) {
                  return (
                    <div className="bg-red-50 border border-red-200 p-2.5 text-center text-[10px] text-red-650 font-bold uppercase tracking-wider">
                      Please select a future date.
                    </div>
                  );
                }
                
                const days = Math.max(1, diffDays);
                const daySave = remaining / days;
                const wkSave = remaining / (days / 7);
                const moSave = remaining / (days / 30.43);

                return (
                  <div className="bg-surface-low border border-border-fine p-3 rounded-none space-y-1.5 text-xs text-ink border-dashed">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted block pb-1 border-b border-border-fine/50">LIVE ESTIMATOR PREVIEW</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Daily savings required:</span>
                      <strong className="text-ink">{formatCurrencyValue(daySave, settings.currency)}/day</strong>
                    </div>
                    {days >= 7 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Weekly savings required:</span>
                        <strong className="text-ink">{formatCurrencyValue(wkSave, settings.currency)}/wk</strong>
                      </div>
                    )}
                    {days >= 30 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Monthly savings required:</span>
                        <strong className="text-ink">{formatCurrencyValue(moSave, settings.currency)}/mo</strong>
                      </div>
                    )}
                    <div className="text-[9px] text-ink-muted uppercase tracking-widest text-right font-black pt-1">
                      Runway is {days} calendar days
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 font-bold text-xs uppercase tracking-widest"
                >
                  Active Tracking Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Bar matching screens 2 & 4 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-fine flex justify-around items-center h-20 px-4">
        
        {/* Dashboard Home selection link */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            currentView === 'dashboard' ? 'text-ink font-extrabold scale-110' : 'text-ink-muted'
          }`}
        >
          <LayoutDashboard className="w-5.5 h-5.5" />
          <span className="text-[9px] tracking-tight mt-1 font-semibold">Home</span>
        </button>

        {/* Accounts linked selection link */}
        <button
          onClick={() => setCurrentView('accounts')}
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            currentView === 'accounts' ? 'text-ink font-extrabold scale-110' : 'text-ink-muted'
          }`}
        >
          <Wallet className="w-5.5 h-5.5" />
          <span className="text-[9px] tracking-tight mt-1 font-semibold">Accounts</span>
        </button>

        {/* Central Prominent floating button for fast bookkeeping addition */}
        <div className="relative -top-4">
          <button
            onClick={() => setIsAddTransactionOpen(true)}
            className="w-13 h-13 bg-black hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="Book Transaction"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Budget Planner selection link */}
        <button
          onClick={() => setCurrentView('budget')}
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            currentView === 'budget' ? 'text-ink font-extrabold scale-110' : 'text-ink-muted'
          }`}
        >
          <PiggyBank className="w-5.5 h-5.5" />
          <span className="text-[9px] tracking-tight mt-1 font-semibold">Budget</span>
        </button>

        {/* Configuration select link */}
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            currentView === 'settings' ? 'text-ink font-bold scale-110' : 'text-ink-muted'
          }`}
        >
          <Settings className="w-5.5 h-5.5" />
          <span className="text-[9px] tracking-tight mt-1 font-semibold">Config</span>
        </button>
      </nav>
    </div>
  );
}
