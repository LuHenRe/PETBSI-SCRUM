"use client";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="login-page">
      <section className="card login-card">
        <h1>Algo deu errado</h1>
        <p className="text-muted mt-2">Ocorreu um erro ao renderizar esta tela. Tente novamente.</p>
        <p className="text-xs text-muted mt-3">Se o problema persistir, informe a equipe responsável.</p>
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" onClick={reset}>Tentar novamente</button>
          <Link href="/" className="btn btn-secondary">Início</Link>
        </div>
      </section>
    </main>
  );
}
