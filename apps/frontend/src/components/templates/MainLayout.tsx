import { Outlet } from "react-router";

export function MainLayout() {
  return (
    <>
      <header>
        <span>EventOS</span>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}