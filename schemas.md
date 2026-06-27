1. Create Loan
mutation {
  createLoan(
    input: {
      contactId: 1
      loanReference: "LN002"
      loanType: "LEND"
      interestType: "EMI"
      principalAmount: 100000
      outstandingPrincipal: 100000
      interestRate: 12
      interestFrequency: "MONTHLY"
      loanDate: "2026-06-20"
    }
  ) {
    contactId
    loanReference
    loanType
    interestType
    principalAmount
    outstandingPrincipal
    interestRate
  }
}
2. Get All Loans
query {
  loans {
    id
    contactId
    loanReference
    loanType
    interestType
    principalAmount
    outstandingPrincipal
    interestRate
  }
}
3. Get Loan By ID
query {
  loan(id: "1") {
    id
    contactId
    loanReference
    loanType
    interestType
    principalAmount
    outstandingPrincipal
    interestRate
  }
}
4. Create Payment
mutation {
  createPayment(
    input: {
      loanId: 1
      paymentDate: "2026-06-27"
      paymentAmount: 5000
      paymentType: "EMI"
      paymentMethod: "UPI"
      transactionReference: "UPI12345"
      notes: "June EMI"
    }
  ) {
    loanId
    paymentDate
    paymentAmount
    paymentType
    paymentMethod
    transactionReference
    notes
  }
}
5. Get Payments By Loan
query {
  paymentsByLoan(loanId: 1) {
    id
    paymentDate
    paymentAmount
    paymentType
    paymentMethod
    transactionReference
    notes
  }
}