import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { fronts, projectMemberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const db = getDb();
  
  const [membership] = await db.select().from(projectMemberships)
    .where(and(eq(projectMemberships.userId, session.user.id), eq(projectMemberships.projectId, "petbsi"))).limit(1);
    
  if (membership) redirect("/");

  const allFronts = await db.select().from(fronts).where(eq(fronts.projectId, "petbsi"));

  return (
    <main className="login-page">
      <section className="card login-card" style={{ maxWidth: 500, width: "100%", padding: "2rem", margin: "auto", marginTop: "10vh" }}>
        <h1>Complete seu Cadastro</h1>
        <p className="text-muted mt-2 mb-6">Precisamos de mais alguns detalhes para configurar sua conta no PETBSI.</p>
        <OnboardingForm fronts={allFronts} defaultName={session.user.name || ""} />
      </section>
    </main>
  );
}
