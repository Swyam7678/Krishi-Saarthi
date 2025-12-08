import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'mr', label: 'मराठी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'bn', label: 'বাংলা' },
  ] as const;

  const currentLabel = languages.find(l => l.code === language)?.label || 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
