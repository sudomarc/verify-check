import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Tableau de bord — VerifyCheck",
  description: "Maquette du suivi de présence scolaire par classe, cours et élève.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
