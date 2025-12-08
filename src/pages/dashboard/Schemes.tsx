import { useLanguage } from "@/lib/i18n";
import { SchemesCard } from "@/components/dashboard/SchemesCard";

export default function SchemesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Government Schemes</h2>
      <div className="max-w-2xl">
        <SchemesCard />
      </div>
    </div>
  );
}
