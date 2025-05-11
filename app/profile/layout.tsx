import { auth } from "@clerk/nextjs/server";
import React from "react";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  return <section>{children}</section>;
}
