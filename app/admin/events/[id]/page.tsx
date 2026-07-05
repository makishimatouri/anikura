import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EventForm from "@/components/admin/EventForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">编辑活动</h1>
      <EventForm initialData={event} />
    </div>
  );
}
