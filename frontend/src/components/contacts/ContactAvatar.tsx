import { getContactInitials } from '../../utils/contacts';

interface ContactAvatarProps {
  name: string;
  size?: 'small' | 'large';
}

export function ContactAvatar({ name, size = 'small' }: ContactAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-300/10',
        size === 'large' ? 'size-16 text-lg' : 'size-10 text-sm',
      ].join(' ')}
    >
      {getContactInitials(name)}
    </span>
  );
}
