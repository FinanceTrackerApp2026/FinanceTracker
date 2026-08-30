import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  FileText,
  Gauge,
  HandCoins,
  Landmark,
  LockKeyhole,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { LoanFormDialog } from '../components/loans/LoanFormDialog';
import { PaymentFormDialog } from '../components/payments/PaymentFormDialog';
import { DELETE_PAYMENT_MUTATION } from '../graphql/mutations/loans';
import {
  LOAN_LEDGER_QUERY,
  LOAN_QUERY,
  LOAN_SUMMARY_QUERY,
  PAYMENTS_BY_LOAN_QUERY,
} from '../graphql/queries/loans';
import type {
  DeletePaymentMutation,
  DeletePaymentVariables,
  Loan,
  LoanLedgerQuery,
  LoanLedgerVariables,
  LoanQuery,
  LoanQueryVariables,
  LoanSummaryQuery,
  LoanSummaryVariables,
  Payment,
  PaymentsByLoanQuery,
  PaymentsByLoanVariables,
} from '../types/loan';
import { formatCurrency, formatDateOnly } from '../utils/formatters';

interface LoanDetailItemProps {
  label: string;
  value: string;
  icon: typeof Percent;
}

function LoanDetailItem({ label, value, icon: Icon }: LoanDetailItemProps) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div>
        <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
          {value || 'Not available'}
        </dd>
      </div>
    </div>
  );
}

function LoanSummarySkeleton() {
  return (
    <div
      className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-24 rounded-2xl bg-slate-200/70 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

export function LoanDetailsPage() {
  const { loanId } = useParams();
  const hasValidId = Boolean(loanId && /^\d+$/.test(loanId));
  const [isEditing, setIsEditing] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    LoanQuery,
    LoanQueryVariables
  >(LOAN_QUERY, {
    variables: { id: loanId ?? '' },
    skip: !hasValidId,
  });
  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
  } = useQuery<
    LoanSummaryQuery,
    LoanSummaryVariables
  >(LOAN_SUMMARY_QUERY, {
    variables: { id: loanId ?? '' },
    skip: !hasValidId,
  });
  const {
    data: ledgerData,
    loading: ledgerLoading,
    error: ledgerError,
  } = useQuery<
    LoanLedgerQuery,
    LoanLedgerVariables
  >(LOAN_LEDGER_QUERY, {
    variables: { id: loanId ?? '' },
    skip: !hasValidId,
  });
  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery<
    PaymentsByLoanQuery,
    PaymentsByLoanVariables
  >(PAYMENTS_BY_LOAN_QUERY, {
    variables: { loanId: Number(loanId ?? 0) },
    skip: !hasValidId,
  });
  const [deletePayment, deletePaymentState] = useMutation<
    DeletePaymentMutation,
    DeletePaymentVariables
  >(DELETE_PAYMENT_MUTATION);
  const [isPaymentCreateOpen, setIsPaymentCreateOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );
  const loan = data?.loan;
  const summary = summaryData?.loanSummary;
  const ledgerEntries = ledgerData?.loanLedger ?? [];
  const payments = paymentsData?.paymentsByLoan ?? [];

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl animate-pulse py-6 sm:py-8">
        <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
          <div className="h-72 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
        </div>
        <div className="mt-6 h-80 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
        <span className="sr-only">Loading loan details…</span>
      </section>
    );
  }

  if (!hasValidId || error || !loan) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center py-8">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#111815]">
          <TriangleAlert
            aria-hidden="true"
            className="mx-auto size-8 text-rose-500"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            Loan not available
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The loan may not exist, or the finance server could not be reached.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/loans"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Back to loans
            </Link>
            {hasValidId && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const isLent = loan.loanType === 'LEND';
  const DirectionIcon = isLent ? ArrowUpRight : ArrowDownLeft;

  const handleDeletePayment = async (payment: Payment) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this payment?',
      )
    ) {
      return;
    }

    setDeletingPaymentId(payment.id);
    try {
      const result = await deletePayment({
        variables: { id: payment.id },
        refetchQueries: [
          {
            query: PAYMENTS_BY_LOAN_QUERY,
            variables: { loanId: Number(loanId) },
          },
          { query: LOAN_LEDGER_QUERY, variables: { id: loanId } },
          { query: LOAN_SUMMARY_QUERY, variables: { id: loanId } },
          { query: LOAN_QUERY, variables: { id: loanId } },
        ],
        awaitRefetchQueries: true,
      });

      if (result.data?.deletePayment) await refetchPayments();
    } finally {
      setDeletingPaymentId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 py-6 sm:py-8">
      <Link
        to="/loans"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to loans
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-[#0d4f49] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-72 rounded-full bg-teal-300/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-100 ring-1 ring-white/15">
            <DirectionIcon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-teal-100/75">
              {loan.contactCode} · {loan.contactName}
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {loan.loanReference}
            </h2>
            <p className="mt-5 text-sm text-teal-100/70">Principal amount</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              {formatCurrency(loan.principalAmount)}
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-stretch gap-3 sm:items-end">
            <span className="self-start rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15 sm:self-end">
              {loan.status || 'Status unavailable'}
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit loan
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
              Loan information
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Core terms and agreement details
            </h3>
          </div>
          <Link
            to={`/contacts/${loan.contactId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
          >
            View contact
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <dl className="grid gap-6 sm:grid-cols-2">
            <LoanDetailItem
              label="Contact code"
              value={loan.contactCode}
              icon={BriefcaseBusiness}
            />
            <LoanDetailItem
              label="Contact name"
              value={loan.contactName}
              icon={BriefcaseBusiness}
            />
            <LoanDetailItem
              label="Loan reference"
              value={loan.loanReference}
              icon={FileText}
            />
            <LoanDetailItem
              label="Loan type"
              value={loan.loanType}
              icon={loan.loanType === 'LEND' ? ArrowUpRight : ArrowDownLeft}
            />
            <LoanDetailItem
              label="Interest type"
              value={loan.interestType}
              icon={Landmark}
            />
            <LoanDetailItem
              label="Principal amount"
              value={formatCurrency(loan.principalAmount)}
              icon={Gauge}
            />
            <LoanDetailItem
              label="Outstanding principal"
              value={formatCurrency(loan.outstandingPrincipal)}
              icon={Gauge}
            />
            <LoanDetailItem
              label="Interest rate"
              value={`${loan.interestRate}%`}
              icon={Percent}
            />
            <LoanDetailItem
              label="Interest frequency"
              value={loan.interestFrequency}
              icon={CalendarClock}
            />
            <LoanDetailItem
              label="Loan date"
              value={loan.loanDate ? formatDateOnly(loan.loanDate) : 'Not available'}
              icon={CalendarDays}
            />
            <LoanDetailItem
              label="Due day"
              value={loan.dueDay ? `Day ${loan.dueDay}` : 'Not available'}
              icon={CalendarDays}
            />
            <LoanDetailItem
              label="Loan tenure"
              value={
                loan.loanTenure && loan.tenureUnit
                  ? `${loan.loanTenure} ${loan.tenureUnit.toLowerCase()}`
                  : 'Not available'
              }
              icon={HandCoins}
            />
            <LoanDetailItem
              label="Tenure unit"
              value={loan.tenureUnit}
              icon={HandCoins}
            />
            <LoanDetailItem
              label="Has security"
              value={loan.hasSecurity ? 'Yes' : 'No'}
              icon={loan.hasSecurity ? ShieldCheck : LockKeyhole}
            />
            <LoanDetailItem label="Status" value={loan.status} icon={CalendarClock} />
            <LoanDetailItem
              label="Notes"
              value={loan.notes || 'Not available'}
              icon={FileText}
            />
          </dl>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
              Loan summary
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Performance snapshot
            </h3>
          </div>
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
            {summary?.status || loan.status || 'Status unavailable'}
          </span>
        </div>

        {summaryLoading ? (
          <LoanSummarySkeleton />
        ) : summaryError ? (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
            {summaryError.message}
          </p>
        ) : summary ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Principal paid
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {formatCurrency(summary.principalPaid)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Interest paid
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {formatCurrency(summary.interestPaid)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Outstanding principal
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {formatCurrency(summary.outstanding)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Current status
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                {summary.status}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Interest accrued</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.interestAccrued)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding interest</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.outstandingInterest)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total outstanding</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{formatCurrency(summary.totalOutstanding)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly payment</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{summary.monthlyPayment ? formatCurrency(summary.monthlyPayment) : 'Not applicable'}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Summary data is not available for this loan yet.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
              Payments
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Payment records
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsPaymentCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add Payment
          </button>
        </div>

        {paymentsLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-14 rounded-2xl bg-slate-200/70 dark:bg-white/5"
              />
            ))}
          </div>
        ) : paymentsError ? (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
            {paymentsError.message}
          </p>
        ) : payments.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
                  <thead className="bg-slate-50/80 text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Payment ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-[#111815]">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                          {payment.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {formatDateOnly(payment.paymentDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {payment.paymentType || '—'}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-900 dark:text-white">
                          {formatCurrency(payment.paymentAmount)}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {payment.paymentMethod || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {payment.transactionReference || '—'}
                        </td>
                        <td className="max-w-56 px-4 py-3 text-slate-700 dark:text-slate-300">
                          <span className="line-clamp-2">{payment.notes || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingPayment(payment)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                            >
                              <Pencil aria-hidden="true" className="size-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeletePayment(payment)}
                              disabled={deletingPaymentId === payment.id}
                              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 dark:border-rose-400/20 dark:text-rose-300 dark:hover:bg-rose-400/10"
                            >
                              <Trash2 aria-hidden="true" className="size-3.5" />
                              {deletingPaymentId === payment.id
                                ? 'Deleting'
                                : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No payments recorded yet.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Loan ledger
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Balance movement
          </h3>
        </div>
        {ledgerLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-14 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
            ))}
          </div>
        ) : ledgerError ? (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
            {ledgerError.message}
          </p>
        ) : ledgerEntries.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No ledger entries recorded yet.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
                <thead className="bg-slate-50/80 text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Payment date</th>
                    <th className="px-4 py-3 font-medium">Payment amount</th>
                    <th className="px-4 py-3 font-medium">Principal paid</th>
                    <th className="px-4 py-3 font-medium">Interest paid</th>
                    <th className="px-4 py-3 font-medium">Outstanding</th>
                    <th className="px-4 py-3 font-medium">Interest due</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {ledgerEntries.map((entry, index) => (
                    <tr key={`${entry.paymentDate}-${entry.description}-${index}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatDateOnly(entry.paymentDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">{formatCurrency(entry.paymentAmount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatCurrency(entry.principalPaid)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatCurrency(entry.interestPaid)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatCurrency(entry.outstanding)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatCurrency(entry.outstandingInterest)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{entry.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {deletePaymentState.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
          {deletePaymentState.error.message}
        </p>
      )}

      {isEditing && (
        <LoanFormDialog
          mode="edit"
          loan={loan as Loan}
          onClose={() => setIsEditing(false)}
          onSaved={() => void refetch()}
        />
      )}

      {isPaymentCreateOpen && (
        <PaymentFormDialog
          mode="create"
          loanId={Number(loan.id)}
          onClose={() => setIsPaymentCreateOpen(false)}
        />
      )}

      {editingPayment && (
        <PaymentFormDialog
          mode="edit"
          loanId={Number(loan.id)}
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
        />
      )}
    </section>
  );
}
