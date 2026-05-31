import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@shared/types';
import { useAuth } from './useAuth';
import type { LoginRequest, RegisterRequest } from './useAuth';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthMode;
}

type AuthFormValues = RegisterRequest;

const roleOptions = [
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.ENGINEER, label: 'Engineer' },
  { value: UserRole.ARCHITECT, label: 'Architect' },
  { value: UserRole.COMPANY, label: 'Company' },
];

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    error.error &&
    typeof error.error === 'object' &&
    'message' in error.error
  ) {
    return String(error.error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed';
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const isRegisterMode = mode === 'register';
  const title = isRegisterMode ? 'Create account' : 'Welcome back';

  const defaultValues = useMemo<AuthFormValues>(
    () => ({
      email: '',
      password: '',
      role: UserRole.ENGINEER,
      experienceLevel: '',
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ defaultValues });

  const onSubmit = async (values: AuthFormValues) => {
    setServerError(null);

    try {
      if (isRegisterMode) {
        await registerUser({
          email: values.email,
          password: values.password,
          role: values.role,
          experienceLevel: values.experienceLevel || undefined,
        });
      } else {
        const payload: LoginRequest = {
          email: values.email,
          password: values.password,
        };
        await login(payload);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-surface text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-500 font-bold">
              SC
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-200">
                SCNVP
              </p>
              <p className="text-sm text-gray-400">Smart city network design</p>
            </div>
          </div>

          <div className="py-12 lg:max-w-xl">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Build, validate, and operate city-scale network plans.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
              Sign in to manage topology projects, simulation runs, and
              deployment-ready infrastructure designs from one workspace.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-gray-400 sm:grid-cols-3">
            <span>Role-aware access</span>
            <span>JWT protected API</span>
            <span>Project workspace ready</span>
          </div>
        </section>

        <section className="flex items-center px-6 py-8 sm:px-10 lg:px-0">
          <form
            className="glass-strong w-full rounded-lg p-6 shadow-2xl shadow-black/30 sm:p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  {isRegisterMode
                    ? 'Register with a validated platform role.'
                    : 'Use your email and password to continue.'}
                </p>
              </div>
              <Link
                className="btn-ghost shrink-0 px-3 py-2 text-sm"
                to={isRegisterMode ? '/login' : '/register'}
              >
                {isRegisterMode ? 'Login' : 'Register'}
              </Link>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">
                  Email
                </span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary-400"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <span className="mt-2 block text-sm text-accent-400">
                    {errors.email.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">
                  Password
                </span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary-400"
                  type="password"
                  autoComplete={
                    isRegisterMode ? 'new-password' : 'current-password'
                  }
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                {errors.password && (
                  <span className="mt-2 block text-sm text-accent-400">
                    {errors.password.message}
                  </span>
                )}
              </label>

              {isRegisterMode && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-200">
                      Role
                    </span>
                    <select
                      className="w-full rounded-lg border border-white/10 bg-surface-800 px-4 py-3 text-white outline-none transition focus:border-primary-400"
                      {...register('role', { required: 'Role is required' })}
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <span className="mt-2 block text-sm text-accent-400">
                        {errors.role.message}
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-200">
                      Experience level
                    </span>
                    <input
                      className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-primary-400"
                      type="text"
                      placeholder="intermediate"
                      {...register('experienceLevel')}
                    />
                  </label>
                </>
              )}
            </div>

            {serverError && (
              <div className="mt-6 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-accent-400">
                {serverError}
              </div>
            )}

            <button
              className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Please wait...'
                : isRegisterMode
                  ? 'Create account'
                  : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
