import { Outlet } from "react-router";

export function MainLayout() {
  return (
    <>
      <header className="bg-primary px-4 py-5">
        <span className="font-merriweather font-bold text-[36px] text-white">EventOS</span>
      </header>

      <main className="px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}