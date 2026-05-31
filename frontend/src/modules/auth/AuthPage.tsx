import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserRole } from '@shared/types';
import { useAuthStore } from '@shared/store/authStore';
import { AuthBackground } from './AuthBackground';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { RoleSelector } from './RoleSelector';
import { useAuth, type RegisterRequest } from './useAuth';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthMode;
}

type AuthFormValues = RegisterRequest;

const experienceLevels = [
  { value: '', label: 'Select experience level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const panelVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -24 : 24,
    opacity: 0,
  }),
};

const transition = {
  duration: 0.28,
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        width="20"
        height="20"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.1 12c1.6-4.6 5.3-7 9.9-7s8.3 2.4 9.9 7c-1.6 4.6-5.3 7-9.9 7s-8.3-2.4-9.9-7Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 3 18 18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 10.6a3 3 0 0 0 3.8 3.8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.4 7.7C5.1 8.7 3.3 10.5 2.1 12c1.6 4.6 5.3 7 9.9 7 1.7 0 3.2-.3 4.5-1"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5c4.6 0 8.3 2.4 9.9 7-.5 1.4-1.2 2.6-2.2 3.6"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="auth-spinner" viewBox="0 0 24 24" width="20" height="20">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeDasharray="28 28"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { login, register: registerUser, isLoading, error } = useAuth();
  const setError = useAuthStore((state) => state.setError);
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === 'register';
  const direction = isRegister ? 1 : -1;

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
    watch,
    control,
    formState: { errors },
  } = useForm<AuthFormValues>({ defaultValues });

  const watchedPassword = watch('password');

  useEffect(() => {
    setError(null);
    setShowPassword(false);
  }, [mode, setError]);

  const onSubmit = async (values: AuthFormValues) => {
    if (isRegister) {
      try {
        await registerUser({
          email: values.email,
          password: values.password,
          role: values.role,
          experienceLevel: values.experienceLevel || undefined,
        });
        navigate('/dashboard', { replace: true });
      } catch {
        return;
      }
      return;
    }

    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate('/dashboard', { replace: true });
    } catch {
      return;
    }
  };

  return (
    <main className="auth-page">
      <AuthBackground />

      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero__brand">
            <div className="auth-hero__logo">
              <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
                <path
                  d="M16 3 5 8.5v9L16 23l11-5.5v-9L16 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="16" cy="12" r="3" fill="currentColor" />
                <circle cx="8.5" cy="17" r="1.8" fill="currentColor" />
                <circle cx="23.5" cy="17" r="1.8" fill="currentColor" />
                <path
                  d="M16 12 8.5 17M16 12l7.5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div>
              <p className="auth-hero__title-badge">SCNVP</p>
              <p className="auth-hero__title-sub">
                Smart City Network Platform
              </p>
            </div>
          </div>

          <div className="auth-hero__content">
            <h1 className="auth-hero__headline">
              Design, simulate, and deploy city-scale network infrastructure.
            </h1>
            <p className="auth-hero__description">
              Manage topology projects, run traffic simulations, and prepare
              deployment-ready plans from one role-aware workspace.
            </p>
          </div>

          <div className="auth-hero__features">
            <div className="auth-hero__feature">
              <span className="auth-hero__feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <path
                    d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="auth-hero__feature-title">AI-assisted design</p>
                <p className="auth-hero__feature-desc">
                  Generate topology drafts from planning intent.
                </p>
              </div>
            </div>
            <div className="auth-hero__feature">
              <span className="auth-hero__feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <path
                    d="M4 18h16M7 15l3-4 3 2 4-7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="auth-hero__feature-title">Simulation ready</p>
                <p className="auth-hero__feature-desc">
                  Prepare traffic, congestion, and failure analysis.
                </p>
              </div>
            </div>
            <div className="auth-hero__feature">
              <span className="auth-hero__feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <path
                    d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="auth-hero__feature-title">Role-based access</p>
                <p className="auth-hero__feature-desc">
                  Keep student, engineer, architect, and company flows scoped.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.form
              key={mode}
              className="auth-form"
              onSubmit={handleSubmit(onSubmit)}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="auth-form__header">
                <div>
                  <h2 className="auth-form__title">
                    {isRegister ? 'Create account' : 'Welcome back'}
                  </h2>
                  <p className="auth-form__subtitle">
                    {isRegister
                      ? 'Choose your role and secure your workspace.'
                      : 'Sign in to continue to your projects.'}
                  </p>
                </div>
                <Link
                  className="auth-form__mode-switch"
                  to={isRegister ? '/login' : '/register'}
                >
                  {isRegister ? 'Sign in' : 'Register'}
                </Link>
              </div>

              <label className="auth-field" htmlFor="auth-email">
                <span className="auth-label">Email</span>
                <input
                  id="auth-email"
                  className={`auth-input ${
                    errors.email ? 'auth-input--error' : ''
                  }`}
                  type="email"
                  placeholder="you@example.com"
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
                  <span className="auth-field-error">
                    {errors.email.message}
                  </span>
                )}
              </label>

              <label className="auth-field" htmlFor="auth-password">
                <span className="auth-label">Password</span>
                <div className="auth-input-wrapper">
                  <input
                    id="auth-password"
                    className={`auth-input auth-input--has-action ${
                      errors.password ? 'auth-input--error' : ''
                    }`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    autoComplete={
                      isRegister ? 'new-password' : 'current-password'
                    }
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'At least 8 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="auth-input__toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-field-error">
                    {errors.password.message}
                  </span>
                )}
                {isRegister && (
                  <PasswordStrengthMeter password={watchedPassword} />
                )}
              </label>

              {isRegister && (
                <motion.div
                  className="auth-register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <RoleSelector control={control} name="role" />

                  <label className="auth-field" htmlFor="auth-experience">
                    <span className="auth-label">Experience level</span>
                    <select
                      id="auth-experience"
                      className="auth-select"
                      {...register('experienceLevel')}
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="auth-error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                      className="auth-error__icon"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                    <button
                      type="button"
                      className="auth-error__dismiss"
                      onClick={() => setError(null)}
                      aria-label="Dismiss error"
                    >
                      x
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className="auth-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Please wait...</span>
                  </>
                ) : isRegister ? (
                  'Create account'
                ) : (
                  'Sign in'
                )}
              </button>

              <p className="auth-form__footer">
                {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
                <Link
                  to={isRegister ? '/login' : '/register'}
                  className="auth-form__footer-link"
                >
                  {isRegister ? 'Sign in' : 'Create one'}
                </Link>
              </p>
            </motion.form>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
