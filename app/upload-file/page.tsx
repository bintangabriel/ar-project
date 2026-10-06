import UploadFileForm from "@/components/Form/UploadFileForm";

export default function DashboardExamplePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <UploadFileForm />
      </div>
    </main>
  );
}