export type ContactType = 'PERSON' | 'COMPANY' | 'BANK';

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
  status: string;
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

export interface CreateContactMutation {
  createContact: Omit<Contact, 'createdAt' | 'updatedAt'>;
}

export interface CreateContactVariables {
  input: ContactFormValues;
}

export interface UpdateContactMutation {
  updateContact: Contact;
}

export interface UpdateContactVariables {
  id: number;
  input: Omit<ContactFormValues, 'contactCode'>;
}
