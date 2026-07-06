import { useMutation } from '@apollo/client/react';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import {
  CREATE_CONTACT_MUTATION,
  UPDATE_CONTACT_MUTATION,
} from '../../graphql/mutations/contacts';
import { CONTACTS_QUERY } from '../../graphql/queries/contacts';
import type {
  Contact,
  ContactFormValues,
  ContactType,
  CreateContactMutation,
  CreateContactVariables,
  UpdateContactMutation,
  UpdateContactVariables,
} from '../../types/contact';

interface ContactFormDialogProps {
  mode: 'create' | 'edit';
  contact?: Contact;
  onClose: () => void;
  onSaved?: (contact: Contact | CreateContactMutation['createContact']) => void;
}

const emptyForm: ContactFormValues = {
  contactCode: '',
  fullName: '',
  phoneNumber: '',
  email: '',
  address: '',
  occupation: '',
  contactType: 'PERSON',
  notes: '',
};

const getInitialValues = (contact?: Contact): ContactFormValues =>
  contact
    ? {
        contactCode: contact.contactCode,
        fullName: contact.fullName,
        phoneNumber: contact.phoneNumber ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
        occupation: contact.occupation ?? '',
        contactType: contact.contactType,
        notes: contact.notes ?? '',
      }
    : emptyForm;

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/10';

export function ContactFormDialog({
  mode,
  contact,
  onClose,
  onSaved,
}: ContactFormDialogProps) {
  const [values, setValues] = useState(() => getInitialValues(contact));
  const dialogTitleId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [createContact, createState] = useMutation<
    CreateContactMutation,
    CreateContactVariables
  >(CREATE_CONTACT_MUTATION);
  const [updateContact, updateState] = useMutation<
    UpdateContactMutation,
    UpdateContactVariables
  >(UPDATE_CONTACT_MUTATION);

  const mutationState = mode === 'create' ? createState : updateState;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutationState.loading) onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mutationState.loading, onClose]);

  const setField = <Key extends keyof ContactFormValues>(
    field: Key,
    value: ContactFormValues[Key],
  ) => setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'create') {
      const result = await createContact({
        variables: { input: values },
        refetchQueries: [{ query: CONTACTS_QUERY }],
        awaitRefetchQueries: true,
      });

      if (result.data?.createContact) {
        onSaved?.(result.data.createContact);
        onClose();
      }
      return;
    }

    if (!contact) return;
    const input = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      address: values.address,
      occupation: values.occupation,
      contactType: values.contactType,
      notes: values.notes,
    };
    const result = await updateContact({
      variables: { id: Number(contact.id), input },
      refetchQueries: [{ query: CONTACTS_QUERY }],
      awaitRefetchQueries: true,
    });

    if (result.data?.updateContact) {
      onSaved?.(result.data.updateContact);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !mutationState.loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl dark:bg-[#111815]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#111815]/95">
          <div>
            <h2
              id={dialogTitleId}
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              {mode === 'create' ? 'Create contact' : 'Edit contact'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'create'
                ? 'Add someone to your finance network.'
                : `Update ${contact?.fullName ?? 'contact'}’s information.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutationState.loading}
            className="inline-flex size-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Contact code
              <input
                ref={firstInputRef}
                className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-white/[0.025]`}
                value={values.contactCode}
                onChange={(event) =>
                  setField('contactCode', event.target.value.toUpperCase())
                }
                placeholder="e.g. C001"
                required
                disabled={mode === 'edit'}
                maxLength={30}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
              <input
                className={inputClassName}
                value={values.fullName}
                onChange={(event) => setField('fullName', event.target.value)}
                placeholder="Full name"
                required
                maxLength={120}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Contact type
              <select
                className={inputClassName}
                value={values.contactType}
                onChange={(event) =>
                  setField('contactType', event.target.value as ContactType)
                }
              >
                <option value="PERSON">Person</option>
                <option value="COMPANY">Company</option>
                <option value="BANK">Bank</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone number
              <input
                className={inputClassName}
                value={values.phoneNumber}
                onChange={(event) =>
                  setField('phoneNumber', event.target.value)
                }
                placeholder="Phone number"
                type="tel"
                maxLength={30}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
              <input
                className={inputClassName}
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="name@example.com"
                type="email"
                maxLength={160}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Occupation
              <input
                className={inputClassName}
                value={values.occupation}
                onChange={(event) => setField('occupation', event.target.value)}
                placeholder="Occupation or role"
                maxLength={120}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
              Address
              <textarea
                className={`${inputClassName} min-h-20 resize-y`}
                value={values.address}
                onChange={(event) => setField('address', event.target.value)}
                placeholder="Address"
                maxLength={500}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
              Notes
              <textarea
                className={`${inputClassName} min-h-24 resize-y`}
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Optional notes"
                maxLength={1000}
              />
            </label>

            {mutationState.error && (
              <p
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-400/10 dark:text-rose-300"
                role="alert"
              >
                {mutationState.error.message}
              </p>
            )}
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#111815]/95">
            <button
              type="button"
              onClick={onClose}
              disabled={mutationState.loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutationState.loading}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            >
              {mutationState.loading && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {mode === 'create' ? 'Create contact' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
