export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'slippers_sales'
  | 'shirts_sales'
  | 'delivery_collected'
  | 'inventory_purchase'
  | 'inbound_shipping'
  | 'fulfillment'
  | 'packaging'
  | 'advertising'
  | 'technology'
  | 'paystack_fees'
  | 'owners_draw'
  | 'miscellaneous';

export interface FinancialTransaction {
  id: string;
  created_at: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  source: string | null;
  notes: string | null;
}

export interface OutflowBreakdownItem {
  label: string;
  amount: number;
}

export interface CashFlowForecast {
  id: string;
  week_start: string; // YYYY-MM-DD
  projected_inflows: number;
  projected_outflows: number;
  outflow_breakdown: OutflowBreakdownItem[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPL {
  total_revenue: number;
  slippers_revenue: number;
  shirts_revenue: number;
  other_revenue: number;
  total_cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  fulfillment_cost: number;
  advertising_cost: number;
  packaging_cost: number;
  paystack_fees: number;
  technology_cost: number;
  other_opex: number;
  total_opex: number;
  net_profit: number;
  net_margin_pct: number;
  owners_draw: number;
}

export interface MonthlyKPIs {
  current_month_revenue: number;
  prev_month_revenue: number;
  revenue_change_pct: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  transaction_count: number;
  total_expenses: number;
}

export interface RevenueHistoryRow {
  month_label: string;
  year: number;
  revenue: number;
  cogs: number;
}
