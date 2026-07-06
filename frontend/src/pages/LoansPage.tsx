import { useQuery } from '@apollo/client/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  HandCoins,
  Pencil,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { LoanFormDialog } from '../components/loans/LoanFormDialog';
import { LOANS_QUERY } from '../graphql/queries/loans';
import type { Loan, LoansQuery } from '../types/loan';
import { formatCurrency, formatDateOnly } from '../utils/formatters';
import { loanTypeLabel } from '../utils/loans';

function LoansSkeleton() {
  return (
    <div
      className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading loans"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-64 rounded-2xl bg-slate-200/70 dark:bg-white/5"
        />
      ))}
      <span className="sr-only">Loading loans…</span>
    </div>
  );
}

export function LoansPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const { data, loading, error, refetch } = useQuery<LoansQuery>(LOANS_QUERY);
  const loans = data?.loans ?? [];

  return (
    <section
      className="mx-auto max-w-7xl space-y-6 py-6 sm:py-8"
      aria-labelledby="loans-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Loan portfolio
          </p>
          <h2
            id="loans-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white"
          >
            Loans
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review lending and borrowing agreements in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Plus aria-hidden="true" className="size-4" />
          Create loan
        </button>
      </div>

      {!loading && !error && loans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total loans
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {loans.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total principal
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatCurrency(
                loans.reduce((total, loan) => total + loan.principalAmount, 0),
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Outstanding principal
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {formatCurrency(
                loans.reduce(
                  (total, loan) => total + loan.outstandingPrincipal,
                  0,
                ),
              )}
            </p>
          </div>
        </div>
      )}

      {loading && !data && <LoansSkeleton />}

      {error && (
        <div
          className="rounded-3xl border border-rose-200 bg-white px-6 py-16 text-center dark:border-rose-300/15 dark:bg-[#111815]"
          role="alert"
        >
          <HandCoins
            aria-hidden="true"
            className="mx-auto size-8 text-rose-500"
          />
          <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
            Unable to load loans
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Check that the finance server is running.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && loans.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.025]">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <HandCoins aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
            No loans yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first loan agreement to get started.
          </p>
        </div>
      )}

      {!error && loans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loans.map((loan) => {
            const isLent = loan.loanType === 'LEND';
            const DirectionIcon = isLent ? ArrowUpRight : ArrowDownLeft;

            return (
              <article
                key={loan.id}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md dark:border-white/10 dark:bg-[#111815] dark:hover:border-teal-300/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={[
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        isLent
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
                      ].join(' ')}
                    >
                      <DirectionIcon
                        aria-hidden="true"
                        className="size-[1.125rem]"
                      />
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/loans/${loan.id}`}
                        className="after:absolute after:inset-0 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                      >
                        <span className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {loan.loanReference}
                        </span>
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {loanTypeLabel(loan.loanType)} · Contact #
                        {loan.contactId}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingLoan(loan)}
                    className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-white"
                    aria-label={`Edit ${loan.loanReference}`}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Principal amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {formatCurrency(loan.principalAmount)}
                  </p>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-white/10">
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Outstanding
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(loan.outstandingPrincipal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Interest
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {loan.interestRate}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {loan.loanDate
                      ? formatDateOnly(loan.loanDate)
                      : 'Date unavailable'}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                    View
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isCreateOpen && (
        <LoanFormDialog
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSaved={(loan) => void navigate(`/loans/${loan.id}`)}
        />
      )}
      {editingLoan && (
        <LoanFormDialog
          mode="edit"
          loan={editingLoan}
          onClose={() => setEditingLoan(null)}
        />
      )}
    </section>
  );
}
