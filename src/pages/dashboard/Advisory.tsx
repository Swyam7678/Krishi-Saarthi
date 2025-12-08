import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { CropRecommendation } from "@/components/dashboard/CropRecommendation";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";

export default function AdvisoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const getNPK = useAction(api.npk.getLiveNPK);
  const [npk, setNpk] = useState<any>(null);

  useEffect(() => {
    const fetchNPK = async () => {
      if (user?.sheetUrl) {
        try {
          const n = await getNPK({ sheetUrl: user.sheetUrl });
          setNpk(n);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchNPK();
  }, [getNPK, user?.sheetUrl]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('feature_ai')}</h2>
      <div className="max-w-4xl">
        <CropRecommendation npkData={npk} />
      </div>
    </div>
  );
}
