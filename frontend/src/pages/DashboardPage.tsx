import { useQuery } from '@apollo/client/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  HandCoins,
  Landmark,
  PiggyBank,
  RefreshCw,
  Scale,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';

import { MetricCard } from '../components/dashboard/MetricCard';
import { DASHBOARD_SUMMARY_QUERY } from '../graphql/queries/dashboardSummary';
import type { DashboardSummaryQuery } from '../types/dashboard';
import { formatCurrency, formatNumber } from '../utils/formatters';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading dashboard">
      <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-44 rounded-2xl bg-slate-200/70 dark:bg-white/5"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-40 rounded-2xl bg-slate-200/70 dark:bg-white/5"
            key={index}
          />
        ))}
      </div>
      <span className="sr-only">Loading financial summary…</span>
    </div>
  );
}

interface DashboardErrorProps {
  onRetry: () => void;
}

function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div
      className="flex min-h-[calc(100vh-10rem)] items-center justify-center"
      role="alert"
    >
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-300/15 dark:bg-[#111815]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
          <TriangleAlert aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
          Unable to load your dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Check that the finance server is running, then try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, loading, error, refetch } = useQuery<DashboardSummaryQuery>(
    DASHBOARD_SUMMARY_QUERY,
  );

  if (loading && !data) {
    return (
      <section className="mx-auto max-w-7xl py-6 sm:py-8">
        <DashboardSkeleton />
      </section>
    );
  }

  if (error || !data) {
    return <DashboardError onRetry={() => void refetch()} />;
  }

  const summary = data.dashboardSummary;
  const totalLoans = summary.activeLoans + summary.closedLoans;
  const netInterestTone =
    summary.netInterest > 0
      ? 'text-emerald-300'
      : summary.netInterest < 0
        ? 'text-rose-300'
        : 'text-white';

  return (
    <section
      className="mx-auto max-w-7xl space-y-8 py-6 sm:py-8"
      aria-labelledby="dashboard-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Financial overview
          </p>
          <h2
            id="dashboard-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white"
          >
            Your money at a glance
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Live summary across all loans and payments
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-[#0d4f49] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full bg-teal-300/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-cyan-200/10 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
              <Scale aria-hidden="true" className="size-4" />
              Net worth
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(summary.netWorth)}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-teal-100/75">
              Your overall financial position after receivables, payables, and
              interest.
            </p>
          </div>
          <div className="border-t border-white/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-sm text-teal-100/70">Net assets</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(summary.netAssets)}
            </p>
          </div>
          <div className="border-t border-white/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-sm text-teal-100/70">Net interest</p>
            <p className={`mt-2 text-2xl font-semibold ${netInterestTone}`}>
              {formatCurrency(summary.netInterest)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          Lending and borrowing
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Lent"
            value={formatCurrency(summary.totalLent)}
            helper="Principal issued across lending activity"
            icon={ArrowUpRight}
            tone="positive"
          />
          <MetricCard
            label="Total Borrowed"
            value={formatCurrency(summary.totalBorrowed)}
            helper="Principal received across borrowing activity"
            icon={ArrowDownLeft}
            tone="negative"
          />
          <MetricCard
            label="Outstanding To Receive"
            value={formatCurrency(summary.outstandingToReceive)}
            helper="Remaining amount expected from borrowers"
            icon={PiggyBank}
            tone="positive"
          />
          <MetricCard
            label="Outstanding To Pay"
            value={formatCurrency(summary.outstandingToPay)}
            helper="Remaining amount owed to lenders"
            icon={Landmark}
            tone="negative"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Interest performance
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Interest Earned (Cash Received)"
              value={formatCurrency(summary.interestEarned)}
              helper="Income from lending"
              icon={TrendingUp}
              tone="positive"
            />
            <MetricCard
              label="Interest Paid (Cash)"
              value={formatCurrency(summary.interestPaid)}
              helper="Cost of borrowing"
              icon={TrendingDown}
              tone="negative"
            />
            <MetricCard
              label="Net Interest"
              value={formatCurrency(summary.netInterest)}
              helper="Earned less paid"
              icon={CircleDollarSign}
              tone={summary.netInterest >= 0 ? 'positive' : 'negative'}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Loan portfolio
          </h3>
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-white/10">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total loans
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatNumber(totalLoans)}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                <HandCoins aria-hidden="true" className="size-5" />
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Active Loans
                </dt>
                <dd className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {formatNumber(summary.activeLoans)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <BadgeCheck
                    aria-hidden="true"
                    className="size-3.5 text-emerald-600"
                  />
                  Closed Loans
                </dt>
                <dd className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {formatNumber(summary.closedLoans)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
