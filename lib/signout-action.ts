"use server";

import { auth, signOut } from "@/auth";

export async function signOutAction() {
  await signOut();
}

export async function getUser() {
  const session = await auth();
  if (!session || !session.user) return null;
  return session.user;
}