import { translations } from "./lib/translations";

const languages = Object.keys(translations) as (keyof typeof translations)[];
const enKeys = Object.keys(translations.en);

const missingKeys: Record<string, string[]> = {};

languages.forEach(lang => {
  if (lang === 'en') return;
  // @ts-ignore
  const langKeys = Object.keys(translations[lang]);
  const missing = enKeys.filter(k => !langKeys.includes(k));
  if (missing.length > 0) {
    missingKeys[lang] = missing;
  }
});

if (Object.keys(missingKeys).length > 0) {
  console.log("Found missing translation keys:");
  console.log(JSON.stringify(missingKeys, null, 2));
  process.exit(1);
} else {
  console.log("All translations are complete!");
  process.exit(0);
}
