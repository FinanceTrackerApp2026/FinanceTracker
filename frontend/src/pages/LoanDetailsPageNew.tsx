import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PaymentFormDialog } from '../components/payments/PaymentFormDialog';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { LoanFinancialTooltip } from '../components/loans/LoanFinancialTooltip';
import {
  CHANGE_LOAN_STATUS_MUTATION,
  DELETE_PAYMENT_MUTATION,
} from '../graphql/mutations/loans';
import { DASHBOARD_SUMMARY_QUERY } from '../graphql/queries/dashboardSummary';
import {
  LOAN_LEDGER_QUERY,
  LOAN_QUERY,
  LOAN_SUMMARY_QUERY,
  PAYMENTS_BY_LOAN_QUERY,
} from '../graphql/queries/loans';
import type {
  DeletePaymentMutation,
  DeletePaymentVariables,
  LoanLedgerQuery,
  LoanLedgerVariables,
  LedgerEntry,
  LoanQuery,
  LoanQueryVariables,
  Payment,
  PaymentsByLoanQuery,
  PaymentsByLoanVariables,
  LoanSummaryQuery,
  LoanSummaryVariables,
} from '../types/loan';
import { formatCurrency, formatDateOnly } from '../utils/formatters';

function getLoanTypeLabel(loanType: string, contactName: string): string {
  if (loanType === 'LEND') {
    return `Lent to ${contactName}`;
  }
  return `Borrowed from ${contactName}`;
}

function getInterestTypeLabel(interestType: string): string {
  const labels: Record<string, string> = {
    SIMPLE_INTEREST: 'Simple Interest',
    COMPOUND: 'Compound Interest',
    EMI: 'EMI (Fixed Monthly Payment)',
    INTEREST_ONLY: 'Interest Only',
  };
  return labels[interestType] || interestType;
}

interface FinancialOverviewCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className: string }>;
  isHighlight?: boolean;
}

function FinancialOverviewCard({
  label,
  value,
  icon: Icon,
  isHighlight,
}: FinancialOverviewCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        isHighlight
          ? 'border-teal-200 bg-teal-50 dark:border-teal-400/20 dark:bg-teal-500/10'
          : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#111815]'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 size-4 shrink-0 ${
            isHighlight ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400'
          }`}
        />
        <div className="min-w-0 flex-1">
          <LoanFinancialTooltip term={label}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
          </LoanFinancialTooltip>
          <p className="mt-2 truncate text-lg font-semibold text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface LoanPaymentCardProps {
  payment: Payment;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function LoanPaymentCard({
  payment,
  isEditing,
  onEdit,
  onDelete,
}: LoanPaymentCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111815]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {formatCurrency(payment.paymentAmount)}
            </p>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300">
              {payment.paymentType}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatDateOnly(payment.paymentDate)}
          </p>
          {payment.paymentMethod && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {payment.paymentMethod}
            </p>
          )}
          {payment.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
              {payment.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={isEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/20 dark:text-rose-300 dark:hover:bg-rose-400/10"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface LoanLedgerTimelineProps {
  entries: LedgerEntry[];
  loanType: string;
}

function LoanLedgerTimeline({ entries, loanType }: LoanLedgerTimelineProps) {
  const isLend = loanType === 'LEND';

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={idx} className="relative flex gap-4 pb-4">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div className="size-3 rounded-full border-2 border-teal-600 bg-white dark:bg-[#111815]" />
            {idx < entries.length - 1 && (
              <div className="mt-1 h-8 w-0.5 bg-slate-200 dark:bg-white/10" />
            )}
          </div>

          {/* Entry content */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111815]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {entry.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateOnly(entry.paymentDate)}
                  </p>
                </div>
                {entry.paymentAmount > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(entry.paymentAmount)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                {entry.principalPaid > 0 && (
                  <div className="rounded bg-slate-50 p-2 dark:bg-white/5">
                    <p className="text-slate-500 dark:text-slate-400">
                      Principal Paid
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(entry.principalPaid)}
                    </p>
                  </div>
                )}
                {entry.interestPaid > 0 && (
                  <div className="rounded bg-slate-50 p-2 dark:bg-white/5">
                    <p className="text-slate-500 dark:text-slate-400">
                      Interest Paid
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(entry.interestPaid)}
                    </p>
                  </div>
                )}
                <div className="rounded bg-slate-50 p-2 dark:bg-white/5">
                  <p className="text-slate-500 dark:text-slate-400">
                    {isLend ? 'Still Owed' : 'Still to Receive'}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(entry.outstanding)}
                  </p>
                </div>
                {entry.outstandingInterest > 0 && (
                  <div className="rounded bg-slate-50 p-2 dark:bg-white/5">
                    <p className="text-slate-500 dark:text-slate-400">
                      Interest Outstanding
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(entry.outstandingInterest)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoanDetailsPage() {
  const { loanId } = useParams();
  const hasValidId = Boolean(loanId && /^\d+$/.test(loanId));

  const [isPaymentCreateOpen, setIsPaymentCreateOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    payment: Payment;
  } | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );
  const [isCloseConfirmationOpen, setIsCloseConfirmationOpen] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    LoanQuery,
    LoanQueryVariables
  >(LOAN_QUERY, {
    variables: { id: loanId ?? '' },
    skip: !hasValidId,
  });

  const { data: summaryData } = useQuery<
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
  } = useQuery<LoanLedgerQuery, LoanLedgerVariables>(LOAN_LEDGER_QUERY, {
    variables: { id: loanId ?? '' },
    skip: !hasValidId,
  });

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery<PaymentsByLoanQuery, PaymentsByLoanVariables>(
    PAYMENTS_BY_LOAN_QUERY,
    {
      variables: { loanId: Number(loanId ?? 0) },
      skip: !hasValidId,
    },
  );

  const [deletePayment] = useMutation<
    DeletePaymentMutation,
    DeletePaymentVariables
  >(DELETE_PAYMENT_MUTATION);
  const [changeLoanStatus, changeLoanStatusState] = useMutation(
    CHANGE_LOAN_STATUS_MUTATION,
  );

  const loan = data?.loan;
  const summary = summaryData?.loanSummary;
  const ledgerEntries = ledgerData?.loanLedger ?? [];
  const payments = paymentsData?.paymentsByLoan ?? [];

  const isLend = loan?.loanType === 'LEND';
  const isEMI = loan?.interestType === 'EMI';
  const isCompound = loan?.interestType === 'COMPOUND';
  const isInterestOnly = loan?.interestType === 'INTEREST_ONLY';

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl animate-pulse px-4 py-6 sm:py-8">
        <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
        <div className="mt-6 grid gap-6">
          <div className="h-40 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
          <div className="h-80 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
        </div>
        <span className="sr-only">Loading loan details…</span>
      </section>
    );
  }

  if (!hasValidId || error || !loan) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#111815]">
          <TriangleAlert
            aria-hidden="true"
            className="mx-auto size-8 text-rose-500"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            Loan not found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The loan may not exist or could not be loaded.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/loans"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Back to loans
            </Link>
            {hasValidId && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
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

  const handleDeletePayment = async (payment: Payment) => {
    setDeleteConfirmation({ payment });
  };

  const confirmDeletePayment = async () => {
    if (!deleteConfirmation) return;

    setDeletingPaymentId(deleteConfirmation.payment.id);
    try {
      const result = await deletePayment({
        variables: { id: deleteConfirmation.payment.id },
        refetchQueries: [
          {
            query: PAYMENTS_BY_LOAN_QUERY,
            variables: { loanId: Number(loanId) },
          },
          { query: LOAN_LEDGER_QUERY, variables: { id: loanId } },
          { query: LOAN_SUMMARY_QUERY, variables: { id: loanId } },
          { query: LOAN_QUERY, variables: { id: loanId } },
          DASHBOARD_SUMMARY_QUERY,
        ],
        awaitRefetchQueries: true,
      });

      if (result.data?.deletePayment) {
        await refetchPayments();
        setDeleteConfirmation(null);
      }
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const confirmCloseLoan = async () => {
    setCloseError(null);
    try {
      await changeLoanStatus({
        variables: { input: { id: Number(loanId), status: 'CLOSED' } },
        refetchQueries: [
          { query: LOAN_QUERY, variables: { id: loanId } },
          { query: LOAN_SUMMARY_QUERY, variables: { id: loanId } },
          DASHBOARD_SUMMARY_QUERY,
        ],
        awaitRefetchQueries: true,
      });
      setIsCloseConfirmationOpen(false);
    } catch {
      setCloseError(
        'This loan cannot be closed because there is still an outstanding balance.',
      );
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-0 sm:py-8">
      {/* Navigation */}
      <Link
        to="/loans"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to loans
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {isLend ? (
                <ArrowUpRight className="size-6 shrink-0 text-teal-200" />
              ) : (
                <ArrowDownLeft className="size-6 shrink-0 text-teal-200" />
              )}
              <div>
                <p className="text-sm font-medium text-teal-100">
                  {loan.contactCode}
                </p>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {getLoanTypeLabel(loan.loanType, loan.contactName)}
                </h1>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-teal-100">
                  Loan Reference
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {loan.loanReference}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-teal-100">
                  Original Amount
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(loan.principalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                summary?.status === 'CLOSED'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {summary?.status || loan.status}
            </span>
            <Link
              to={`/contacts/${loan.contactId}`}
              className="text-sm font-semibold text-teal-100 underline hover:text-white"
            >
              View contact →
            </Link>
            {summary?.status === 'ACTIVE' &&
              summary.totalOutstanding <= 0.009 && (
                <button
                  type="button"
                  onClick={() => setIsCloseConfirmationOpen(true)}
                  className="rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Close loan
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Loan Type & Terms Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#111815]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loan Type
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {isLend ? '📊 Lend' : '📖 Borrow'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Interest Type
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {getInterestTypeLabel(loan.interestType)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Interest Rate
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {loan.interestRate}% per annum
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loan Date
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {formatDateOnly(loan.loanDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-950 dark:text-white">
          Financial Overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLend ? (
            <>
              <FinancialOverviewCard
                label="Principal"
                value={formatCurrency(loan.principalAmount)}
                icon={DollarSign}
                isHighlight
              />
              <FinancialOverviewCard
                label="Principal Received"
                value={formatCurrency(summary?.principalPaid ?? 0)}
                icon={TrendingUp}
              />
              <FinancialOverviewCard
                label="Outstanding to Receive"
                value={formatCurrency(summary?.outstanding ?? 0)}
                icon={ArrowUpRight}
              />
              <FinancialOverviewCard
                label="Interest Earned (Cash)"
                value={formatCurrency(summary?.interestPaid ?? 0)}
                icon={TrendingUp}
              />
              <FinancialOverviewCard
                label="Interest Accrued"
                value={formatCurrency(summary?.interestAccrued ?? 0)}
                icon={TrendingDown}
              />
              <FinancialOverviewCard
                label="Outstanding Interest"
                value={formatCurrency(summary?.outstandingInterest ?? 0)}
                icon={ArrowUpRight}
              />
            </>
          ) : (
            <>
              <FinancialOverviewCard
                label="Principal"
                value={formatCurrency(loan.principalAmount)}
                icon={DollarSign}
                isHighlight
              />
              <FinancialOverviewCard
                label="Principal Paid"
                value={formatCurrency(summary?.principalPaid ?? 0)}
                icon={TrendingDown}
              />
              <FinancialOverviewCard
                label="Outstanding to Pay"
                value={formatCurrency(summary?.outstanding ?? 0)}
                icon={ArrowDownLeft}
              />
              <FinancialOverviewCard
                label="Interest Paid (Cash)"
                value={formatCurrency(summary?.interestPaid ?? 0)}
                icon={TrendingDown}
              />
              <FinancialOverviewCard
                label="Interest Accrued"
                value={formatCurrency(summary?.interestAccrued ?? 0)}
                icon={TrendingUp}
              />
              <FinancialOverviewCard
                label="Outstanding Interest"
                value={formatCurrency(summary?.outstandingInterest ?? 0)}
                icon={ArrowDownLeft}
              />
            </>
          )}
        </div>
      </div>

      {/* Interest-Type-Specific Sections */}
      {isEMI && summary && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-300">
            📊 EMI Details
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Monthly Payment
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {formatCurrency(summary.monthlyPayment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Tenure
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {loan.loanTenure} {loan.tenureUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Payments Completed
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {summary.paymentsCompleted}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Payments Remaining
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {summary.paymentsRemaining}
              </p>
            </div>
          </div>
          {summary.nextDueDate && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-100/50 px-3 py-2 dark:bg-emerald-400/10">
              <Calendar className="size-4" />
              <p className="text-sm text-emerald-900 dark:text-emerald-300">
                <strong>Next Due:</strong> {formatDateOnly(summary.nextDueDate)}
              </p>
            </div>
          )}
        </div>
      )}

      {isInterestOnly && summary && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-400/20 dark:bg-blue-500/10">
          <h3 className="text-base font-semibold text-blue-900 dark:text-blue-300">
            💎 Interest-Only Loan
          </h3>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-400">
            Payments reduce interest only. Principal remains outstanding until
            final payment.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-3 dark:bg-[#111815]">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Principal Outstanding
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.outstanding)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 dark:bg-[#111815]">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Interest Outstanding
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.outstandingInterest)}
              </p>
            </div>
          </div>
        </div>
      )}

      {isCompound && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-400/20 dark:bg-purple-500/10">
          <h3 className="text-base font-semibold text-purple-900 dark:text-purple-300">
            📈 Compound Interest
          </h3>
          <p className="mt-2 text-sm text-purple-800 dark:text-purple-400">
            Interest compounds {loan.interestFrequency?.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Payments Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Payment History
          </h2>
          {summary?.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => setIsPaymentCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" />
              Add Payment
            </button>
          )}
        </div>

        {paymentsLoading ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-slate-200/70 dark:bg-white/5"
              />
            ))}
          </div>
        ) : paymentsError ? (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
            {paymentsError.message}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
            <FileText className="mx-auto size-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              No payments recorded yet
            </p>
            {summary?.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => setIsPaymentCreateOpen(true)}
                className="mt-3 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Add the first payment →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <LoanPaymentCard
                key={payment.id}
                payment={payment}
                isEditing={editingPayment?.id === payment.id}
                onEdit={() => setEditingPayment(payment)}
                onDelete={() => handleDeletePayment(payment)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loan Ledger */}
      {ledgerEntries.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-950 dark:text-white">
            Financial Timeline
          </h2>
          {ledgerLoading ? (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-lg bg-slate-200/70 dark:bg-white/5"
                />
              ))}
            </div>
          ) : ledgerError ? (
            <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
              {ledgerError.message}
            </div>
          ) : (
            <LoanLedgerTimeline
              entries={ledgerEntries}
              loanType={loan.loanType}
            />
          )}
        </div>
      )}

      {/* Dialogs */}
      {isPaymentCreateOpen && (
        <PaymentFormDialog
          mode="create"
          loanId={Number(loanId)}
          interestType={loan.interestType}
          onClose={() => setIsPaymentCreateOpen(false)}
          onSaved={() => setIsPaymentCreateOpen(false)}
        />
      )}

      {editingPayment && (
        <PaymentFormDialog
          mode="edit"
          loanId={Number(loanId)}
          interestType={loan.interestType}
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSaved={() => setEditingPayment(null)}
        />
      )}

      {deleteConfirmation && (
        <ConfirmationDialog
          title="Delete payment?"
          message={`This will remove the ₹${deleteConfirmation.payment.paymentAmount} payment from the loan history.`}
          description="This action cannot be undone."
          confirmText="Delete"
          cancelText="Keep it"
          isDangerous
          isLoading={deletingPaymentId === deleteConfirmation.payment.id}
          onConfirm={confirmDeletePayment}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}

      {isCloseConfirmationOpen && (
        <ConfirmationDialog
          title="Close this loan?"
          message="Make sure the loan has been fully settled."
          description="Closed loans cannot be reopened."
          confirmText="Close loan"
          isLoading={changeLoanStatusState.loading}
          onConfirm={() => void confirmCloseLoan()}
          onCancel={() => setIsCloseConfirmationOpen(false)}
        />
      )}

      {closeError && (
        <p
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
          role="alert"
        >
          {closeError}
        </p>
      )}
    </section>
  );
}
