import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { UserRole } from '@shared/types';

interface RoleSelectorProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: UserRole.STUDENT,
    label: 'Student',
    description: 'Learning network fundamentals',
  },
  {
    value: UserRole.ENGINEER,
    label: 'Engineer',
    description: 'Designing and deploying networks',
  },
  {
    value: UserRole.ARCHITECT,
    label: 'Architect',
    description: 'Planning city-scale systems',
  },
  {
    value: UserRole.COMPANY,
    label: 'Company',
    description: 'Managing team workspaces',
  },
];

function RoleIcon({ role }: { role: UserRole }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: 22,
    height: 22,
  };

  if (role === UserRole.STUDENT) {
    return (
      <svg {...commonProps}>
        <path d="m3 8 9-4 9 4-9 4-9-4Z" />
        <path d="m7 10.2v4.1c0 1.6 2.2 2.9 5 2.9s5-1.3 5-2.9v-4.1" />
      </svg>
    );
  }

  if (role === UserRole.ENGINEER) {
    return (
      <svg {...commonProps}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-3-3 2.4-2.4Z" />
      </svg>
    );
  }

  if (role === UserRole.ARCHITECT) {
    return (
      <svg {...commonProps}>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-7h6v7" />
        <path d="M4 20h16" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 20V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M16 9h2a2 2 0 0 1 2 2v9" />
      <path d="M8 8h4M8 12h4M8 16h4" />
    </svg>
  );
}

export function RoleSelector<T extends FieldValues = FieldValues>({
  control,
  name,
}: RoleSelectorProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: 'Please select a role' }}
      render={({ field, fieldState }) => (
        <div>
          <span className="auth-label">Role</span>
          <div className="role-grid">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = field.value === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  className={`role-card ${
                    isSelected ? 'role-card--selected' : ''
                  }`}
                  onClick={() => field.onChange(role.value)}
                  aria-pressed={isSelected}
                >
                  <span className="role-card__icon">
                    <RoleIcon role={role.value} />
                  </span>
                  <span className="role-card__label">{role.label}</span>
                  <span className="role-card__desc">{role.description}</span>
                  {isSelected && (
                    <span className="role-card__check" aria-hidden="true">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {fieldState.error && (
            <span className="auth-field-error">{fieldState.error.message}</span>
          )}
        </div>
      )}
    />
  );
}
