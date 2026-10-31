import React from "react";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  generalError?: string;
}

export function AuthLayout({ title, children, generalError }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-1000px)] items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-sm border border-gray-100">
        <h1 className="mb-10 text-center text-3xl font-merriweather font-bold text-[36px] text-gray-900">
          {title}
        </h1>

        {generalError && (
          <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-eventos-error border border-red-200">
            {generalError}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}