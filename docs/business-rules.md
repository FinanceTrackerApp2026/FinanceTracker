# FinanceTracker Business Rules

## BR-001 Multiple Loans Per Contact

A contact can have multiple loans.

Example:
Ravi

* Loan 1 = 10000
* Loan 2 = 20000
* Loan 3 = 5000

Each loan is tracked separately.

## BR-002 Partial Principal Payment

If a borrower pays part of the principal:

Example:
Loan = 10000

After 3 months:
Principal Paid = 5000

Rules:

* Previous unpaid interest remains due.
* Remaining principal becomes 5000.
* Future interest is calculated on 5000.

## BR-003 Interest Payment Delay

If interest is paid after the due date:

Example:
Due Date = 15 Feb
Paid Date = 20 Feb

Rules:

* Interest accrues for the extra 5 days.
* Extra days are included in future calculations.

## BR-004 Multiple Loan Payment Allocation

One payment can be allocated across multiple loans.

Example:
Payment = 10000

Loan 1 = 4000
Loan 2 = 6000

The allocation must be recorded.

## BR-005 Security Tracking

When creating or managing a loan, the user must specify whether security exists.

Options:

* YES
* NO

If YES:

* One or more security records may be attached.
* Security documents/images are optional.
* Security may be linked immediately or at a later date.

Security Types:

* Land Document
* Empty Cheque
* Promissory Note
* Gold
* Aadhaar / PAN / ID Proof
* Guarantor Document
* Other

Rules:

* A loan may have no security.
* A loan may have one security.
* A loan may have multiple securities.
* A security may be linked to multiple loans.
* The user decides which securities are linked to which loans.

The system must track:

* Security Type
* Description
* Received Date
* Returned Date
* Status

Status:

* ACTIVE
* RETURNED
* EXPIRED

Security documents/images are optional.


## BR-006 Contact Lifecycle

Contacts must never be deleted.

Status:
- ACTIVE
- INACTIVE

Historical loans, payments, properties and documents must remain available even after a contact becomes inactive.

## BR-007 Reminder System

The system shall support:

1. Auto-generated reminders

   * Loan interest due
   * Rent due
   * EMI due
   * LIC interest due
   * Gold loan due

2. Manual reminders

   * Call customer
   * Visit property
   * Collect documents

3. Notification channels

   * App Notification
   * WhatsApp
   * Telegram
   * SMS
   * Email

4. Reminders must include:

   * Due amount
   * Due date
   * Contact
   * Reminder type

## BR-008 Contact Financial Summary

When viewing a contact:

Display:

* Total Principal Outstanding
* Total Interest Outstanding
* Previous Due Interest
* Next Due Date

Display all loans separately:

For each loan:

* Loan Date
* Principal Amount
* Outstanding Principal
* Interest Rate
* Interest Pending
* Last Payment Date
* Next Due Date

The system must provide both:

* Overall Summary
* Loan-wise Breakdown

## BR-009 Contact Numbers

A contact may have multiple phone numbers.

Each phone number shall have a label:

* SELF
* WIFE
* HUSBAND
* BROTHER
* SISTER
* OFFICE
* GUARANTOR
* OTHER

## BR-010 Contact Roles

A contact may have multiple roles simultaneously.

Examples:

* Borrower
* Lender
* Tenant
* Property Owner
* Guarantor

A separate contact record must not be created for each role.

## BR-011 Interest Ledger

Interest must be tracked per period.

For each period:

* Interest Due
* Interest Paid
* Interest Pending
* Status

Status:

* PAID
* PARTIAL
* PENDING
* OVERDUE

Historical interest records must never be deleted.

## BR-012 Property Rent Tracking

The system shall support:

* Houses
* Shops

For each property:

* Monthly Rent
* Advance Amount
* Tenant
* Start Date
* End Date

Rent may be:

* Fully Paid
* Partially Paid
* Unpaid

Previous pending rent must be carried forward.

## BR-013 Rent Adjustments

Rent may be adjusted using:

* Cash
* Bank Transfer
* Goods Adjustment
* Advance Adjustment

The adjustment history must be stored.

## BR-014 External Loans

The system shall support:

* LIC Loans
* Gold Loans
* Bike Loans
* Personal Loans
* Home Loans

Each external loan may contain multiple documents/accounts.

Each document may have:

* Principal
* Interest Rate
* Due Date

The system must generate reminders.

## BR-015 Security Records

Security records must be maintained independently of loans.

Store:

* Security Type
* Description
* Received Date
* Returned Date
* Status

Security documents/images are optional.

A security may exist before being linked to a loan.

## BR-016 Rental Agreement Tracking

For each property:

Store:

* Property Name
* Property Type (House/Shop)
* Tenant
* Monthly Rent
* Advance Amount
* Agreement Start Date
* Agreement End Date

Track:

* Monthly Rent Due
* Rent Paid
* Pending Rent
* Carry Forward Balance

The system must show:

* Current Due
* Previous Pending
* Total Due

Historical rent records must never be deleted.

## BR-017 Identity & Verification Tracking

The system shall support identity verification tracking for contacts.

Store:

* Aadhaar Number (optional)
* PAN Number (optional)
* Other ID Types (optional)

Track:

* Has ID Proof? (YES/NO)
* Document Uploaded? (YES/NO)

Document uploads are optional.

The system must record:

* Document Type
* Upload Date
* Notes

Identity verification information may be attached to borrowers, tenants, guarantors, or other contacts.


## BR-018 Security Usage

A security may be linked to one or more loans.

Examples:

Land Document A

* Loan 1
* Loan 2

Empty Cheque B

* Loan 3

The user decides which securities are linked to which loans.

A loan may have:

* No security
* One security
* Multiple securities

Security documents/images are optional.

## BR-019 Manual Payment Allocation

When recording a payment, the user decides how the payment is allocated.

The system must not automatically split payment between:

* Principal
* Interest
* Penalty

Examples:

Payment = 5000

User Allocation:

* Interest = 1000
* Principal = 3500
* Penalty = 500

The allocation must be stored and auditable.

Historical allocations must never be modified automatically.

## BR-020 Manual Loan Closure

Loans must not be automatically closed.

Even if:

* Outstanding Principal = 0
* Outstanding Interest = 0
* Outstanding Penalty = 0

The user must explicitly close the loan.

Reasons:

* Security documents may need to be returned.
* Settlement may still be under verification.
* Business review may be pending.

Loan Status:

* ACTIVE
* CLOSED

Store:

* Closed Date
* Closure Notes
* Closed By

## BR-021 Interest Ledger Tracking

Interest must be tracked period-wise.

The system must not store only total outstanding interest.

For each interest period store:

* Loan
* Period Start Date
* Period End Date
* Due Date
* Interest Amount
* Interest Paid
* Interest Pending
* Penalty Amount
* Status

Status:

* PENDING
* PARTIAL
* PAID
* OVERDUE

Example:

Jan 2026
Due Date: 15-Jan-2026
Interest Due: 200
Status: PENDING

Feb 2026
Due Date: 15-Feb-2026
Interest Due: 200
Status: PENDING

Mar 2026
Due Date: 15-Mar-2026
Interest Due: 200
Status: PENDING

The system must show both:

* Total Outstanding Interest
* Period-wise Breakdown

## BR-022 Soft Delete Policy

Records must never be physically deleted.

Applicable Entities:

* Contacts
* Loans
* Payments
* Interest Records
* Properties
* Rent Agreements
* Rent Payments
* Securities
* External Loans
* Reminders

Records should be marked using status values such as:

* ACTIVE
* INACTIVE
* CLOSED
* CANCELLED

depending on the entity type.

Historical data must remain available for:

* Auditing
* Reporting
* Financial Tracking
* Legal Verification

The system must preserve relationships between records even when they become inactive.

## BR-023 Audit Trail

All financial and operational changes must be auditable.

Track:

* Created By
* Created Date
* Updated By
* Updated Date

Where applicable:

* Closed By
* Closed Date

Applicable Entities:

* Contacts
* Loans
* Payments
* Interest Records
* Properties
* Rent Agreements
* Rent Payments
* Securities
* External Loans
* Reminders

Historical records must remain traceable.

## BR-024 Contact Search

Contacts must be searchable by:

* Customer Code
* Name
* Phone Number
* Aadhaar Number
* PAN Number

Example:

Search: CUS0001

Result:

* Contact Details
* Loans
* Payments
* Securities
* Properties
* Rent Records
* Reminders

The system must provide a consolidated contact view.
## BR-025 Settlement History

When a loan is closed:

Store:

* Closure Date
* Settlement Amount
* Closure Notes
* Closed By

Closed loans must remain visible for reporting and audit purposes.

## BR-026 Advance Deposit Management

Properties may have an advance/security deposit.

Store:

* Advance Amount
* Advance Received Date
* Advance Balance

The advance may be adjusted against:

* Pending Rent
* Property Damage
* Other Approved Charges

All adjustments must be recorded with:

* Adjustment Date
* Adjustment Amount
* Reason
* Notes

Historical adjustments must never be deleted.
