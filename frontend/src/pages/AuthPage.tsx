import { useMutation } from '@apollo/client/react';
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { type AuthUser } from '../auth/AuthProvider';
import { useAuth } from '../auth/useAuth';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations/auth';

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-3 focus:ring-teal-600/10 dark:border-white/10 dark:bg-white/5 dark:text-white';

interface AuthPayload {
  token: string;
  user: AuthUser;
}

function messageFor(error?: Error) {
  const message = error?.message?.toLowerCase() ?? '';
  if (message.includes('invalid email or password'))
    return 'Invalid email or password.';
  if (message.includes('already exists'))
    return 'An account with this email already exists.';
  if (message.includes('valid email')) return 'Enter a valid email address.';
  if (message.includes('password'))
    return 'Use a password with at least 8 characters.';
  return error ? 'We could not complete that request. Please try again.' : null;
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const { user, isLoading, setSession } = useAuth();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [login, loginState] = useMutation<{ login: AuthPayload }>(
    LOGIN_MUTATION,
  );
  const [register, registerState] = useMutation<{ register: AuthPayload }>(
    REGISTER_MUTATION,
  );
  const state = mode === 'login' ? loginState : registerState;

  if (isLoading)
    return (
      <div
        className="min-h-screen bg-[#f6f8f7] dark:bg-[#0b100e]"
        aria-label="Restoring session"
      />
    );
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setClientError(null);
    if (mode === 'register' && values.password !== values.confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }
    try {
      const session =
        mode === 'login'
          ? (
              await login({
                variables: {
                  input: {
                    email: values.email.trim(),
                    password: values.password,
                  },
                },
              })
            ).data?.login
          : (
              await register({
                variables: {
                  input: {
                    fullName: values.fullName.trim(),
                    email: values.email.trim(),
                    password: values.password,
                  },
                },
              })
            ).data?.register;
      if (session) {
        setSession(session.token, session.user);
        navigate('/dashboard', { replace: true });
      }
    } catch {
      /* the mutation state is rendered below */
    }
  };

  const isRegister = mode === 'register';
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f7] p-4 dark:bg-[#0b100e]">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
          <LockKeyhole className="size-5" />
        </div>
        <p className="mt-6 text-sm font-medium text-teal-700 dark:text-teal-300">
          Finance Tracker
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isRegister
            ? 'Start keeping your financial records private and organised.'
            : 'Sign in to your personal finance workspace.'}
        </p>
        <form
          className="mt-7 space-y-5"
          onSubmit={(event) => void submit(event)}
        >
          {isRegister && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
              <input
                required
                className={inputClassName}
                value={values.fullName}
                onChange={(e) =>
                  setValues({ ...values, fullName: e.target.value })
                }
              />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              className={inputClassName}
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            <input
              required
              minLength={isRegister ? 8 : undefined}
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={inputClassName}
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
            />
          </label>
          {isRegister && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm password
              <input
                required
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                value={values.confirmPassword}
                onChange={(e) =>
                  setValues({ ...values, confirmPassword: e.target.value })
                }
              />
            </label>
          )}
          {(clientError || state.error) && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
            >
              {clientError ?? messageFor(state.error)}
            </p>
          )}
          <button
            disabled={state.loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isRegister ? (
              <UserPlus className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            {state.loading
              ? 'Please wait…'
              : isRegister
                ? 'Create account'
                : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account?' : 'New to Finance Tracker?'}{' '}
          <Link
            className="font-semibold text-teal-700 hover:underline dark:text-teal-300"
            to={isRegister ? '/login' : '/register'}
          >
            {isRegister ? 'Login' : 'Create account'}
          </Link>
        </p>
      </section>
    </main>
  );
}
