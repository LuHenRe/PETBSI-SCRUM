"use client";

import { useEffect } from "react";
import { hydrateStore } from "@/lib/store";

export function StoreHydrator() {
  useEffect(() => {
    hydrateStore();
  }, []);
  return null;
}