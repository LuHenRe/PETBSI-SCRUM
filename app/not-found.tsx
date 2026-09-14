import Link from "next/link";

export default function NotFound() {
  return (
    <main className="login-page">
      <section className="card login-card" style={{ textAlign: "center" }}>
        <h1>Página não encontrada</h1>
        <p className="text-muted mt-2">A rota solicitada não existe ou foi movida.</p>
        <div className="mt-4">
          <Link href="/" className="btn btn-primary">Voltar à visão geral</Link>
        </div>
      </section>
    </main>
  );
}