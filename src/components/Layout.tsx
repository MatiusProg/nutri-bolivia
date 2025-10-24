import { Outlet, Link } from 'react-router-dom';
import { Leaf, User, LogOut, Search, ChefHat, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-gradient-fresh p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-fresh bg-clip-text text-transparent">
                NutriBolivia
              </span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/alimentos"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" />
                Alimentos
              </Link>
              
              <Link
                to="/recetas"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChefHat className="h-4 w-4" />
                Mis Recetas
              </Link>
              
              <Link
                to="/comunidad"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                Comunidad
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/perfil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => {}} variant="default">
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-semibold">NutriBolivia</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 NutriBolivia. Base de datos nutricional de alimentos bolivianos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
