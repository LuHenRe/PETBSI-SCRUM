import Link from "next/link";
export default function AccessDenied() {
  return <main className="login-page"><section className="card login-card">
    <h1>Acesso não autorizado</h1>
    <p>Sua conta não tem um vínculo ativo com este projeto. Solicite acesso à coordenação.</p>
    <Link href="/login">Voltar ao login</Link>
  </section></main>;
}
