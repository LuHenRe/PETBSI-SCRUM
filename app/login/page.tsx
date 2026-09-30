import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

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

              <form action={async (formData) => {
                "use server";
                await signIn("nodemailer", { email: formData.get("email"), redirectTo: "/" });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
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

                <button type="submit" style={{ 
                  width: "100%", padding: "0.875rem", borderRadius: "8px", 
                  backgroundColor: '#6b46c1', color: 'white', border: 'none',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem',
                  transition: 'background-color 0.2s'
                }} className="primary-btn">
                  {isRegister ? "Registrar com E-mail" : "Entrar com E-mail"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
                <hr style={{ flex: 1, borderColor: "var(--border)" }} />
                <span style={{ padding: "0 15px", fontSize: "0.8rem", color: "var(--foreground)", opacity: 0.5, textTransform: "uppercase", letterSpacing: '0.05em' }}>ou</span>
                <hr style={{ flex: 1, borderColor: "var(--border)" }} />
              </div>

              <form action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}>
                <button type="submit" style={{ 
                  width: "100%", padding: "0.875rem", borderRadius: "8px", 
                  backgroundColor: 'transparent', color: 'var(--foreground)', 
                  border: '1px solid var(--border)',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }} className="outline-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {isRegister ? "Registrar com Google" : "Entrar com Google"}
                </button>
              </form>

              {/* MODO PREVIEW - TEMPORÁRIO PARA APRESENTAÇÃO */}
              <form action={async () => {
                "use server";
                await signIn("preview", { redirectTo: "/" });
              }} style={{ marginTop: '1rem' }}>
                <button type="submit" style={{ 
                  width: "100%", padding: "0.875rem", borderRadius: "8px", 
                  backgroundColor: '#e2e8f0', color: '#4a5568', 
                  border: '1px dashed #cbd5e0',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }} className="outline-btn" title="Modo Preview (Administrador)">
                  Modo Preview (Temporário)
                </button>
              </form>
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
