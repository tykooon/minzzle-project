import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HubPage from "./pages/HubPage";
import MinzzleFivesLevelsPage from "./pages/MinzzleFivesLevelsPage";
import MinzzleFivesPlayPage from "./pages/MinzzleFivesPlayPage";
import MinzzleSwipesLevelsPage from "./pages/MinzzleSwipesLevelsPage";
import MinzzleSwipesPlayPage from "./pages/MinzzleSwipesPlayPage";
import MinzzleSwipesHexLevelsPage from "./pages/MinzzleSwipesHexLevelsPage";
import MinzzleSwipesHexPlayPage from "./pages/MinzzleSwipesHexPlayPage";
import NotFound from "./pages/NotFound";
import AdminLevelsPage from "./pages/admin/AdminLevelsPage";
import AdminLevelEditorPage from "./pages/admin/AdminLevelEditorPage";
import AdminLevelSolvePage from "./pages/admin/AdminLevelSolvePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HubPage />} />
          <Route path="/minzzle-fives" element={<MinzzleFivesLevelsPage />} />
          <Route path="/minzzle-fives/play/:levelId" element={<MinzzleFivesPlayPage />} />
          <Route path="/minzzle-swipes" element={<MinzzleSwipesLevelsPage />} />
          <Route path="/minzzle-swipes/play/:levelId" element={<MinzzleSwipesPlayPage />} />
          <Route path="/minzzle-swipes-hex" element={<MinzzleSwipesHexLevelsPage />} />
          <Route path="/minzzle-swipes-hex/play/:levelId" element={<MinzzleSwipesHexPlayPage />} />
          <Route path="/admin/levels" element={<AdminLevelsPage />} />
          <Route path="/admin/levels/new" element={<AdminLevelEditorPage />} />
          <Route path="/admin/levels/:levelId/solve" element={<AdminLevelSolvePage />} />
          <Route path="/admin/levels/:levelId" element={<AdminLevelEditorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
