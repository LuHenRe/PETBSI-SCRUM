"use server";
import { signIn } from "@/auth";

export async function signInEmailAction(formData: FormData) {
  await signIn("nodemailer", { email: formData.get("email"), redirectTo: "/" });
}

export async function signInGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signInPreviewAction() {
  await signIn("preview", { redirectTo: "/" });
}
