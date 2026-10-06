import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { EmailForm, GoogleForm } from "./components";

export default async function LoginPage(props: { searchParams: Promise<{ verifyRequest?: string, mode?: string }> }) {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  const searchParams = await props.searchParams;
  const isVerifyRequest = searchParams?.verifyRequest === "1";
  const isRegister = searchParams?.mode === "register";

  return (
    <main style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}><ThemeToggle /></div>
      
      {/* Esquerda - Gráfico/Texto */}
      <section style={{
        flex: 1,
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url("/login-bg.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 150%, white 10%, transparent 50%)' }} />
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>PETBSI Scrum</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.5 }}>
            {isRegister 
              ? "Crie sua conta para começar a gerenciar os projetos e sprints de forma ágil."
              : "Bem-vindo de volta! Entre na sua conta para continuar gerenciando o projeto."}
          </p>
        </div>
      </section>

      {/* Direita - Formulário */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--background)',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {isVerifyRequest ? (
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(49, 151, 149, 0.1)', border: '1px solid #319795', borderRadius: '8px', color: '#319795' }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 600 }}>Verifique seu e-mail!</h2>
              <p style={{ fontSize: "0.9rem" }}>Enviamos um link seguro de acesso para você. Clique no link para entrar automaticamente.</p>
            </div>
          ) : (
            <>
              {/* Segmented Control para alternar entre Login e Registro de forma mais clara */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                borderRadius: '10px', 
                padding: '4px', 
                marginBottom: '2rem' 
              }}>
                <Link href="/login" style={{ 
                  flex: 1, textAlign: 'center', padding: '0.6rem', borderRadius: '8px', 
                  backgroundColor: isRegister ? 'transparent' : 'var(--background)', 
                  color: isRegister ? 'var(--foreground)' : 'var(--foreground)', 
                  opacity: isRegister ? 0.6 : 1,
                  fontWeight: isRegister ? 'normal' : '600', 
                  boxShadow: isRegister ? 'none' : '0 2px 4px rgba(0,0,0,0.05)', 
                  textDecoration: 'none', transition: 'all 0.2s' 
                }}>
                  Login
                </Link>
                <Link href="/login?mode=register" style={{ 
                  flex: 1, textAlign: 'center', padding: '0.6rem', borderRadius: '8px', 
                  backgroundColor: isRegister ? 'var(--background)' : 'transparent', 
                  color: isRegister ? 'var(--foreground)' : 'var(--foreground)', 
                  opacity: isRegister ? 1 : 0.6,
                  fontWeight: isRegister ? '600' : 'normal', 
                  boxShadow: isRegister ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                  textDecoration: 'none', transition: 'all 0.2s' 
                }}>
                  Criar Conta
                </Link>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                {isRegister ? "Comece agora" : "Acesse sua conta"}
              </h2>

              <EmailForm isRegister={isRegister} />

              <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
                <hr style={{ flex: 1, borderColor: "var(--border)" }} />
                <span style={{ padding: "0 15px", fontSize: "0.8rem", color: "var(--foreground)", opacity: 0.5, textTransform: "uppercase", letterSpacing: '0.05em' }}>ou</span>
                <hr style={{ flex: 1, borderColor: "var(--border)" }} />
              </div>

              <GoogleForm isRegister={isRegister} />

            </>
          )}
        </div>
      </section>

      {/* Lógica Responsiva e Hover */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          main > section:first-child {
            display: none !important;
          }
        }
        .email-input:focus {
          border-color: #6b46c1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.2);
        }
        .primary-btn:hover {
          background-color: #553c9a !important;
        }
        .outline-btn:hover {
          background-color: rgba(107, 70, 193, 0.05) !important;
        }
      `}} />
    </main>
  );
}
