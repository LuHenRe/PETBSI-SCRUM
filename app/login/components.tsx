"use client";

import { useFormStatus } from "react-dom";
import { signInEmailAction, signInGoogleAction, signInPreviewAction } from "./actions";

function SubmitEmailButton({ isRegister }: { isRegister: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ 
      width: "100%", padding: "0.875rem", borderRadius: "8px", 
      backgroundColor: '#6b46c1', color: 'white', border: 'none',
      fontSize: '1rem', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
      transition: 'background-color 0.2s', opacity: pending ? 0.7 : 1
    }} className="primary-btn">
      {pending ? "Enviando link..." : (isRegister ? "Registrar com E-mail" : "Entrar com E-mail")}
    </button>
  );
}

export function EmailForm({ isRegister }: { isRegister: boolean }) {
  return (
    <form action={signInEmailAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)', opacity: 0.8 }}>
          Endereço de e-mail
        </label>
        <input 
          type="email" 
          id="email"
          name="email" 
          placeholder="seu.email@exemplo.com" 
          required 
          style={{ 
            width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", 
            border: "1px solid var(--border)", outline: 'none',
            fontSize: '1rem', transition: 'border-color 0.2s',
            backgroundColor: 'transparent', color: 'var(--foreground)'
          }}
          className="email-input"
        />
      </div>
      <SubmitEmailButton isRegister={isRegister} />
    </form>
  );
}

function SubmitGoogleButton({ isRegister }: { isRegister: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ 
      width: "100%", padding: "0.875rem", borderRadius: "8px", 
      backgroundColor: 'transparent', color: 'var(--foreground)', 
      border: '1px solid var(--border)',
      fontSize: '1rem', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      transition: 'background-color 0.2s', opacity: pending ? 0.7 : 1
    }} className="outline-btn">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {pending ? "Redirecionando..." : (isRegister ? "Registrar com Google" : "Entrar com Google")}
    </button>
  );
}

export function GoogleForm({ isRegister }: { isRegister: boolean }) {
  return (
    <form action={signInGoogleAction}>
      <SubmitGoogleButton isRegister={isRegister} />
    </form>
  );
}

function SubmitPreviewButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ 
      width: "100%", padding: "0.875rem", borderRadius: "8px", 
      backgroundColor: '#e2e8f0', color: '#4a5568', 
      border: '1px dashed #cbd5e0',
      fontSize: '0.9rem', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      transition: 'background-color 0.2s', opacity: pending ? 0.7 : 1
    }} className="outline-btn" title="Modo Preview (Administrador)">
      {pending ? "Entrando..." : "Modo Preview (Temporário)"}
    </button>
  );
}

export function PreviewForm() {
  return (
    <form action={signInPreviewAction} style={{ marginTop: '1rem' }}>
      <SubmitPreviewButton />
    </form>
  );
}
