import type { ReactNode } from 'react';
import { Button as RACButton, type ButtonProps } from 'react-aria-components';

export const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ');

/* Motion: always the tokens, never raw values. */
export const fast = 'transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]';

/* Shared control look: 32px, 6px radius, control border, focus = accent border + inset 1px ring (no offset ring). */
export const controlBase = cx(
  'w-full rounded-md border border-control bg-surface px-3 text-body font-regular text-fg outline-none',
  'placeholder:text-fg-2', fast,
  'data-[hovered]:border-fg-2',
  'data-[focused]:border-accent data-[focused]:shadow-[inset_0_0_0_1px_var(--accent)]',
  'data-[focus-within]:border-accent data-[focus-within]:shadow-[inset_0_0_0_1px_var(--accent)]',
  'data-[invalid]:border-crit data-[disabled]:bg-inset data-[disabled]:text-fg-2 data-[disabled]:cursor-not-allowed data-[disabled]:border-control',
);

/* Label above (body role), 6px gap, help below 12px fg-2, error below 12px crit. */
export const fieldWrap = 'flex flex-col gap-[6px]';
export const labelClass = 'text-body font-regular text-fg';
export const helpClass = 'text-label text-fg-2';
export const errorClass = 'text-label text-crit';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-fg-inverse border border-transparent data-[hovered]:bg-accent-hover data-[pressed]:bg-accent-active data-[disabled]:bg-accent-disabled',
  secondary: 'bg-surface text-fg border border-control data-[hovered]:border-fg-2 data-[pressed]:bg-inset data-[disabled]:text-fg-3 data-[disabled]:border-border',
  ghost: 'bg-transparent text-fg border border-transparent data-[hovered]:bg-inset data-[pressed]:bg-inset data-[disabled]:text-fg-3',
  destructive: 'bg-crit text-fg-inverse border border-transparent data-[hovered]:bg-crit-hover data-[disabled]:bg-accent-disabled',
};

export function DButton({ variant = 'secondary', className, ...props }: ButtonProps & { variant?: Variant; className?: string }) {
  return (
    <RACButton
      {...props}
      className={cx(
        'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 pb-[2px] text-body font-regular outline-none cursor-default',
        fast, variants[variant], 'data-[disabled]:cursor-not-allowed', className,
      )}
    />
  );
}

export function IconSlot({ children }: { children: ReactNode }) {
  return <span aria-hidden="true" className="inline-flex size-4 items-center justify-center">{children}</span>;
}
