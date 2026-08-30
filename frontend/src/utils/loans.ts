import type {
  Loan,
  LoanFormValues,
  LoanInterestType,
  NewLoanInput,
  UpdateLoanInput,
} from '../types/loan';

export const loanInterestTypeOptions: Array<{
  value: LoanInterestType;
  label: string;
}> = [
  { value: 'SIMPLE_INTEREST', label: 'Simple Interest' },
  { value: 'EMI', label: 'EMI' },
  { value: 'COMPOUND', label: 'Compound Interest' },
  { value: 'INTEREST_ONLY', label: 'Interest Only' },
];

export const emptyLoanForm: LoanFormValues = {
  contactId: '',
  loanType: 'LEND',
  interestType: 'SIMPLE_INTEREST',
  principalAmount: '',
  interestRate: '',
  interestFrequency: '',
  loanDate: '',
  dueDay: '',
  loanTenure: '',
  tenureUnit: '',
  hasSecurity: false,
  notes: '',
};

export const showsInterestFrequency = (interestType: LoanInterestType) =>
  interestType === 'COMPOUND' || interestType === 'INTEREST_ONLY';

export const showsScheduleFields = (interestType: LoanInterestType) =>
  interestType === 'EMI' ||
  interestType === 'COMPOUND' ||
  interestType === 'INTEREST_ONLY';

export const requiresScheduleFields = (interestType: LoanInterestType) =>
  interestType === 'EMI';

export const applyInterestTypeRules = (
  values: LoanFormValues,
  interestType: LoanInterestType,
): LoanFormValues => {
  const shouldShowInterestFrequency = showsInterestFrequency(interestType);
  const shouldShowScheduleFields = showsScheduleFields(interestType);

  return {
    ...values,
    interestType,
    interestFrequency: shouldShowInterestFrequency
      ? values.interestFrequency
      : '',
    dueDay: shouldShowScheduleFields ? values.dueDay : '',
    loanTenure: shouldShowScheduleFields ? values.loanTenure : '',
    tenureUnit: shouldShowScheduleFields ? values.tenureUnit : '',
  };
};

export const getLoanFormValues = (loan?: Loan): LoanFormValues =>
  loan
    ? {
        contactId: String(loan.contactId),
        loanType: loan.loanType,
        interestType: loan.interestType as LoanInterestType,
        principalAmount: String(loan.principalAmount),
        interestRate: String(loan.interestRate),
        interestFrequency:
          loan.interestFrequency === 'NONE' ? '' : loan.interestFrequency,
        loanDate: loan.loanDate.slice(0, 10),
        dueDay: loan.dueDay ? String(loan.dueDay) : '',
        loanTenure: loan.loanTenure ? String(loan.loanTenure) : '',
        tenureUnit: loan.tenureUnit === 'NONE' ? '' : loan.tenureUnit,
        hasSecurity: loan.hasSecurity,
        notes: loan.notes ?? '',
      }
    : emptyLoanForm;

const getSharedInput = (
  values: LoanFormValues,
): Omit<NewLoanInput, 'contactId' | 'loanType'> => ({
  interestType: values.interestType,
  principalAmount: Number(values.principalAmount),
  interestRate: Number(values.interestRate),
  interestFrequency: showsInterestFrequency(values.interestType)
    ? values.interestFrequency
    : 'NONE',
  loanDate: values.loanDate,
  ...(showsScheduleFields(values.interestType) && values.dueDay
    ? { dueDay: Number(values.dueDay) }
    : {}),
  loanTenure: showsScheduleFields(values.interestType)
    ? Number(values.loanTenure)
    : 0,
  tenureUnit: showsScheduleFields(values.interestType)
    ? values.tenureUnit
    : 'MONTH',
  hasSecurity: values.hasSecurity,
  ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
});

export const toNewLoanInput = (values: LoanFormValues): NewLoanInput => ({
  contactId: Number(values.contactId),
  loanType: values.loanType,
  ...getSharedInput(values),
});

export const toUpdateLoanInput = (values: LoanFormValues): UpdateLoanInput =>
  getSharedInput(values);

export const loanTypeLabel = (loanType: string) =>
  loanType === 'LEND' ? 'Lent' : loanType === 'BORROW' ? 'Borrowed' : loanType;
