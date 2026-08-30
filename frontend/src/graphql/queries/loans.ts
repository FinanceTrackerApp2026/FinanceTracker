import { gql } from '@apollo/client';

export const LOAN_FIELDS = gql`
  fragment LoanFields on Loan {
    id
    contactId
    contactCode
    contactName
    loanReference
    loanType
    interestType
    principalAmount
    outstandingPrincipal
    interestRate
    interestFrequency
    loanDate
    dueDay
    loanTenure
    tenureUnit
    hasSecurity
    status
    notes
    createdAt
    updatedAt
  }
`;

export const LOANS_QUERY = gql`
  query Loans {
    loans {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS}
`;

export const LOAN_QUERY = gql`
  query Loan($id: ID!) {
    loan(id: $id) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS}
`;

export const LOAN_SUMMARY_QUERY = gql`
  query LoanSummary($id: ID!) {
    loanSummary(id: $id) {
      principalPaid
      interestPaid
      outstanding
      status
      interestAccrued
      outstandingInterest
      totalPaid
      totalOutstanding
      expectedTotalAmount
      monthlyPayment
      nextDueDate
      paymentsCompleted
      paymentsRemaining
    }
  }
`;

export const LOAN_LEDGER_QUERY = gql`
  query LoanLedger($id: ID!) {
    loanLedger(id: $id) {
      paymentDate
      paymentAmount
      principalPaid
      interestPaid
      outstanding
      outstandingInterest
      description
    }
  }
`;

export const PAYMENTS_BY_LOAN_QUERY = gql`
  query PaymentsByLoan($loanId: Int!) {
    paymentsByLoan(loanId: $loanId) {
      id
      loanId
      paymentDate
      paymentAmount
      paymentType
      paymentMethod
      transactionReference
      notes
    }
  }
`;
