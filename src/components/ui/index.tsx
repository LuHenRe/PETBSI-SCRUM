"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { initialsOf } from "@/lib/labels";
import type { Person } from "@/lib/types";

// ─── Button ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden />}
      {children}
    </button>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

interface CardProps {
  title?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, action, footer, children, className = "" }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div className="card-title">
            <h2>{title}</h2>
            {action}
          </div>
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────

type Tone = "ok" | "info" | "warn" | "danger" | "muted" | "primary";

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "muted", dot, children }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className={`dot dot-${tone}`} aria-hidden />}
      {children}
    </span>
  );
}

// ─── Formulários ────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="textarea" {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="select" {...props} />;
}

// ─── Modal ──────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, title, onClose, footer, children, width }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={String(title)} style={width ? { width } : undefined} ref={ref}>
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Estados ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      {description && <p className="text-muted mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function PageLoading({ label = "Carregando dados..." }: { label?: string }) {
  return (
    <div className="page-loading" role="status">
      <span className="spinner" aria-hidden />
      {label}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "danger" | "ok";
  children: ReactNode;
}) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

interface AvatarProps {
  person: Person | null | undefined;
  size?: "sm" | "lg";
}

export function Avatar({ person, size }: AvatarProps) {
  if (!person) return null;
  return (
    <span
      className={`avatar ${size === "lg" ? "avatar-lg" : ""}`}
      title={`${person.name} — ${person.email}`}
      aria-label={person.name}
    >
      {initialsOf(person.name)}
    </span>
  );
}

export function AvatarStack({ people }: { people: Person[] }) {
  return (
    <span className="avatar-stack">
      {people.slice(0, 3).map((person) => (
        <Avatar key={person.id} person={person} />
      ))}
      {people.length > 3 && (
        <span className="avatar" aria-label="Mais responsáveis">
          +{people.length - 3}
        </span>
      )}
    </span>
  );
}