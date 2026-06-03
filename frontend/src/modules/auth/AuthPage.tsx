import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
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

function CitySignalLogo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" width="36" height="36">
      <path
        d="M10 50V28l12-8 10 7 12-12 10 8v27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M18 50V34h8v16M36 50V33h8v17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M7 50h50" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="22" r="4" fill="currentColor" />
      <path
        d="M24 15a12 12 0 0 1 16 0M18 9a21 21 0 0 1 28 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AICodeAnimation() {
  return (
    <div className="auth-visual auth-visual--ai-code" aria-hidden="true">
      <div className="ai-code__chip">
        <span />
        <span />
      </div>
      <div className="ai-code__window">
        <div className="ai-code__toolbar">
          <span />
          <span />
          <span />
        </div>
        <div className="ai-code__lines">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="ai-code__cursor" />
    </div>
  );
}

function DeveloperCodingAnimation() {
  return (
    <div className="auth-visual auth-visual--programmer" aria-hidden="true">
      <div className="programmer">
        <div className="programmer__head">
          <span className="programmer__hair" />
        </div>
        <div className="programmer__body" />
        <div className="programmer__arm programmer__arm--left" />
        <div className="programmer__arm programmer__arm--right" />
      </div>
      <div className="programmer-screen">
        <div className="programmer-screen__toolbar">
          <span />
          <span />
          <span />
        </div>
        <div className="programmer-screen__code">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="programmer-keyboard">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}

function SatelliteNetworkAnimation() {
  return (
    <div className="auth-visual auth-visual--satellite" aria-hidden="true">
      <div className="earth">
        <span className="earth__continent earth__continent--one" />
        <span className="earth__continent earth__continent--two" />
        <span className="earth__continent earth__continent--three" />
      </div>
      <div className="satellite">
        <span className="satellite__body" />
        <span className="satellite__panel satellite__panel--left" />
        <span className="satellite__panel satellite__panel--right" />
      </div>
      <span className="satellite-beam satellite-beam--one" />
      <span className="satellite-beam satellite-beam--two" />
      <span className="satellite-beam satellite-beam--three" />
      <span className="orbit-ring orbit-ring--one" />
      <span className="orbit-ring orbit-ring--two" />
    </div>
  );
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { login, register: registerUser, isLoading, error } = useAuth();
  const setError = useAuthStore((state) => state.setError);
  const [showPassword, setShowPassword] = useState(false);
  const pageRef = useRef<HTMLElement | null>(null);
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

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty('--pointer-x', `${x}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${y}%`);
  };

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
    <main
      ref={pageRef}
      className="auth-page"
      onMouseMove={handlePointerMove}
    >
      <AuthBackground />

      <div className="auth-layout">
        <section className="auth-hero">
          <div className="auth-hero__brand">
            <div className="auth-hero__logo">
              <CitySignalLogo />
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
            <div className="auth-hero__feature auth-hero__feature--visual">
              <AICodeAnimation />
            </div>
            <div className="auth-hero__feature auth-hero__feature--visual">
              <SatelliteNetworkAnimation />
            </div>
            <div className="auth-hero__feature auth-hero__feature--visual">
              <DeveloperCodingAnimation />
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
