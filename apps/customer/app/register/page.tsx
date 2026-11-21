import { redirect } from "next/navigation";

export default function CustomerRegisterRedirectPage() {
  redirect("/login?mode=signup");
}
