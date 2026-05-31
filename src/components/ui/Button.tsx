import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-v03-accent text-v03-accent-foreground shadow-v03-button hover:brightness-105',
  secondary:
    'bg-v03-white text-v03-accent-foreground shadow-v03-button hover:brightness-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'h-[55px] text-v03-button rounded-v03-button',
  md: 'h-12 text-v03-button rounded-v03-button',
};

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClasses =
  'inline-flex w-full items-center justify-center px-[15px] py-2 font-simpler font-bold transition';

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
