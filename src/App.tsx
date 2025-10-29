import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import Alimentos from "./pages/Alimentos";
import RecetasPublicas from "./pages/RecetasPublicas";
import RecipeBuilder from "./pages/RecipeBuilder";
import MisRecetas from "./pages/MisRecetas";
import Perfil from "./pages/Perfil";
import Comunidad from "./pages/Comunidad";
import RecetaDetalle from "./pages/RecetaDetalle";
import RecetasGuardadas from "./pages/RecetasGuardadas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/alimentos" element={<Alimentos />} />
              <Route path="/recetas" element={<RecetasPublicas />} />
              <Route path="/recetas/nueva" element={<RecipeBuilder />} />
              <Route path="/receta/:id" element={<RecetaDetalle />} />
              <Route path="/mis-recetas" element={<MisRecetas />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/comunidad" element={<Comunidad />} />
              <Route path="/recetas-guardadas" element={<RecetasGuardadas />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
