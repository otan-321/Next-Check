/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, Transaction, Budget, SavingsGoal, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'PHP',
  startOfWeek: 'Monday',
  startOfMonth: 1,
  darkMode: false,
  usdToPhpRate: 56.4,
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'BDO Unibank Premium',
    institution: 'BDO',
    type: 'Savings',
    balance: 842500.00,
    accountNumber: '•••• 4821',
    currency: 'PHP',
    isArchived: false,
  },
  {
    id: 'acc-2',
    name: 'BPI Family Savings',
    institution: 'BPI',
    type: 'Checking',
    balance: 124300.25,
    accountNumber: '•••• 9012',
    currency: 'PHP',
    isArchived: false,
  },
  {
    id: 'acc-3',
    name: 'GCash Verified',
    institution: 'GCash',
    type: 'E-Wallet',
    balance: 15240.15,
    accountNumber: '0917 •••• 888',
    currency: 'PHP',
    isArchived: false,
  },
  {
    id: 'acc-4',
    name: 'Maya Savings (6%)',
    institution: 'Maya',
    type: 'Savings',
    balance: 500150.10,
    accountNumber: 'Wallet ID: 4421',
    currency: 'PHP',
    isArchived: false,
  },
  {
    id: 'acc-5',
    name: 'UnionBank PlayEveryday',
    institution: 'UnionBank',
    type: 'Payroll',
    balance: 1000000.00,
    accountNumber: '•••• 1123',
    currency: 'PHP',
    isArchived: false,
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 1299.00,
    type: 'Expense',
    sourceAccountId: 'acc-1',
    category: 'Shopping',
    date: '2026-10-12',
    time: '10:42',
    note: 'Apple Store Fifth Ave - New iPhone',
  },
  {
    id: 'tx-2',
    amount: 8420.00,
    type: 'Expense',
    sourceAccountId: 'acc-3',
    category: 'Food & Dining',
    date: '2026-10-11',
    time: '20:15',
    note: 'Nobu Manila - Anniversary Dinner',
  },
  {
    id: 'tx-3',
    amount: 4200.00,
    type: 'Income',
    sourceAccountId: 'acc-1',
    category: 'Salary',
    date: '2026-10-10',
    time: '09:00',
    note: 'Stripe Payout - Project Milestone',
  },
  {
    id: 'tx-4',
    amount: 840.50,
    type: 'Expense',
    sourceAccountId: 'acc-1',
    category: 'Transport',
    date: '2026-10-08',
    time: '14:30',
    note: 'Cathay Pacific Airways - Upgrade Flight',
  },
  {
    id: 'tx-5',
    amount: 450.00,
    type: 'Expense',
    sourceAccountId: 'acc-1',
    category: 'Food & Dining',
    date: '2026-10-24',
    time: '08:45',
    note: 'Starbucks Reserve - Cold Brew',
  },
  {
    id: 'tx-6',
    amount: 240.12,
    type: 'Income',
    sourceAccountId: 'acc-4',
    category: 'Investment',
    date: '2026-10-23',
    time: '00:01',
    note: 'Interest Credited - 6% p.a. Savings Promo',
  },
  {
    id: 'tx-7',
    amount: 382.00,
    type: 'Expense',
    sourceAccountId: 'acc-3',
    category: 'Transport',
    date: '2026-10-22',
    time: '18:30',
    note: 'Grab Car - Ride home from Office',
  },
  {
    id: 'tx-8',
    amount: 2450.00,
    type: 'Expense',
    sourceAccountId: 'acc-3',
    category: 'Food & Dining',
    date: '2026-10-25',
    time: '12:30',
    note: 'Wildflour Cafe - Weekend Brunch',
  },
  {
    id: 'tx-9',
    amount: 12800.00,
    type: 'Income',
    sourceAccountId: 'acc-4',
    category: 'Salary',
    date: '2026-10-24',
    time: '17:00',
    note: 'Monthly Dividend - Stock Payout',
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    category: 'Overall',
    amount: 80000.00,
    period: 'Monthly',
  },
  {
    id: 'b-2',
    category: 'Food & Dining',
    amount: 15000.00,
    period: 'Monthly',
  },
  {
    id: 'b-3',
    category: 'Rent & Utilities',
    amount: 25000.00,
    period: 'Monthly',
  },
  {
    id: 'b-4',
    category: 'Entertainment',
    amount: 8000.00,
    period: 'Monthly',
  },
  {
    id: 'b-5',
    category: 'Transport',
    amount: 5000.00,
    period: 'Monthly',
  },
  {
    id: 'b-6',
    category: 'Shopping',
    amount: 10000.00,
    period: 'Monthly',
  }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'g-1',
    name: 'Emergency Fund',
    targetAmount: 300000.00,
    currentAmount: 200000.00,
    targetDate: '2026-12-31',
  },
  {
    id: 'g-2',
    name: 'Japan Autumn Trip',
    targetAmount: 150000.00,
    currentAmount: 85000.00,
    targetDate: '2026-11-15',
  }
];

export const PHILIPPINE_INSTITUTIONS: {
  id: string;
  name: string;
  institution: string;
  badge: string;
  bgColor: string;
  textColor: string;
  type: string;
}[] = [
  // Banks
  { id: 'bdo', name: 'BDO Unibank', institution: 'BDO', badge: 'BDO', bgColor: '#002855', textColor: '#ffffff', type: 'Bank' },
  { id: 'bpi', name: 'BPI (Bank of the Philippine Islands)', institution: 'BPI', badge: 'BPI', bgColor: '#B30731', textColor: '#ffffff', type: 'Bank' },
  { id: 'metro', name: 'Metrobank', institution: 'Metrobank', badge: 'MB', bgColor: '#0038A8', textColor: '#ffffff', type: 'Bank' },
  { id: 'landbank', name: 'Landbank of the Philippines', institution: 'Landbank', badge: 'LBP', bgColor: '#1A5F20', textColor: '#ffffff', type: 'Bank' },
  { id: 'pnb', name: 'PNB (Philippine National Bank)', institution: 'PNB', badge: 'PNB', bgColor: '#0054A6', textColor: '#ffffff', type: 'Bank' },
  { id: 'secb', name: 'Security Bank', institution: 'Security Bank', badge: 'SBC', bgColor: '#002A54', textColor: '#ffffff', type: 'Bank' },
  { id: 'union', name: 'UnionBank of the Philippines', institution: 'UnionBank', badge: 'UB', bgColor: '#FF6600', textColor: '#ffffff', type: 'Bank' },
  { id: 'rcbc', name: 'RCBC', institution: 'RCBC', badge: 'RCBC', bgColor: '#005F9E', textColor: '#ffffff', type: 'Bank' },
  { id: 'china', name: 'China Bank', institution: 'China Bank', badge: 'CBC', bgColor: '#9E0B0E', textColor: '#ffffff', type: 'Bank' },
  { id: 'eastwest', name: 'EastWest Bank', institution: 'EastWest Bank', badge: 'EWB', bgColor: '#7A1C78', textColor: '#ffffff', type: 'Bank' },
  { id: 'psbank', name: 'PSBank', institution: 'PSBank', badge: 'PSB', bgColor: '#003366', textColor: '#ffffff', type: 'Bank' },
  { id: 'maybank', name: 'Maybank Philippines', institution: 'Maybank Philippines', badge: 'MBB', bgColor: '#FFCC00', textColor: '#000000', type: 'Bank' },
  { id: 'cimb', name: 'CIMB Bank PH', institution: 'CIMB Bank PH', badge: 'CIMB', bgColor: '#E61E2A', textColor: '#ffffff', type: 'Bank' },
  { id: 'bankofcomm', name: 'Bank of Commerce', institution: 'BankCom', badge: 'BC', bgColor: '#003566', textColor: '#ffffff', type: 'Bank' },
  { id: 'pbcom', name: 'PBCOM (Philippine Bank of Communications)', institution: 'PBCOM', badge: 'PBC', bgColor: '#0E2442', textColor: '#ffffff', type: 'Bank' },
  { id: 'philtrust', name: 'Philtrust Bank', institution: 'Philtrust', badge: 'PTB', bgColor: '#0D3E70', textColor: '#ffffff', type: 'Bank' },
  { id: 'robinsons', name: 'Robinsons Bank', institution: 'Robinsons Bank', badge: 'RBC', bgColor: '#008C44', textColor: '#ffffff', type: 'Bank' },
  { id: 'bdo_network', name: 'BDO Network Bank', institution: 'BDO Network Bank', badge: 'BDON', bgColor: '#273C75', textColor: '#ffffff', type: 'Bank' },
  { id: 'sterling', name: 'Sterling Bank of Asia', institution: 'Sterling Bank', badge: 'SBA', bgColor: '#0047AB', textColor: '#ffffff', type: 'Bank' },
  { id: 'dbp', name: 'DBP (Development Bank of the Philippines)', institution: 'DBP', badge: 'DBP', bgColor: '#0A3F7A', textColor: '#ffffff', type: 'Bank' },
  { id: 'aub', name: 'AUB (Asia United Bank)', institution: 'AUB', badge: 'AUB', bgColor: '#004b93', textColor: '#ffffff', type: 'Bank' },
  { id: 'hsbc', name: 'HSBC Philippines', institution: 'HSBC', badge: 'HSBC', bgColor: '#db0011', textColor: '#ffffff', type: 'Bank' },
  { id: 'cebuana', name: 'Cebuana Lhuillier Micro Savings', institution: 'Cebuana Lhuillier', badge: 'CLM', bgColor: '#012b54', textColor: '#ffffff', type: 'Bank' },
  // Digital Banks
  { id: 'maya_b', name: 'Maya Bank', institution: 'Maya Bank', badge: 'MYB', bgColor: '#00FF5F', textColor: '#000000', type: 'Digital Bank' },
  { id: 'gotyme', name: 'GoTyme Bank', institution: 'GoTyme', badge: 'GT', bgColor: '#0F2C59', textColor: '#ffffff', type: 'Digital Bank' },
  { id: 'seabank', name: 'SeaBank PH', institution: 'SeaBank', badge: 'SB', bgColor: '#FF5722', textColor: '#ffffff', type: 'Digital Bank' },
  { id: 'uno', name: 'UNO Digital Bank', institution: 'UNO Digital Bank', badge: 'UNO', bgColor: '#2C3E50', textColor: '#ffffff', type: 'Digital Bank' },
  { id: 'tonik', name: 'Tonik Digital Bank', institution: 'Tonik', badge: 'TNK', bgColor: '#FF3366', textColor: '#ffffff', type: 'Digital Bank' },
  { id: 'komo', name: 'Komo (by EastWest)', institution: 'Komo', badge: 'KOM', bgColor: '#581845', textColor: '#ffffff', type: 'Digital Bank' },
  { id: 'diskartech', name: 'DiskarTech (by RCBC)', institution: 'DiskarTech', badge: 'DSK', bgColor: '#1A5276', textColor: '#ffffff', type: 'Digital Bank' },
  // E-wallets
  { id: 'gcash', name: 'GCash', institution: 'GCash', badge: 'GC', bgColor: '#1F7AFF', textColor: '#ffffff', type: 'E-Wallet' },
  { id: 'paymaya', name: 'Maya Wallet', institution: 'Maya', badge: 'MY', bgColor: '#00FF5F', textColor: '#000000', type: 'E-Wallet' },
  { id: 'grabpay', name: 'GrabPay', institution: 'GrabPay', badge: 'GP', bgColor: '#00B159', textColor: '#ffffff', type: 'E-Wallet' },
  { id: 'coins', name: 'Coins.ph', institution: 'Coins.ph', badge: 'Cph', bgColor: '#FFD700', textColor: '#000000', type: 'E-Wallet' },
  { id: 'shopeepay', name: 'ShopeePay', institution: 'ShopeePay', badge: 'SPy', bgColor: '#EE4D2D', textColor: '#ffffff', type: 'E-Wallet' },
  { id: 'palawanpay', name: 'PalawanPay', institution: 'PalawanPay', badge: 'PAL', bgColor: '#1E824C', textColor: '#ffffff', type: 'E-Wallet' },
  // Neutral
  { id: 'cash', name: 'Physical Cash', institution: 'Cash', badge: 'CSH', bgColor: '#022E1A', textColor: '#ffffff', type: 'Cash' },
  { id: 'other', name: 'Other Institution', institution: 'Other', badge: 'OTH', bgColor: '#7E7576', textColor: '#ffffff', type: 'Other' },
];
export const CATEGORY_ICONS: Record<string, string> = {
  'Housing': 'home',
  'Food & Dining': 'restaurant',
  'Transport': 'flight',
  'Transportation': 'flight',
  'Entertainment': 'movie',
  'Shopping': 'shopping_bag',
  'Utilities & Bills': 'payments',
  'Salary': 'account_balance',
  'Investment': 'trending_up',
  'Other': 'category',
  'Miscellaneous': 'category',
};
