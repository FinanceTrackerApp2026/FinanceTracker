import { useQuery } from '@apollo/client/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  HandCoins,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { LOANS_BY_CONTACT_QUERY } from '../../graphql/queries/loansByContact';
import type {
  LoansByContactQuery,
  LoansByContactVariables,
} from '../../types/loan';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';

interface ContactLoansProps {
  contactId: number;
}

function LoansSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="h-52 rounded-2xl bg-slate-200/70 dark:bg-white/5"
        />
      ))}
      <span className="sr-only">Loading loans…</span>
    </div>
  );
}

export function ContactLoans({ contactId }: ContactLoansProps) {
  const { data, loading, error, refetch } = useQuery<
    LoansByContactQuery,
    LoansByContactVariables
  >(LOANS_BY_CONTACT_QUERY, {
    variables: { contactId },
  });

  return (
    <div aria-labelledby="contact-loans-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3
            id="contact-loans-heading"
            className="text-lg font-semibold text-slate-950 dark:text-white"
          >
            Loans
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All loans associated with this contact.
          </p>
        </div>
        {!loading && !error && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {data?.loansByContact.length ?? 0}{' '}
            {(data?.loansByContact.length ?? 0) === 1 ? 'loan' : 'loans'}
          </span>
        )}
      </div>

      {loading && !data && <LoansSkeleton />}

      {error && (
        <div
          className="rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center dark:border-rose-300/15 dark:bg-[#111815]"
          role="alert"
        >
          <HandCoins
            aria-hidden="true"
            className="mx-auto size-7 text-rose-500"
          />
          <h4 className="mt-3 font-semibold text-slate-950 dark:text-white">
            Unable to load loans
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The contact is available, but their loans could not be retrieved.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data?.loansByContact.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-white/15 dark:bg-white/[0.025]">
          <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <HandCoins aria-hidden="true" className="size-5" />
          </span>
          <h4 className="mt-4 font-semibold text-slate-950 dark:text-white">
            No loans found
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This contact does not have any loans yet.
          </p>
        </div>
      )}

      {!error && data && data.loansByContact.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.loansByContact.map((loan) => {
            const isLent = loan.loanType.toUpperCase() === 'LEND';
            const DirectionIcon = isLent ? ArrowUpRight : ArrowDownLeft;

            return (
              <Link
                key={loan.id}
                to={`/loans/${loan.id}`}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition outline-none hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-white/10 dark:bg-[#111815] dark:hover:border-teal-300/20"
                aria-label={`View loan ${loan.loanReference}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
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
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {loan.loanReference}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {loan.loanType} · {loan.interestType} interest
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:text-slate-600"
                  />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 dark:border-white/10">
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Principal
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(loan.principalAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Outstanding
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(loan.outstandingPrincipal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Interest
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {loan.interestRate}% · {loan.interestFrequency}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 dark:text-slate-500">
                      Tenure
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {loan.loanTenure} {loan.tenureUnit.toLowerCase()}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {formatDateOnly(loan.loanDate)}
                  </span>
                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold',
                      loan.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
                    ].join(' ')}
                  >
                    {loan.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
