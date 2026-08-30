import { useQuery } from '@apollo/client/react';
import {
  ArrowLeft,
  CalendarDays,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { MONTHLY_CASH_FLOW_QUERY } from '../graphql/queries/monthlyCashFlow';
import type {
  MonthlyCashFlowQuery,
  MonthlyCashFlowVariables,
} from '../types/monthlyCashFlow';
import { formatCurrency } from '../utils/formatters';

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const yearOptions = Array.from(
  { length: 6 },
  (_, index) => currentYear - index,
);

function MonthlyCashFlowSkeleton() {
  return (
    <div
      className="animate-pulse space-y-6"
      aria-label="Loading monthly cash flow"
    >
      <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl bg-slate-200/70 dark:bg-white/5"
          />
        ))}
      </div>
      <div className="h-40 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
      <span className="sr-only">Loading monthly cash flow…</span>
    </div>
  );
}

export function MonthlyCashFlowPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const queryVariables = useMemo<MonthlyCashFlowVariables>(
    () => ({ year: selectedYear, month: selectedMonth }),
    [selectedMonth, selectedYear],
  );

  const { data, loading, error, refetch } = useQuery<
    MonthlyCashFlowQuery,
    MonthlyCashFlowVariables
  >(MONTHLY_CASH_FLOW_QUERY, {
    variables: queryVariables,
  });

  const summary = data?.monthlyCashFlow;

  if (loading && !data) {
    return (
      <section className="mx-auto max-w-7xl py-6 sm:py-8">
        <MonthlyCashFlowSkeleton />
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center py-8">
        <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-300/15 dark:bg-[#111815]">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
            <TriangleAlert aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
            Unable to load monthly cash flow
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Check that the finance server is running, then try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const selectedMonthLabel =
    monthOptions.find((month) => month.value === selectedMonth)?.label ??
    'Month';
  const netCashTone =
    summary.netCashFlow >= 0
      ? 'text-emerald-600 dark:text-emerald-300'
      : 'text-rose-600 dark:text-rose-300';

  return (
    <section
      className="mx-auto max-w-7xl space-y-6 py-6 sm:py-8"
      aria-labelledby="cash-flow-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to dashboard
          </Link>
          <h2
            id="cash-flow-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white"
          >
            Monthly cash flow
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review inflows, outflows, and net movement for the selected period.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="mb-1.5 block text-xs tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
              Month
            </span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm transition outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="mb-1.5 block text-xs tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
              Year
            </span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm transition outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/10"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-[#0d4f49] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full bg-teal-300/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-100/75">
              Cash flow for {selectedMonthLabel} {selectedYear}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(summary.netCashFlow)}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-100/75">
              A snapshot of cash movement after principal and interest receipts
              and payments.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-teal-50 backdrop-blur">
            <p className="font-medium">Net cash flow</p>
            <p className={`mt-1 text-lg font-semibold ${netCashTone}`}>
              {summary.netCashFlow >= 0 ? 'Positive' : 'Negative'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <TrendingUp
              aria-hidden="true"
              className="size-4 text-emerald-600 dark:text-emerald-300"
            />
            Total received
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.totalReceived)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <TrendingDown
              aria-hidden="true"
              className="size-4 text-rose-600 dark:text-rose-300"
            />
            Total paid
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <CalendarDays
              aria-hidden="true"
              className="size-4 text-teal-600 dark:text-teal-300"
            />
            Principal received
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.principalReceived)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <CalendarDays
              aria-hidden="true"
              className="size-4 text-amber-600 dark:text-amber-300"
            />
            Interest received
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.interestReceived)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Principal paid
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.principalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Interest paid
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
            {formatCurrency(summary.interestPaid)}
          </p>
        </div>
      </div>
    </section>
  );
}
