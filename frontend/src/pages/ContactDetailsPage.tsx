import { useQuery } from '@apollo/client/react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ContactAvatar } from '../components/contacts/ContactAvatar';
import { ContactFormDialog } from '../components/contacts/ContactFormDialog';
import { ContactLoans } from '../components/contacts/ContactLoans';
import {
  CONTACT_QUERY,
  CONTACT_SUMMARY_QUERY,
} from '../graphql/queries/contacts';
import type {
  Contact,
  ContactQuery,
  ContactQueryVariables,
  ContactSummaryQuery,
} from '../types/contact';
import { contactTypeLabels } from '../utils/contacts';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DetailItemProps {
  label: string;
  value: string | null;
  icon: typeof Mail;
  href?: string;
}

function DetailItem({ label, value, icon: Icon, href }: DetailItemProps) {
  const displayValue = value?.trim() || 'Not provided';

  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-medium break-words text-slate-800 dark:text-slate-200">
          {href && value ? (
            <a
              href={href}
              className="hover:text-teal-700 hover:underline dark:hover:text-teal-300"
            >
              {displayValue}
            </a>
          ) : (
            displayValue
          )}
        </dd>
      </div>
    </div>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.025]">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export function ContactDetailsPage() {
  const { contactId } = useParams();
  const numericContactId = Number(contactId);
  const hasValidId = Number.isInteger(numericContactId) && numericContactId > 0;
  const [isEditing, setIsEditing] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    ContactQuery,
    ContactQueryVariables
  >(CONTACT_QUERY, {
    variables: { id: hasValidId ? numericContactId : 0 },
    skip: !hasValidId,
  });
  const { data: summaryData, loading: summaryLoading, error: summaryError } =
    useQuery<ContactSummaryQuery>(CONTACT_SUMMARY_QUERY, {
      variables: { contactId: hasValidId ? numericContactId : 0 },
      skip: !hasValidId,
    });

  const contact = data?.contact;

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl animate-pulse py-6 sm:py-8">
        <div className="h-52 rounded-3xl bg-slate-200/70 dark:bg-white/5" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
          <div className="h-72 rounded-2xl bg-slate-200/70 dark:bg-white/5" />
        </div>
        <span className="sr-only">Loading contact details…</span>
      </section>
    );
  }

  if (!hasValidId || error || !contact) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center py-8">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#111815]">
          <TriangleAlert
            aria-hidden="true"
            className="mx-auto size-8 text-rose-500"
          />
          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            Contact not available
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The contact may not exist, or the finance server could not be
            reached.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/contacts"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Back to contacts
            </Link>
            {hasValidId && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 py-6 sm:py-8">
      <Link
        to="/contacts"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to contacts
      </Link>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ContactAvatar name={contact.fullName} size="large" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-300">
                {contact.contactCode}
              </p>
              <span
                className={[
                  'rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold',
                  contact.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
                ].join(' ')}
              >
                {contact.status}
              </span>
            </div>
            <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              {contact.fullName}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Building2 aria-hidden="true" className="size-4" />
              {contactTypeLabels[contact.contactType]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit contact
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Contact information
          </h3>
          <dl className="mt-6 space-y-6">
            <DetailItem
              label="Phone number"
              value={contact.phoneNumber}
              icon={Phone}
              href={
                contact.phoneNumber ? `tel:${contact.phoneNumber}` : undefined
              }
            />
            <DetailItem
              label="Email address"
              value={contact.email}
              icon={Mail}
              href={contact.email ? `mailto:${contact.email}` : undefined}
            />
            <DetailItem label="Address" value={contact.address} icon={MapPin} />
            <DetailItem
              label="Occupation"
              value={contact.occupation}
              icon={BriefcaseBusiness}
            />
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Additional details
          </h3>
          <dl className="mt-6 space-y-6">
            <DetailItem label="Notes" value={contact.notes} icon={FileText} />
            <DetailItem
              label="Created"
              value={formatDate(contact.createdAt)}
              icon={CalendarClock}
            />
            <DetailItem
              label="Last updated"
              value={formatDate(contact.updatedAt)}
              icon={CalendarClock}
            />
          </dl>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Financial summary
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Contact-wide position
          </h3>
        </div>
        {summaryLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 rounded-xl bg-slate-200/70 dark:bg-white/5" />)}
          </div>
        ) : summaryError ? (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">{summaryError.message}</p>
        ) : summaryData?.contactSummary ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryValue label="Total lent" value={formatCurrency(summaryData.contactSummary.totalLent)} />
            <SummaryValue label="Total borrowed" value={formatCurrency(summaryData.contactSummary.totalBorrowed)} />
            <SummaryValue label="Total outstanding" value={formatCurrency(summaryData.contactSummary.totalOutstanding)} />
            <SummaryValue label="Outstanding interest" value={formatCurrency(summaryData.contactSummary.outstandingInterest)} />
            <SummaryValue label="Interest earned (cash)" value={formatCurrency(summaryData.contactSummary.interestEarned)} />
            <SummaryValue label="Interest paid (cash)" value={formatCurrency(summaryData.contactSummary.interestPaid)} />
            <SummaryValue label="Active loans" value={String(summaryData.contactSummary.activeLoans)} />
            <SummaryValue label="Closed loans" value={String(summaryData.contactSummary.closedLoans)} />
          </div>
        ) : null}
      </section>

      <ContactLoans contactId={numericContactId} />

      {isEditing && (
        <ContactFormDialog
          mode="edit"
          contact={contact as Contact}
          onClose={() => setIsEditing(false)}
          onSaved={() => void refetch()}
        />
      )}
    </section>
  );
}
