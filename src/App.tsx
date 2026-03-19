import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BalanceProvider } from "@/contexts/BalanceContext";
import TopBar from "@/components/TopBar";
import Index from "./pages/Index.tsx";
import DiceGame from "./pages/DiceGame.tsx";
import PlinkoGame from "./pages/PlinkoGame.tsx";
import CrashGame from "./pages/CrashGame.tsx";
import MinesGame from "./pages/MinesGame.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BalanceProvider>
        <BrowserRouter>
          <TopBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dice" element={<DiceGame />} />
            <Route path="/plinko" element={<PlinkoGame />} />
            <Route path="/crash" element={<CrashGame />} />
            <Route path="/mines" element={<MinesGame />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BalanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
