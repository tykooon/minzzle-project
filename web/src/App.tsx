import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HubPage from "./pages/HubPage";
import MinzzleFivesLevelsPage from "./pages/MinzzleFivesLevelsPage";
import MinzzleFivesPlayPage from "./pages/MinzzleFivesPlayPage";
import MinzzleSwipesConfigPage from "./pages/MinzzleSwipesConfigPage";
import MinzzleSwipesPlayPage from "./pages/MinzzleSwipesPlayPage";
import MinzzleSwipesHexConfigPage from "./pages/MinzzleSwipesHexConfigPage";
import MinzzleSwipesHexPlayPage from "./pages/MinzzleSwipesHexPlayPage";
import NotFound from "./pages/NotFound";
import AdminLevelsPage from "./pages/admin/AdminLevelsPage";
import AdminLevelEditorPage from "./pages/admin/AdminLevelEditorPage";
import AdminLevelSolvePage from "./pages/admin/AdminLevelSolvePage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HubPage />} />
            <Route path="/minzzle-fives" element={<MinzzleFivesLevelsPage />} />
            <Route path="/minzzle-fives/play/:levelId" element={<MinzzleFivesPlayPage />} />
            <Route path="/minzzle-swipes" element={<MinzzleSwipesConfigPage />} />
            <Route path="/minzzle-swipes/play" element={<MinzzleSwipesPlayPage />} />
            <Route path="/minzzle-swipes-hex" element={<MinzzleSwipesHexConfigPage />} />
            <Route path="/minzzle-swipes-hex/play" element={<MinzzleSwipesHexPlayPage />} />
            <Route path="/admin/levels" element={<ProtectedRoute requireAdmin><AdminLevelsPage /></ProtectedRoute>} />
            <Route path="/admin/levels/new" element={<ProtectedRoute requireAdmin><AdminLevelEditorPage /></ProtectedRoute>} />
            <Route path="/admin/levels/:levelId/solve" element={<ProtectedRoute requireAdmin><AdminLevelSolvePage /></ProtectedRoute>} />
            <Route path="/admin/levels/:levelId" element={<ProtectedRoute requireAdmin><AdminLevelEditorPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
