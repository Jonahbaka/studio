
import * as React from "react"

import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn("grid items-start gap-8", className)} {...props}>
      {children}
    </div>
  )
}

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardHeader({
  children,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between", className)} {...props}>
      {children}
    </header>
  )
}

interface DashboardHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function DashboardHeaderTitle({
  children,
  className,
  ...props
}: DashboardHeaderTitleProps) {
    return <h1 className={cn("text-3xl font-headline", className)} {...props}>{children}</h1>
}


interface DashboardHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardHeaderActions({
  children,
  className,
  ...props
}: DashboardHeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

interface DashboardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardContent({
  children,
  className,
  ...props
}: DashboardContentProps) {
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {children}
    </div>
  )
}
