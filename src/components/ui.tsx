import React from 'react'

export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ')
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-4 sm:p-6 border-b border-slate-200', className)}>{children}</div>
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-4 sm:p-6', className)}>{children}</div>
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed'

  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const variants: Record<string, string> = {
    primary:
      'text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 shadow-sm',
    secondary:
      'text-white bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 shadow-sm',
    outline:
      'text-slate-900 bg-white border border-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'text-white bg-red-600 hover:bg-red-700 shadow-sm',
  }

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 resize-none',
        className
      )}
      {...props}
    />
  )
}
