import type {
  Loan,
  LoanFormValues,
  NewLoanInput,
  UpdateLoanInput,
} from '../types/loan';

export const emptyLoanForm: LoanFormValues = {
  contactId: '',
  loanReference: '',
  loanType: 'LEND',
  interestType: 'SIMPLE',
  principalAmount: '',
  interestRate: '',
  interestFrequency: 'MONTHLY',
  loanDate: '',
  dueDay: '',
  loanTenure: '',
  tenureUnit: 'MONTH',
  hasSecurity: false,
  notes: '',
};

export const getLoanFormValues = (loan?: Loan): LoanFormValues =>
  loan
    ? {
        contactId: String(loan.contactId),
        loanReference: loan.loanReference,
        loanType: loan.loanType,
        interestType: loan.interestType,
        principalAmount: String(loan.principalAmount),
        interestRate: String(loan.interestRate),
        interestFrequency: loan.interestFrequency,
        loanDate: loan.loanDate.slice(0, 10),
        dueDay: loan.dueDay ? String(loan.dueDay) : '',
        loanTenure: loan.loanTenure ? String(loan.loanTenure) : '',
        tenureUnit: loan.tenureUnit,
        hasSecurity: loan.hasSecurity,
        notes: loan.notes ?? '',
      }
    : emptyLoanForm;

const getSharedInput = (
  values: LoanFormValues,
): Omit<NewLoanInput, 'contactId' | 'loanReference' | 'loanType'> => ({
  interestType: values.interestType,
  principalAmount: Number(values.principalAmount),
  interestRate: Number(values.interestRate),
  interestFrequency: values.interestFrequency,
  loanDate: values.loanDate,
  ...(values.dueDay ? { dueDay: Number(values.dueDay) } : {}),
  loanTenure: Number(values.loanTenure),
  tenureUnit: values.tenureUnit,
  hasSecurity: values.hasSecurity,
  ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
});

export const toNewLoanInput = (values: LoanFormValues): NewLoanInput => ({
  contactId: Number(values.contactId),
  loanReference: values.loanReference.trim(),
  loanType: values.loanType,
  ...getSharedInput(values),
});

export const toUpdateLoanInput = (values: LoanFormValues): UpdateLoanInput =>
  getSharedInput(values);

export const loanTypeLabel = (loanType: string) =>
  loanType === 'LEND' ? 'Lent' : loanType === 'BORROW' ? 'Borrowed' : loanType;
