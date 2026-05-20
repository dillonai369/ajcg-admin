import { redirect } from "next/navigation";
import { ensureAndGetUserAccess, listAllUserAccess } from "@/lib/access";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users — AJ Commercial Admin" };

export default async function UsersPage() {
  const me = await ensureAndGetUserAccess();
  if (!me) redirect("/sign-in");
  if (!me.is_super_admin) redirect("/admin");

  const users = await listAllUserAccess();
  return <UsersClient users={users} myEmail={me.email} />;
}
