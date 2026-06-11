/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InstitutionType =
  | 'BDO'
  | 'BPI'
  | 'Metrobank'
  | 'Landbank'
  | 'PNB'
  | 'Security Bank'
  | 'UnionBank'
  | 'RCBC'
  | 'China Bank'
  | 'EastWest Bank'
  | 'PSBank'
  | 'Maybank Philippines'
  | 'CIMB Bank PH'
  | 'Maya Bank'
  | 'GoTyme'
  | 'SeaBank'
  | 'UNO Digital Bank'
  | 'Tonik'
  | 'GCash'
  | 'Maya' // PayMaya
  | 'GrabPay'
  | 'Coins.ph'
  | 'ShopeePay'
  | 'Cash'
  | 'Other';

export type AccountType =
  | 'Savings'
  | 'Checking'
  | 'E-Wallet'
  | 'Payroll'
  | 'Cash'
  | 'Credit Card'
  | 'Other';

export interface Account {
  id: string;
  name: string;
  institution: InstitutionType;
  type: AccountType;
  balance: number; // Stored in stored currency
  accountNumber: string; // Masked or partial e.g. "•••• 4821" or "0917 •••• 888"
  currency: 'PHP' | 'USD';
  isArchived: boolean;
  color?: string; // custom optional background color overrides
}

export type TransactionType = 'Expense' | 'Income' | 'Transfer';

export interface Transaction {
  id: string;
  amount: number; // positive number
  type: TransactionType;
  sourceAccountId: string; // For transfer, this is the fromAccountId
  destinationAccountId?: string; // ONLY for 'Transfer'
  category: string; // e.g. 'Housing', 'Food & Dining', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Salary', 'Investment', 'Other'
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note?: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface Budget {
  id: string;
  category: string; // 'Overall' or specific category name
  amount: number;
  period: 'Daily' | 'Weekly' | 'Monthly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface AppSettings {
  currency: 'PHP' | 'USD';
  startOfWeek: 'Monday' | 'Sunday';
  startOfMonth: number; // day index (1-28)
  darkMode: boolean;
  usdToPhpRate: number; // default e.g. 56.4
}
