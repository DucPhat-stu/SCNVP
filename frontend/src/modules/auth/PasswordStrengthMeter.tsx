import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
}

function evaluateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '' },
    1: { label: 'Weak', color: 'var(--strength-weak)' },
    2: { label: 'Fair', color: 'var(--strength-fair)' },
    3: { label: 'Good', color: 'var(--strength-good)' },
    4: { label: 'Strong', color: 'var(--strength-strong)' },
  };

  return { score, ...levels[score] };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, color } = useMemo(
    () => evaluateStrength(password),
    [password],
  );

  if (!password) return null;

  return (
    <div className="password-meter" role="status" aria-label={`Password strength: ${label}`}>
      <div className="password-meter__track">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`password-meter__segment ${
              segment <= score ? 'password-meter__segment--active' : ''
            }`}
            style={
              segment <= score
                ? { backgroundColor: color }
                : undefined
            }
          />
        ))}
      </div>
      {label && (
        <span className="password-meter__label" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
