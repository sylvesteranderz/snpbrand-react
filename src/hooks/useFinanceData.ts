import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  FinancialTransaction,
  CashFlowForecast,
  MonthlyPL,
  MonthlyKPIs,
  RevenueHistoryRow,
} from '@/types/finance';

const FINANCE_UPDATE_EVENT = 'snp-finance-data-updated';

export const notifyFinanceUpdate = () => {
  window.dispatchEvent(new CustomEvent(FINANCE_UPDATE_EVENT));
};

export function useMonthlyPL(year: number, month: number) {
  const [data, setData] = useState<MonthlyPL | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_monthly_pl', {
          p_year: year,
          p_month: month,
        });

        if (rpcError) {
          throw rpcError;
        }

        if (active) {
          setData(rpcData as MonthlyPL);
        }
      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'Failed to fetch monthly P&L';
          setError(errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [year, month, refreshTrigger]);

  return { data, loading, error };
}

export function useMonthlyKPIs(year: number, month: number) {
  const [data, setData] = useState<MonthlyKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_monthly_kpis', {
          p_year: year,
          p_month: month,
        });

        if (rpcError) {
          throw rpcError;
        }

        if (active) {
          setData(rpcData as MonthlyKPIs);
        }
      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'Failed to fetch monthly KPIs';
          setError(errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [year, month, refreshTrigger]);

  return { data, loading, error };
}

export function useRevenueHistory(months: number = 4) {
  const [data, setData] = useState<RevenueHistoryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_revenue_cogs_history', {
          p_months: months,
        });

        if (rpcError) {
          throw rpcError;
        }

        if (active) {
          setData((rpcData as RevenueHistoryRow[]) || []);
        }
      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'Failed to fetch revenue history';
          setError(errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [months, refreshTrigger]);

  return { data, loading, error };
}

export function useCashFlowForecast() {
  const [data, setData] = useState<CashFlowForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: queryData, error: queryError } = await supabase
        .from('cash_flow_forecast')
        .select('*')
        .order('week_start', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setData((queryData as CashFlowForecast[]) || []);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch cash flow forecast';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast, refreshTrigger]);

  return { data, loading, error, refetch: fetchForecast };
}

export function useTransactions(year: number, month: number) {
  const [data, setData] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const pad = (num: number) => String(num).padStart(2, '0');
    const startDate = `${year}-${pad(month)}-01`;
    // Find the last day of the month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${pad(month)}-${pad(lastDay)}`;

    try {
      const { data: queryData, error: queryError } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setData((queryData as FinancialTransaction[]) || []);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  return { data, loading, error, refetch: fetchTransactions };
}

export function useAddTransaction() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addTransaction = useCallback(
    async (transaction: Omit<FinancialTransaction, 'id' | 'created_at'>) => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return { success: false, error: 'Supabase is not configured.' };
      }
      setLoading(true);
      setError(null);
      try {
        const { error: insertError } = await supabase
          .from('financial_transactions')
          .insert([transaction]);

        if (insertError) {
          throw insertError;
        }

        notifyFinanceUpdate();
        return { success: true, error: null };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to add transaction';
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { addTransaction, loading, error };
}

export function useUpsertForecastWeek() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const upsertForecastWeek = useCallback(
    async (forecast: {
      week_start: string;
      projected_inflows: number;
      projected_outflows: number;
      outflow_breakdown: Array<{ label: string; amount: number }> | null;
      notes: string | null;
    }) => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return { success: false, error: 'Supabase is not configured.' };
      }
      setLoading(true);
      setError(null);
      try {
        const { error: rpcError } = await supabase.rpc('upsert_cash_flow_week', {
          p_week_start: forecast.week_start,
          p_inflows: forecast.projected_inflows,
          p_outflows: forecast.projected_outflows,
          p_breakdown: forecast.outflow_breakdown,
          p_notes: forecast.notes,
        });

        if (rpcError) {
          throw rpcError;
        }

        notifyFinanceUpdate();
        return { success: true, error: null };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to update forecast';
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { upsertForecastWeek, loading, error };
}

// --------------------------------------------------
// Redesigned Finance Tab Hooks
// --------------------------------------------------

export type Period = 'today' | 'week' | 'month';

export interface FinanceStats {
  revenue: number;
  cog: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  grossMarginPct: number | null;
  orderCount: number;
  avgOrderValue: number | null;
  expensesList: Array<{
    id: string;
    amount: number;
    label: string;
    date: string;
    created_at: string;
  }>;
}

export interface NewExpense {
  amount: number;
  label: string;
  date: string; // ISO date string, e.g. "2026-06-19"
}

const getPeriodDates = (period: Period) => {
  const now = new Date();
  
  // Initialize start and end in UTC timezone
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  if (period === 'today') {
    end.setUTCDate(end.getUTCDate() + 1);
  } else if (period === 'week') {
    // UTC day of week: 0 = Sunday, 1 = Monday, etc.
    const day = now.getUTCDay();
    // Monday of current week
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
    start.setUTCDate(diff);
    end.setUTCDate(diff + 7);
  } else if (period === 'month') {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1);
    end.setUTCDate(1);
  }

  return { start, end };
};

const formatDateStr = (date: Date) => {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};


export function useFinanceStats(period: Period) {
  const [data, setData] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const handler = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener(FINANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(FINANCE_UPDATE_EVENT, handler);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const { start, end } = getPeriodDates(period);

      try {
        // Query 1: Fetch active orders in period
        const ordersPromise = supabase
          .from('orders')
          .select('id, total_amount, items, created_at, status')
          .in('status', ['confirmed', 'delivered'])
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString());

        // Query 2: Fetch expenses in period
        const expensesPromise = supabase
          .from('expenses')
          .select('*')
          .gte('date', formatDateStr(start))
          .lt('date', formatDateStr(end))
          .order('date', { ascending: false });

        // Run both queries in parallel
        const [ordersRes, expensesRes] = await Promise.all([ordersPromise, expensesPromise]);

        if (ordersRes.error) throw ordersRes.error;
        
        let fetchedExpenses: any[] = [];
        if (expensesRes.error) {
          // If expenses table doesn't exist yet, log warning and continue with empty array
          if (expensesRes.error.code === '42P01' || expensesRes.error.message.includes('relation "expenses" does not exist')) {
            console.warn('Expenses table does not exist yet.');
          } else {
            throw expensesRes.error;
          }
        } else {
          fetchedExpenses = expensesRes.data || [];
        }

        const fetchedOrders = ordersRes.data || [];

        // Compute Revenue and order stats
        const revenue = fetchedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const orderCount = fetchedOrders.length;
        const avgOrderValue = orderCount > 0 ? revenue / orderCount : null;

        // Fetch unit costs for products in parallel to prevent N+1 queries
        let cog = 0;
        if (orderCount > 0) {
          const productIds = Array.from(
            new Set(
              fetchedOrders
                .flatMap((o) => (o.items || []).map((item: any) => item.product_id))
                .filter(Boolean)
            )
          );

          if (productIds.length > 0) {
            const { data: txData, error: txError } = await supabase
              .from('inventory_transactions')
              .select('product_id, unit_cost, created_at')
              .eq('type', 'restock')
              .in('product_id', productIds)
              .order('created_at', { ascending: false });

            if (txError) throw txError;

            // Map and sum COG (Option A: latest restock cost before order created_at)
            fetchedOrders.forEach((o) => {
              const orderTime = new Date(o.created_at).getTime();
              const items = o.items || [];
              items.forEach((item: any) => {
                const qty = item.quantity || 0;
                const prodId = item.product_id;
                if (!prodId) return;

                const matchingTx = txData?.find(
                  (tx) => tx.product_id === prodId && new Date(tx.created_at).getTime() <= orderTime
                );

                const unitCost = matchingTx?.unit_cost || 0;
                cog += qty * unitCost;
              });
            });
          }
        }

        const totalExpenses = fetchedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const grossProfit = revenue - cog;
        const netProfit = grossProfit - totalExpenses;
        const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : null;

        if (active) {
          setData({
            revenue,
            cog,
            grossProfit,
            expenses: totalExpenses,
            netProfit,
            grossMarginPct,
            orderCount,
            avgOrderValue,
            expensesList: fetchedExpenses,
          });
        }
      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'Failed to fetch finance statistics';
          setError(errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [period, refreshTrigger]);

  return { data, loading, error, refetch: () => setRefreshTrigger((prev) => prev + 1) };
}

export function useAddExpense() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addExpense = useCallback(async (expense: NewExpense) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert([expense]);

      if (insertError) {
        throw insertError;
      }

      notifyFinanceUpdate();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to add expense';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addExpense, loading, error };
}

