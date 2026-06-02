const STEPS = ["Akun", "Profil", "Jam", "Bank"] as const;

export function RegisterStepper({
  currentStep,
  totalSteps = 4,
}: {
  currentStep: number;
  totalSteps?: number;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
        <span>
          Langkah {currentStep} dari {totalSteps}
        </span>
        <span>{STEPS[currentStep - 1] ?? ""}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="hidden sm:flex justify-between mt-3 gap-1">
        {STEPS.slice(0, totalSteps).map((label, i) => {
          const stepNum = i + 1;
          const active = stepNum === currentStep;
          const done = stepNum < currentStep;
          return (
            <div
              key={label}
              className={`flex-1 text-center text-[10px] font-semibold uppercase tracking-wide ${
                active
                  ? "text-emerald-700"
                  : done
                    ? "text-emerald-500"
                    : "text-gray-300"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
