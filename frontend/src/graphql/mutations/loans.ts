import { gql } from '@apollo/client';

import { LOAN_FIELDS } from '../queries/loans';

export const CREATE_LOAN_MUTATION = gql`
  mutation CreateLoan($input: NewLoan!) {
    createLoan(input: $input) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS}
`;

export const UPDATE_LOAN_MUTATION = gql`
  mutation UpdateLoan($id: Int!, $input: UpdateLoan!) {
    updateLoan(id: $id, input: $input) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS}
`;

export const CREATE_PAYMENT_MUTATION = gql`
  mutation CreatePayment($input: NewPayment!) {
    createPayment(input: $input) {
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

export const UPDATE_PAYMENT_MUTATION = gql`
  mutation UpdatePayment($id: ID!, $input: NewPayment!) {
    updatePayment(id: $id, input: $input) {
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

export const DELETE_PAYMENT_MUTATION = gql`
  mutation DeletePayment($id: ID!) {
    deletePayment(id: $id)
  }
`;

export const CHANGE_LOAN_STATUS_MUTATION = gql`
  mutation ChangeLoanStatus($input: ChangeLoanStatusInput!) {
    changeLoanStatus(input: $input) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS}
`;
