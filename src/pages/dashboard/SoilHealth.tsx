import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { NPKCard } from "@/components/dashboard/NPKCard";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";

export default function SoilHealthPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const getNPK = useAction(api.npk.getLiveNPK);
  const updateUser = useMutation(api.users.updateUser);
  const [npk, setNpk] = useState<any>(null);
  const [sheetUrl, setSheetUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user?.sheetUrl) setSheetUrl(user.sheetUrl);
  }, [user]);

  useEffect(() => {
    const fetchNPK = async () => {
      try {
        const n = await getNPK({ sheetUrl });
        setNpk(n);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNPK();
  }, [getNPK, sheetUrl]);

  const handleSheetUrlChange = (newUrl: string | undefined) => {
    setSheetUrl(newUrl);
    if (user) updateUser({ sheetUrl: newUrl || "" });
    toast.success(newUrl ? t('success') : t('reset'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('feature_soil')}</h2>
      <div className="max-w-2xl">
        <NPKCard data={npk} onSheetUrlChange={handleSheetUrlChange} currentUrl={sheetUrl} />
      </div>
    </div>
  );
}
