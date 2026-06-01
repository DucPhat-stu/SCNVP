import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';
import { cn } from '@lib/utils';

interface ButtonProps
  extends Omit<AntButtonProps, 'type' | 'size' | 'htmlType' | 'variant'> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  htmlType?: AntButtonProps['htmlType'];
}

const variants = {
  primary: 'scnvp-button--primary',
  ghost: 'scnvp-button--ghost',
  outline: 'scnvp-button--outline',
};

const sizes = {
  sm: 'scnvp-button--sm',
  md: 'scnvp-button--md',
  icon: 'scnvp-button--icon',
};

export function Button({
  className,
  htmlType,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  const antType = variant === 'primary' ? 'primary' : 'default';

  return (
    <AntButton
      type={antType}
      htmlType={htmlType ?? type}
      className={cn(
        'scnvp-button',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
