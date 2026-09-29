import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentMember } from "@/server/authorization/membership";
import { getDashboardState } from "@/server/dashboard-state";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await auth())?.user?.id) redirect("/login");
  const member = await getCurrentMember();
  if (!member) redirect("/acesso-negado");
  return <AppShell initialState={await getDashboardState(member)}>{children}</AppShell>;
}
