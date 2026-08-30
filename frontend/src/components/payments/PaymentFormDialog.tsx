import { useMutation } from '@apollo/client/react';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import {
  CREATE_PAYMENT_MUTATION,
  UPDATE_PAYMENT_MUTATION,
} from '../../graphql/mutations/loans';
import {
  LOAN_LEDGER_QUERY,
  LOAN_QUERY,
  LOAN_SUMMARY_QUERY,
  PAYMENTS_BY_LOAN_QUERY,
} from '../../graphql/queries/loans';
import { DASHBOARD_SUMMARY_QUERY } from '../../graphql/queries/dashboardSummary';
import type {
  CreatePaymentMutation,
  CreatePaymentVariables,
  NewPaymentInput,
  Payment,
  PaymentFormValues,
  UpdatePaymentMutation,
  UpdatePaymentVariables,
} from '../../types/loan';

interface PaymentFormDialogProps {
  mode: 'create' | 'edit';
  loanId: number;
  interestType?: string;
  payment?: Payment;
  onClose: () => void;
  onSaved?: () => void;
}

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/10 dark:disabled:bg-white/[0.025]';

function getPaymentFormValues(payment?: Payment): PaymentFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    paymentDate: payment?.paymentDate?.slice(0, 10) ?? today,
    paymentAmount: payment?.paymentAmount ? String(payment.paymentAmount) : '',
    paymentType: payment?.paymentType ?? 'BOTH',
    paymentMethod: payment?.paymentMethod ?? '',
    transactionReference: payment?.transactionReference ?? '',
    notes: payment?.notes ?? '',
  };
}

function toNewPaymentInput(
  values: PaymentFormValues,
  loanId: number,
): NewPaymentInput {
  return {
    loanId,
    paymentDate: values.paymentDate,
    paymentAmount: Number(values.paymentAmount),
    paymentType: values.paymentType,
    paymentMethod: values.paymentMethod || undefined,
    transactionReference: values.transactionReference || undefined,
    notes: values.notes || undefined,
  };
}

function friendlyPaymentError(message?: string): string {
  const normalized = (message ?? '').toLowerCase();
  if (normalized.includes('greater than zero'))
    return 'Payment amount must be greater than ₹0.';
  if (normalized.includes('exceeds'))
    return 'This payment exceeds the outstanding amount.';
  if (normalized.includes('closed') || normalized.includes('inactive')) {
    return 'This loan is closed and cannot receive payments.';
  }
  return 'We could not save this payment. Please review the details and try again.';
}

export function PaymentFormDialog({
  mode,
  loanId,
  interestType,
  payment,
  onClose,
  onSaved,
}: PaymentFormDialogProps) {
  const [values, setValues] = useState(() => {
    const initial = getPaymentFormValues(payment);
    return !payment && interestType === 'EMI'
      ? { ...initial, paymentType: 'EMI' }
      : initial;
  });
  const titleId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [createPayment, createState] = useMutation<
    CreatePaymentMutation,
    CreatePaymentVariables
  >(CREATE_PAYMENT_MUTATION);
  const [updatePayment, updateState] = useMutation<
    UpdatePaymentMutation,
    UpdatePaymentVariables
  >(UPDATE_PAYMENT_MUTATION);
  const mutationState = mode === 'create' ? createState : updateState;
  const [validationError, setValidationError] = useState<string | null>(null);

  const paymentOptions =
    interestType === 'EMI'
      ? [
          {
            value: 'EMI',
            label: 'Monthly EMI',
            help: 'Pays the scheduled principal and interest.',
          },
          {
            value: 'PREPAYMENT',
            label: 'Prepayment',
            help: 'Makes an extra payment toward the loan.',
          },
        ]
      : interestType === 'INTEREST_ONLY'
        ? [
            {
              value: 'INTEREST',
              label: 'Interest only',
              help: 'Pays interest and leaves principal unchanged.',
            },
            {
              value: 'PRINCIPAL',
              label: 'Principal',
              help: 'Reduces the amount originally borrowed or lent.',
            },
            {
              value: 'BOTH',
              label: 'Principal and interest',
              help: 'Pays both parts of the loan.',
            },
          ]
        : [
            {
              value: 'PRINCIPAL',
              label: 'Principal',
              help: 'Reduces the loan principal.',
            },
            {
              value: 'INTEREST',
              label: 'Interest',
              help: 'Pays interest only.',
            },
            {
              value: 'BOTH',
              label: 'Principal and interest',
              help: 'Pays principal and interest.',
            },
          ];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutationState.loading) onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mutationState.loading, onClose]);

  const setField = <Key extends keyof PaymentFormValues>(
    field: Key,
    value: PaymentFormValues[Key],
  ) => setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(values.paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError('Payment amount must be greater than ₹0.');
      return;
    }
    setValidationError(null);

    const input = toNewPaymentInput(values, loanId);

    try {
      if (mode === 'create') {
        const result = await createPayment({
          variables: { input },
          refetchQueries: [
            { query: PAYMENTS_BY_LOAN_QUERY, variables: { loanId } },
            { query: LOAN_LEDGER_QUERY, variables: { id: String(loanId) } },
            { query: LOAN_SUMMARY_QUERY, variables: { id: String(loanId) } },
            { query: LOAN_QUERY, variables: { id: String(loanId) } },
            DASHBOARD_SUMMARY_QUERY,
          ],
          awaitRefetchQueries: true,
        });

        if (result.data?.createPayment) {
          onSaved?.();
          onClose();
        }
        return;
      }

      if (!payment) return;

      const result = await updatePayment({
        variables: { id: payment.id, input },
        refetchQueries: [
          { query: PAYMENTS_BY_LOAN_QUERY, variables: { loanId } },
          { query: LOAN_LEDGER_QUERY, variables: { id: String(loanId) } },
          { query: LOAN_SUMMARY_QUERY, variables: { id: String(loanId) } },
          { query: LOAN_QUERY, variables: { id: String(loanId) } },
          DASHBOARD_SUMMARY_QUERY,
        ],
        awaitRefetchQueries: true,
      });

      if (result.data?.updatePayment) {
        onSaved?.();
        onClose();
      }
    } catch {
      // Apollo exposes the mutation error below; keep the message user-friendly.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !mutationState.loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl dark:bg-[#111815]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#111815]/95">
          <div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              {mode === 'create' ? 'Add payment' : 'Edit payment'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'create'
                ? 'Record a new payment toward this loan.'
                : 'Update the selected payment record.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutationState.loading}
            className="inline-flex size-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-6 px-5 py-6 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment date
                <input
                  ref={firstInputRef}
                  type="date"
                  className={inputClassName}
                  value={values.paymentDate}
                  onChange={(event) =>
                    setField('paymentDate', event.target.value)
                  }
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputClassName}
                  value={values.paymentAmount}
                  onChange={(event) =>
                    setField('paymentAmount', event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment type
                <select
                  className={inputClassName}
                  value={values.paymentType}
                  onChange={(event) =>
                    setField('paymentType', event.target.value)
                  }
                  required
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
                  {
                    paymentOptions.find(
                      (option) => option.value === values.paymentType,
                    )?.help
                  }
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment method
                <select
                  className={inputClassName}
                  value={values.paymentMethod}
                  onChange={(event) =>
                    setField('paymentMethod', event.target.value)
                  }
                >
                  <option value="">Select method</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
                Transaction reference
                <input
                  className={inputClassName}
                  value={values.transactionReference}
                  onChange={(event) =>
                    setField('transactionReference', event.target.value)
                  }
                  placeholder="Optional reference"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
                Notes
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  value={values.notes}
                  onChange={(event) => setField('notes', event.target.value)}
                  placeholder="Optional notes"
                  maxLength={1000}
                />
              </label>

              {(validationError || mutationState.error) && (
                <p
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-400/10 dark:text-rose-300"
                  role="alert"
                >
                  {validationError ||
                    friendlyPaymentError(mutationState.error?.message)}
                </p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#111815]/95">
            <button
              type="button"
              onClick={onClose}
              disabled={mutationState.loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutationState.loading}
              className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            >
              {mutationState.loading && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {mode === 'create' ? 'Save payment' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
