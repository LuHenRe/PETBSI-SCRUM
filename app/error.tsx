"use client";

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
        <pre className="text-xs text-muted mt-3" style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" onClick={reset}>Tentar novamente</button>
          <a href="/" className="btn btn-secondary">Início</a>
        </div>
      </section>
    </main>
  );
}