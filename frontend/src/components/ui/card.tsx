import type { HTMLAttributes } from 'react';
import { Card as AntCard, type CardProps as AntCardProps } from 'antd';
import { cn } from '@lib/utils';

export function Card({ className, ...props }: AntCardProps) {
  return (
    <AntCard
      bordered={false}
      className={cn('scnvp-card', className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}
