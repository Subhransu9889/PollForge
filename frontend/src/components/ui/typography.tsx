import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TypographyH1({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn('typography-h1 text-foreground', className)}>{children}</h1>
}

export function TypographyH2({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('typography-h2 text-foreground', className)}>{children}</h2>
}

export function TypographyH3({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('typography-h3 text-foreground', className)}>{children}</h3>
}

export function TypographyP({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('typography-p', className)}>{children}</p>
}

export function TypographySmall({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('typography-small text-xs', className)}>{children}</p>
}

export function TypographyMuted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-muted text-sm', className)}>{children}</p>
}
