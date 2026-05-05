import { BarChart2 } from "lucide-react";

export default function SkillGapPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
        <BarChart2 size={28} className="text-green-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Skill Gap & Recommendations</h1>
      <p className="text-sm text-gray-500">This page is coming soon.</p>
    </div>
  );
}
