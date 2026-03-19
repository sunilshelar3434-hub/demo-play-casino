import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BalanceProvider } from "@/contexts/BalanceContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";
import LiveChat from "@/components/LiveChat";
import Index from "./pages/Index";
import DiceGame from "./pages/DiceGame";
import PlinkoGame from "./pages/PlinkoGame";
import CrashGame from "./pages/CrashGame";
import MinesGame from "./pages/MinesGame";
import CasinoPage from "./pages/CasinoPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BalanceProvider>
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <TopNavbar />
                <div className="flex flex-1 overflow-hidden">
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/casino" element={<CasinoPage />} />
                      <Route path="/dice" element={<DiceGame />} />
                      <Route path="/plinko" element={<PlinkoGame />} />
                      <Route path="/crash" element={<CrashGame />} />
                      <Route path="/mines" element={<MinesGame />} />
                      <Route path="/sports" element={<PlaceholderPage title="Sports Betting" />} />
                      <Route path="/promotions" element={<PlaceholderPage title="Promotions" />} />
                      <Route path="/vip" element={<PlaceholderPage title="VIP Club" />} />
                      <Route path="/wallet" element={<PlaceholderPage title="Wallet" />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <LiveChat />
                </div>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </BalanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
