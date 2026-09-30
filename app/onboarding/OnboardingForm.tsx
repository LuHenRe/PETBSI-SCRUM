"use client";

import { useState } from "react";
import { registerMember } from "./actions";

interface Front {
  id: string;
  name: string;
}

export function OnboardingForm({ fronts, defaultName }: { fronts: Front[], defaultName: string }) {
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);

  return (
    <form action={async (formData) => {
      setLoading(true);
      await registerMember(formData);
    }} className="flex flex-col gap-4">
      <div>
        <label className="label">Nome Completo</label>
        <input name="name" type="text" defaultValue={defaultName} required className="input w-full" style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", width: "100%" }} />
      </div>

      <div>
        <label className="label">Qual é o seu papel no projeto?</label>
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="input w-full" style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", width: "100%" }}>
          <option value="MEMBER">Sou bolsista</option>
          <option value="COORDINATOR">Sou coordenador</option>
        </select>
      </div>

      {role === "MEMBER" && (
        <>
          <div>
            <label className="label">Frente Primária (Obrigatória)</label>
            <select name="primaryFront" required className="input w-full" style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", width: "100%" }}>
              <option value="">Selecione uma frente...</option>
              {fronts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Frente Secundária (Opcional)</label>
            <select name="secondaryFront" className="input w-full" style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", width: "100%" }}>
              <option value="">Nenhuma (Opcional)</option>
              {fronts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{ padding: "0.75rem" }}>
        {loading ? "Salvando..." : "Concluir Cadastro"}
      </button>
    </form>
  );
}
