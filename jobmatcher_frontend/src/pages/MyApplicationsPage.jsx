import { ClipboardCheck } from "lucide-react";

export default function MyApplicationsPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
        <ClipboardCheck size={28} className="text-purple-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
      <p className="text-sm text-gray-500">This page is coming soon.</p>
    </div>
  );
}
