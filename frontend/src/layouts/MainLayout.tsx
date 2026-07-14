import { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import BottomBar from "../components/common/BottomBar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden font-sans relative transition-colors duration-200">
      {/* Decorative BMW ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-400/10 blur-[150px] pointer-events-none" />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header bar */}
        <Header />

        {/* Scrollable central screen display */}
        <main className="flex-1 overflow-y-auto relative bg-[var(--bg-secondary)]/30">
          {children}
        </main>

        {/* Bottom logging Status Bar */}
        <BottomBar />
      </div>
    </div>
  );
}