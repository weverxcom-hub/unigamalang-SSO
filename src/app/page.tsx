import { redirect } from "next/navigation";
import { getSSOSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSSOSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}
