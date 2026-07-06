import { gql } from '@apollo/client';

export const LOANS_BY_CONTACT_QUERY = gql`
  query LoansByContact($contactId: Int!) {
    loansByContact(contactId: $contactId) {
      id
      contactId
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
  }
`;
