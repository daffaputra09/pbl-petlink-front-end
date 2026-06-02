import { AuthMarketingLayout } from "./AuthMarketingLayout";
import { RegisterStepper } from "./RegisterStepper";

export function AuthShell({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  heroTitle,
  heroSubtitle,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  children: React.ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  return (
    <AuthMarketingLayout heroTitle={heroTitle} heroSubtitle={heroSubtitle}>
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg xl:max-w-xl">
        {step != null && totalSteps != null && (
          <RegisterStepper currentStep={step} totalSteps={totalSteps} />
        )}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 sm:p-7">
          {children}
        </div>
      </div>
    </AuthMarketingLayout>
  );
}
