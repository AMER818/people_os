import { Wallet, RefreshCw, Scale, AlertTriangle } from 'lucide-react';

export const INITIAL_LEDGER = [];

export const CHART_DATA = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
];

export const PAYROLL_STATS = [
  { label: 'Cycle Liability', val: '$0.00', icon: Wallet, color: 'primary' },
  { label: 'Disbursement Sync', val: '0%', icon: RefreshCw, color: 'muted' },
  { label: 'Tax Reserves', val: '$0.00', icon: Scale, color: 'muted' },
  { label: 'Neural Anomaly', val: '0 Nodes', icon: AlertTriangle, color: 'success' },
];
