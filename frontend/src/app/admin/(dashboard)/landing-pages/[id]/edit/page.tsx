import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import type { LandingPageAdmin } from "@/lib/api-types";
import { LandingPageForm } from "@/components/admin/LandingPageForm";

export const metadata = { title: "Edit Landing Page · Anniymah Admin" };

interface EditLandingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLandingPage({ params }: EditLandingPageProps) {
  const { id } = await params;

  let page: LandingPageAdmin;
  try {
    page = await serverFetch<LandingPageAdmin>(`/landing-pages/by-id/${id}`);
  } catch {
    notFound();
  }

  return <LandingPageForm page={page} />;
}
