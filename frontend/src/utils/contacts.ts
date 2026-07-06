import type { Contact, ContactType } from '../types/contact';

export const contactTypeLabels: Record<ContactType, string> = {
  PERSON: 'Person',
  COMPANY: 'Company',
  BANK: 'Bank',
};

export const getContactInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return '?';

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export const matchesContactSearch = (contact: Contact, search: string) => {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;

  return [
    contact.fullName,
    contact.contactCode,
    contact.phoneNumber,
    contact.email,
    contact.occupation,
    contact.contactType,
    contact.status,
  ].some((value) => value?.toLocaleLowerCase().includes(query));
};
