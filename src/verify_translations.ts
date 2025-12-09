import { translations } from "./lib/translations";

const languages = Object.keys(translations) as Array<keyof typeof translations>;
const enKeys = Object.keys(translations.en);

let hasError = false;

console.log("Verifying translations...");

languages.forEach((lang) => {
  if (lang === 'en') return;
  
  const langKeys = Object.keys(translations[lang]);
  const missingKeys = enKeys.filter(key => !langKeys.includes(key));
  
  if (missingKeys.length > 0) {
    console.error(`\n❌ Missing keys in ${lang}:`);
    missingKeys.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  } else {
    console.log(`✅ ${lang} is complete.`);
  }
});

if (hasError) {
  console.log("\nVerification failed. Please add missing translations.");
  process.exit(1);
} else {
  console.log("\n✨ All translations are complete and verified!");
}