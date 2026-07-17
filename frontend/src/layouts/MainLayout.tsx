import { ReactNode } from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import BottomBar from "../components/common/BottomBar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="w-screen h-screen carbon-bg text-[#f8fafc] flex overflow-hidden font-sans relative">
      {/* Moving Cyber Grid Background */}
      <div className="absolute inset-0 f1-cyber-grid pointer-events-none z-0" />

      {/* Futuristic F1 Ambient Glows (Vignettes) */}
      <div className="absolute top-[-25%] left-[-10%] w-[65%] h-[65%] rounded-full bg-blue-950/15 blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-blue-900/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-sky-950/5 blur-[120px] pointer-events-none z-0" />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header bar */}
        <Header />

        {/* Scrollable central screen display */}
        <main className="flex-1 overflow-y-auto relative bg-[#050816]/30">
          {children}
        </main>

        {/* Bottom logging Status Bar */}
        <BottomBar />
      </div>
    </div>
  );
}