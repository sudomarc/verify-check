import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Tableau de bord — VerifyCheck",
  description: "Suivi de présence scolaire réel par classe, cours et élève.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
