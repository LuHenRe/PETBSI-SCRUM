import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { fronts, projectMemberships, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const db = getDb();
  
  const [memberStatus] = await db.select({
    hasMembership: projectMemberships.id,
    enabled: users.enabled
  }).from(users)
    .leftJoin(projectMemberships, and(eq(projectMemberships.userId, users.id), eq(projectMemberships.projectId, "petbsi")))
    .where(eq(users.id, session.user.id)).limit(1);
    
  if (memberStatus?.hasMembership) {
    if (memberStatus.enabled) {
      redirect("/");
    } else {
      redirect("/acesso-negado");
    }
  }

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
