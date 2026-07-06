import { useMutation } from '@apollo/client/react';
import { ArrowDownLeft, ArrowUpRight, LoaderCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import {
  CREATE_LOAN_MUTATION,
  UPDATE_LOAN_MUTATION,
} from '../../graphql/mutations/loans';
import { LOANS_QUERY } from '../../graphql/queries/loans';
import type {
  CreateLoanMutation,
  CreateLoanVariables,
  Loan,
  LoanFormValues,
  UpdateLoanMutation,
  UpdateLoanVariables,
} from '../../types/loan';
import {
  getLoanFormValues,
  toNewLoanInput,
  toUpdateLoanInput,
} from '../../utils/loans';

interface LoanFormDialogProps {
  mode: 'create' | 'edit';
  loan?: Loan;
  onClose: () => void;
  onSaved?: (loan: Loan) => void;
}

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/10 dark:disabled:bg-white/[0.025]';

export function LoanFormDialog({
  mode,
  loan,
  onClose,
  onSaved,
}: LoanFormDialogProps) {
  const [values, setValues] = useState(() => getLoanFormValues(loan));
  const titleId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [createLoan, createState] = useMutation<
    CreateLoanMutation,
    CreateLoanVariables
  >(CREATE_LOAN_MUTATION);
  const [updateLoan, updateState] = useMutation<
    UpdateLoanMutation,
    UpdateLoanVariables
  >(UPDATE_LOAN_MUTATION);
  const mutationState = mode === 'create' ? createState : updateState;

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

  const setField = <Key extends keyof LoanFormValues>(
    field: Key,
    value: LoanFormValues[Key],
  ) => setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'create') {
      const result = await createLoan({
        variables: { input: toNewLoanInput(values) },
        refetchQueries: [{ query: LOANS_QUERY }],
        awaitRefetchQueries: true,
      });

      if (result.data?.createLoan) {
        onSaved?.(result.data.createLoan);
        onClose();
      }
      return;
    }

    if (!loan) return;
    const result = await updateLoan({
      variables: {
        id: Number(loan.id),
        input: toUpdateLoanInput(values),
      },
      refetchQueries: [{ query: LOANS_QUERY }],
      awaitRefetchQueries: true,
    });

    if (result.data?.updateLoan) {
      onSaved?.(result.data.updateLoan);
      onClose();
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
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl dark:bg-[#111815]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#111815]/95">
          <div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              {mode === 'create' ? 'Create loan' : 'Edit loan'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'create'
                ? 'Record a new lending or borrowing agreement.'
                : `Update ${loan?.loanReference ?? 'loan'} terms.`}
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
          <div className="space-y-7 px-5 py-6 sm:px-6">
            <fieldset>
              <legend className="text-sm font-semibold text-slate-950 dark:text-white">
                Loan direction
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'LEND',
                    label: 'Money lent',
                    helper: 'You are lending to this contact',
                    icon: ArrowUpRight,
                  },
                  {
                    value: 'BORROW',
                    label: 'Money borrowed',
                    helper: 'You are borrowing from this contact',
                    icon: ArrowDownLeft,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = values.loanType === option.value;

                  return (
                    <label
                      key={option.value}
                      className={[
                        'flex cursor-pointer gap-3 rounded-2xl border p-4 transition',
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600 dark:border-teal-400 dark:bg-teal-400/5 dark:ring-teal-400'
                          : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20',
                        mode === 'edit' ? 'cursor-not-allowed opacity-70' : '',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="loanType"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setField('loanType', option.value)}
                        disabled={mode === 'edit'}
                        className="sr-only"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm dark:bg-white/5 dark:text-teal-300">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                          {option.helper}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact ID
                <input
                  ref={firstInputRef}
                  type="number"
                  min="1"
                  step="1"
                  className={inputClassName}
                  value={values.contactId}
                  onChange={(event) =>
                    setField('contactId', event.target.value)
                  }
                  placeholder="Contact ID"
                  required
                  disabled={mode === 'edit'}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Loan reference
                <input
                  className={inputClassName}
                  value={values.loanReference}
                  onChange={(event) =>
                    setField('loanReference', event.target.value.toUpperCase())
                  }
                  placeholder="e.g. LN-001"
                  required
                  disabled={mode === 'edit'}
                  maxLength={30}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Principal amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputClassName}
                  value={values.principalAmount}
                  onChange={(event) =>
                    setField('principalAmount', event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Loan date
                <input
                  type="date"
                  className={inputClassName}
                  value={values.loanDate}
                  onChange={(event) => setField('loanDate', event.target.value)}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Interest type
                <select
                  className={inputClassName}
                  value={values.interestType}
                  onChange={(event) =>
                    setField('interestType', event.target.value)
                  }
                  required
                >
                  <option value="SIMPLE">Simple</option>
                  <option value="COMPOUND">Compound</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Interest rate (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClassName}
                  value={values.interestRate}
                  onChange={(event) =>
                    setField('interestRate', event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Interest frequency
                <select
                  className={inputClassName}
                  value={values.interestFrequency}
                  onChange={(event) =>
                    setField('interestFrequency', event.target.value)
                  }
                  required
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Due day
                <input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  className={inputClassName}
                  value={values.dueDay}
                  onChange={(event) => setField('dueDay', event.target.value)}
                  placeholder="Optional, 1–31"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tenure
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputClassName}
                  value={values.loanTenure}
                  onChange={(event) =>
                    setField('loanTenure', event.target.value)
                  }
                  placeholder="Duration"
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tenure unit
                <select
                  className={inputClassName}
                  value={values.tenureUnit}
                  onChange={(event) =>
                    setField('tenureUnit', event.target.value)
                  }
                  required
                >
                  <option value="MONTH">Months</option>
                  <option value="YEAR">Years</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 sm:col-span-2 dark:border-white/10">
                <input
                  type="checkbox"
                  checked={values.hasSecurity}
                  onChange={(event) =>
                    setField('hasSecurity', event.target.checked)
                  }
                  className="size-4 rounded border-slate-300 text-teal-700 accent-teal-700"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Secured loan
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    This loan is backed by collateral or security.
                  </span>
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
                Notes
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  value={values.notes}
                  onChange={(event) => setField('notes', event.target.value)}
                  placeholder="Optional loan notes"
                  maxLength={1000}
                />
              </label>

              {mutationState.error && (
                <p
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-400/10 dark:text-rose-300"
                  role="alert"
                >
                  {mutationState.error.message}
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
              {mode === 'create' ? 'Create loan' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
