import { UserAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { userProfile } = UserAuth();

  if (userProfile?.role === 'recruiter') {
    redirect("/recruiter/dashboard");
  } else if (userProfile?.role === 'candidate') {
    redirect("/candidate/dashboard");
  }

  return null;
}
