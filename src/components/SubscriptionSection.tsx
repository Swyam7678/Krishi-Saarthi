import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sprout, TrendingUp, Crown, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SubscriptionSection() {
  const { t } = useLanguage();

  const plans = [
    {
      title: t('plan_seasonal_title'),
      price: t('plan_seasonal_price'),
      duration: t('plan_seasonal_duration'),
      description: t('plan_seasonal_desc'),
      icon: <Sprout className="h-6 w-6 text-green-500" />,
      features: [
        t('plan_seasonal_f1'),
        t('plan_seasonal_f2'),
        t('plan_seasonal_f3'),
        t('plan_seasonal_f4'),
      ],
      highlight: false,
    },
    {
      title: t('plan_halfyear_title'),
      price: t('plan_halfyear_price'),
      duration: t('plan_halfyear_duration'),
      description: t('plan_halfyear_desc'),
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      features: [
        t('plan_halfyear_f1'),
        t('plan_halfyear_f2'),
        t('plan_halfyear_f3'),
        t('plan_halfyear_f4'),
      ],
      highlight: true,
    },
    {
      title: t('plan_annual_title'),
      price: t('plan_annual_price'),
      duration: t('plan_annual_duration'),
      description: t('plan_annual_desc'),
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      features: [
        t('plan_annual_f1'),
        t('plan_annual_f2'),
        t('plan_annual_f3'),
        t('plan_annual_f4'),
      ],
      highlight: false,
    },
    {
      title: t('plan_community_title'),
      price: t('plan_community_price'),
      duration: t('plan_community_duration'),
      description: t('plan_community_desc'),
      icon: <Users className="h-6 w-6 text-purple-500" />,
      features: [
        t('plan_community_f1'),
        t('plan_community_f2'),
        t('plan_community_f3'),
        t('plan_community_f4'),
      ],
      highlight: false,
    },
  ];

  return (
    <section className="py-16 px-4 bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{t('pricing_title')}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('pricing_desc')}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card key={index} className={`flex flex-col relative ${plan.highlight ? 'border-primary shadow-lg scale-105 z-10' : 'hover:shadow-md transition-shadow'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {t('most_popular')}
                </div>
              )}
              <CardHeader>
                <div className="mb-2 p-2 bg-muted/20 w-fit rounded-lg">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <CardDescription>{plan.duration}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-2xl font-bold mb-4 text-primary">{plan.price}</div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  {t('choose_plan')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}