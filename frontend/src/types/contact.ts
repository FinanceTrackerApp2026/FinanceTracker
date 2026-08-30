export type ContactType = 'PERSON' | 'COMPANY' | 'BANK';
export type ContactStatus = 'ACTIVE' | 'INACTIVE';

export interface Contact {
  id: string;
  contactCode: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  occupation: string | null;
  contactType: ContactType;
  notes: string | null;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormValues {
  contactCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  occupation: string;
  contactType: ContactType;
  notes: string;
}

export interface ContactsQuery {
  contacts: Contact[];
}

export interface ContactQuery {
  contact: Contact | null;
}

export interface ContactQueryVariables {
  id: number;
}

export interface ContactSummary {
  totalLent: number;
  totalBorrowed: number;
  outstanding: number;
  activeLoans: number;
  closedLoans: number;
  interestEarned: number;
  interestPaid: number;
  totalPaid: number;
  totalOutstanding: number;
  outstandingInterest: number;
}

export interface ContactSummaryQuery {
  contactSummary: ContactSummary | null;
}

export interface CreateContactMutation {
  createContact: Omit<Contact, 'createdAt' | 'updatedAt'>;
}

export interface CreateContactVariables {
  input: Omit<ContactFormValues, 'contactCode'>;
}

export interface UpdateContactMutation {
  updateContact: Contact;
}

export interface UpdateContactVariables {
  id: number;
  input: Omit<ContactFormValues, 'contactCode'>;
}

export interface ChangeContactStatusMutation {
  changeContactStatus: Pick<Contact, 'id' | 'status' | 'updatedAt'>;
}

export interface ChangeContactStatusVariables {
  input: {
    id: number;
    status: ContactStatus;
  };
}
