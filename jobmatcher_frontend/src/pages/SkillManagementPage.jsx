import { Layers } from "lucide-react";

export default function SkillManagementPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Layers size={28} className="text-blue-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Skill Management</h1>
      <p className="text-sm text-gray-500">This page is coming soon.</p>
    </div>
  );
}
