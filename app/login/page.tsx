import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <main className="login-page">
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <section className="card login-card">
        <h1>PETBSI Scrum</h1>
        <p className="text-muted mt-2">Entre com a conta Google autorizada para o projeto.</p>
        <form className="mt-4" action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}>
          <button type="submit" className="btn btn-primary">Entrar com Google</button>
        </form>
        <p className="text-muted text-sm mt-3">Se sua conta ainda não estiver cadastrada, solicite acesso à coordenação.</p>
      </section>
    </main>
  );
}
