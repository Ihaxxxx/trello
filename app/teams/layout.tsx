import { PlanProvider } from "@/lib/contexts/PlanContext";
import { auth } from "@clerk/nextjs/server";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { has } = await auth();
  const hasProPlan = has({ plan: "pro_user" });
  const hasEnterprisePlan = has({ plan: "enterprise_user" });

  return (
    <>
      <Toaster richColors/>
      <PlanProvider
        hasProPlan={hasProPlan}
        hasEnterprisePlan={hasEnterprisePlan}
      >
        {children}
      </PlanProvider>
    </>
  );
}
