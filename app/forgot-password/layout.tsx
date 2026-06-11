import { Suspense } from "react";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-gray-50 text-sm text-gray-500">
          Memuat...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
