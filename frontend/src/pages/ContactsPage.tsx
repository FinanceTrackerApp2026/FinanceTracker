import { useMutation, useQuery } from '@apollo/client/react';
import {
  Building2,
  ChevronRight,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  X,
  UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContactAvatar } from '../components/contacts/ContactAvatar';
import { ContactFormDialog } from '../components/contacts/ContactFormDialog';
import { CHANGE_CONTACT_STATUS_MUTATION } from '../graphql/mutations/contacts';
import { CONTACTS_QUERY } from '../graphql/queries/contacts';
import type {
  ChangeContactStatusMutation,
  ChangeContactStatusVariables,
  Contact,
  ContactsQuery,
  ContactStatus,
} from '../types/contact';
import { contactTypeLabels, matchesContactSearch } from '../utils/contacts';

function ContactsSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading contacts">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-20 rounded-2xl bg-slate-200/70 dark:bg-white/5"
        />
      ))}
      <span className="sr-only">Loading contacts…</span>
    </div>
  );
}

interface PendingStatusChange {
  contact: Contact;
  nextStatus: ContactStatus;
}

interface SnackbarState {
  message: string;
  tone: 'success' | 'error';
}

const getNextContactStatus = (status: ContactStatus): ContactStatus =>
  status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

const statusBadgeClassName = (status: ContactStatus) =>
  [
    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
    status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
      : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  ].join(' ');

const statusButtonClassName = (status: ContactStatus) =>
  [
    statusBadgeClassName(status),
    'transition hover:ring-2 hover:ring-teal-600/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-60 dark:hover:ring-teal-300/20',
  ].join(' ');

export function ContactsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);
  const [changingStatusContactId, setChangingStatusContactId] = useState<
    string | null
  >(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const { data, loading, error, refetch } =
    useQuery<ContactsQuery>(CONTACTS_QUERY);
  const [changeContactStatus] = useMutation<
    ChangeContactStatusMutation,
    ChangeContactStatusVariables
  >(CHANGE_CONTACT_STATUS_MUTATION);

  const filteredContacts = useMemo(
    () =>
      (data?.contacts ?? []).filter((contact) =>
        matchesContactSearch(contact, search),
      ),
    [data?.contacts, search],
  );

  const openContact = (contact: Contact) => {
    void navigate(`/contacts/${contact.id}`);
  };

  useEffect(() => {
    if (!snackbar) return;

    const timeout = window.setTimeout(() => setSnackbar(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [snackbar]);

  const requestStatusChange = (contact: Contact) => {
    setPendingStatusChange({
      contact,
      nextStatus: getNextContactStatus(contact.status),
    });
  };

  const getStatusConfirmationTitle = (status: ContactStatus) =>
    status === 'ACTIVE'
      ? 'Make this contact active?'
      : 'Make this contact inactive?';

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { contact, nextStatus } = pendingStatusChange;
    setChangingStatusContactId(contact.id);

    try {
      await changeContactStatus({
        variables: {
          input: {
            id: Number(contact.id),
            status: nextStatus,
          },
        },
        refetchQueries: [{ query: CONTACTS_QUERY }],
        awaitRefetchQueries: true,
      });
      await refetch();
      setPendingStatusChange(null);
      setSnackbar({
        message: 'Contact status updated.',
        tone: 'success',
      });
    } catch (mutationError) {
      setSnackbar({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : 'Unable to update contact status.',
        tone: 'error',
      });
    } finally {
      setChangingStatusContactId(null);
    }
  };

  return (
    <section
      className="mx-auto max-w-7xl space-y-6 py-6 sm:py-8"
      aria-labelledby="contacts-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Contact directory
          </p>
          <h2
            id="contacts-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white"
          >
            Contacts
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage the people and organisations in your finance network.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Plus aria-hidden="true" className="size-4" />
          Create contact
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div className="relative w-full sm:max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, code, phone, email…"
              aria-label="Search contacts"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-3 focus:ring-teal-600/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-400 dark:focus:bg-white/[0.07]"
            />
          </div>
          {!loading && !error && (
            <p className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {filteredContacts.length}{' '}
              {filteredContacts.length === 1 ? 'contact' : 'contacts'}
            </p>
          )}
        </div>

        <div className="p-4">
          {loading && !data && <ContactsSkeleton />}

          {error && (
            <div className="py-14 text-center" role="alert">
              <UsersRound
                aria-hidden="true"
                className="mx-auto size-8 text-rose-500"
              />
              <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                Unable to load contacts
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Check that the finance server is running.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredContacts.length === 0 && (
            <div className="py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                {search ? (
                  <Search aria-hidden="true" className="size-5" />
                ) : (
                  <UsersRound aria-hidden="true" className="size-5" />
                )}
              </span>
              <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                {search ? 'No contacts found' : 'No contacts yet'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first contact to get started.'}
              </p>
            </div>
          )}

          {!error && filteredContacts.length > 0 && (
            <>
              <div className="space-y-3 md:hidden">
                {filteredContacts.map((contact) => (
                  <article
                    key={contact.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openContact(contact)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') openContact(contact);
                    }}
                    className="cursor-pointer rounded-2xl border border-slate-200/80 p-4 transition outline-none hover:border-teal-200 hover:bg-teal-50/30 focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-white/10 dark:hover:border-teal-300/20 dark:hover:bg-teal-400/[0.03]"
                  >
                    <div className="flex items-start gap-3">
                      <ContactAvatar name={contact.fullName} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                              {contact.fullName}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {contact.contactCode} ·{' '}
                              {contactTypeLabels[contact.contactType]}
                            </p>
                          </div>
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-slate-400"
                          />
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <p>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                requestStatusChange(contact);
                              }}
                              disabled={changingStatusContactId === contact.id}
                              className={statusButtonClassName(contact.status)}
                              aria-label={`Change ${contact.fullName} status to ${getNextContactStatus(
                                contact.status,
                              )}`}
                            >
                              {contact.status}
                              {changingStatusContactId === contact.id && (
                                <LoaderCircle
                                  aria-hidden="true"
                                  className="ml-1 size-3 animate-spin"
                                />
                              )}
                            </button>
                          </p>
                          {contact.phoneNumber && (
                            <p className="flex items-center gap-2">
                              <Phone aria-hidden="true" className="size-3.5" />
                              {contact.phoneNumber}
                            </p>
                          )}
                          {contact.email && (
                            <p className="flex items-center gap-2 truncate">
                              <Mail
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                              />
                              <span className="truncate">{contact.email}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingContact(contact);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                          >
                            <Pencil aria-hidden="true" className="size-3.5" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:border-white/10 dark:text-slate-500">
                      <th className="px-3 py-3">Contact</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        tabIndex={0}
                        onClick={() => openContact(contact)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') openContact(contact);
                        }}
                        className="cursor-pointer transition-colors outline-none hover:bg-slate-50 focus-visible:bg-teal-50 dark:hover:bg-white/[0.025] dark:focus-visible:bg-teal-400/5"
                      >
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <ContactAvatar name={contact.fullName} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                                {contact.fullName}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {contact.contactCode}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Building2
                              aria-hidden="true"
                              className="size-3.5 text-slate-400"
                            />
                            {contactTypeLabels[contact.contactType]}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {contact.phoneNumber || '—'}
                        </td>
                        <td className="max-w-56 truncate px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {contact.email || '—'}
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              requestStatusChange(contact);
                            }}
                            disabled={changingStatusContactId === contact.id}
                            className={statusButtonClassName(contact.status)}
                            aria-label={`Change ${contact.fullName} status to ${getNextContactStatus(
                              contact.status,
                            )}`}
                          >
                            {contact.status}
                            {changingStatusContactId === contact.id && (
                              <LoaderCircle
                                aria-hidden="true"
                                className="ml-1 size-3 animate-spin"
                              />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingContact(contact);
                              }}
                              className="inline-flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:hover:bg-white/5 dark:hover:text-white"
                              aria-label={`Edit ${contact.fullName}`}
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <ContactFormDialog
          mode="create"
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {editingContact && (
        <ContactFormDialog
          mode="edit"
          contact={editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}

      {pendingStatusChange && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              changingStatusContactId === null
            ) {
              setPendingStatusChange(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-contact-status-heading"
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-[#111815]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="change-contact-status-heading"
                  className="text-lg font-semibold text-slate-950 dark:text-white"
                >
                  {getStatusConfirmationTitle(pendingStatusChange.nextStatus)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Are you sure you want to change the status of this contact?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                disabled={changingStatusContactId !== null}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
                aria-label="Close"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-white/[0.035] dark:text-slate-300">
              {pendingStatusChange.contact.fullName} will become{' '}
              {pendingStatusChange.nextStatus}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                disabled={changingStatusContactId !== null}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmStatusChange()}
                disabled={changingStatusContactId !== null}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
              >
                {changingStatusContactId !== null && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {snackbar && (
        <div
          className={[
            'fixed right-4 bottom-4 z-[80] flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl',
            snackbar.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200',
          ].join(' ')}
          role={snackbar.tone === 'error' ? 'alert' : 'status'}
        >
          <p className="leading-6">{snackbar.message}</p>
          <button
            type="button"
            onClick={() => setSnackbar(null)}
            className="mt-0.5 shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
