import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardShell() {
  const { pathname } = useLocation();
  const isSourceHub = pathname === "/dashboard";
  const isMeetingView = pathname.startsWith("/dashboard/meeting");
  const isDefaultDashboard = pathname === "/dashboard/default";
  const hideSidebars = isMeetingView || isDefaultDashboard;

  return (
    <div className="h-screen bg-[#0F1117] text-[#e8e4ff] flex flex-col font-sans overflow-hidden">
      {!hideSidebars && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {!hideSidebars && <Sidebar />}
        <main className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
