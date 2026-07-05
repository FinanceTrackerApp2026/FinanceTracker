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
6. Get LoanSummary
query {
  loanSummary(id: "1") {
    loan {
      id
      contactId
      loanReference
      loanType
      interestType
      principalAmount
      outstandingPrincipal
      interestRate
    }
    principalPaid
    outstanding
  }
}
7. Delete payment
mutation {
  deletePayment(id: "1")
}
8. Dashboard Summery
query {
  dashboardSummary {
    totalLent
    totalBorrowed
    outstandingToReceive
    outstandingToPay
    interestEarned
    interestPaid
    netInterest
    netAssets
    netWorth
    activeLoans
    closedLoans
  }
}
9. LoanLedger
Ledgerquery {
  loanLedger(id: "1") {
    paymentDate
    description
    paymentAmount
    principalPaid
    interestPaid
    outstanding
  }
}
10. Contact Summary
query {
  contactSummary(contactId: 1) {
    contactId
    totalLent
    outstanding

    loans {
      loan {
        loanReference
        principalAmount
      }
      principalPaid
      interestPaid
      outstanding
      status
    }
  }
}
11. CashFlow
query {
  monthlyCashFlow(year: 2026, month: 7) {
    year
    month
    totalReceived
    totalPaid
    principalReceived
    interestReceived
    principalPaid
    interestPaid
    netCashFlow
  }
}
12. Create Contact
mutation {
  createContact(
    input: {
      contactCode: "C001"
      fullName: "Rahul Sharma"
      phoneNumber: "9876543210"
      email: "rahul@example.com"
      address: "Hyderabad"
      occupation: "Software Engineer"
      contactType: "PERSON"
      notes: "First Contact"
    }
  ) {
    id
    contactCode
    fullName
    phoneNumber
    email
    contactType
    status
  }
}
13. GetContacts
query {
  contacts {
    id
    contactCode
    fullName
    phoneNumber
    email
    contactType
    status
  }
}
14. GetContactById
query {
  contact(id: 5) {
    id
    contactCode
    fullName
    phoneNumber
    email
    address
    occupation
    contactType
    status
    notes
    createdAt
    updatedAt
  }
}
15. Updated Contact
mutation {
  updateContact(
    id: 5
    input: {
      fullName: "Rahul Sharma Updated"
      phoneNumber: "9999999999"
      email: "rahul.updated@example.com"
      address: "Bangalore"
      occupation: "Senior Software Engineer"
      contactType: "PERSON"
      notes: "Updated Contact"
    }
  ) {
    id
    contactCode
    fullName
    phoneNumber
    email
    address
    occupation
    contactType
    status
    notes
  }
}
16. Update Status
mutation {
  changeContactStatus(
    input: {
      id: 5
      status: "INACTIVE"
    }
  ) {
    id
    contactCode
    fullName
    status
    updatedAt
  }
}