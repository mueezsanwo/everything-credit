import { SignUpData, SignInData, VerifyEmailData, VerifyEmailResponse } from "./interface";
import { apiHandler } from "@/services/api-handler";


export async function signUp(data: SignUpData) {
  return apiHandler("/api/auth/signup", {
    method: "POST",
    body: data,
  });
}

export async function signIn(data: SignInData) {
  return apiHandler("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

export async function verifyEmail(data: VerifyEmailData) {
  return apiHandler<VerifyEmailResponse>("/api/auth/verify-email", {
    method: "POST",
    body: data,
  });
}
