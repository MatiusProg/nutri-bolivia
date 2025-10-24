import { useState } from 'react';
import { Search, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-fresh">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Leaf className="h-5 w-5 text-white" />
              <span className="text-white font-medium">100% Datos Bolivianos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Base de Datos Nutricional de Bolivia
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Descubre la información nutricional completa de alimentos bolivianos.
              Crea recetas saludables y calcula sus valores nutricionales en tiempo real.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar alimentos: quinua, papa, chuño..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white shadow-fresh"
                />
              </div>
            </div>

            {!user && (
              <div className="mt-8">
                <Button 
                  onClick={signInWithGoogle}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  Crear cuenta gratis
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-8 shadow-card hover:shadow-fresh transition-shadow animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-xl font-bold mb-3">Base de Datos Completa</h3>
            <p className="text-muted-foreground">
              Más de 150 alimentos bolivianos con información nutricional detallada
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-card hover:shadow-fresh transition-shadow animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-bold mb-3">Constructor de Recetas</h3>
            <p className="text-muted-foreground">
              Crea recetas personalizadas y calcula automáticamente sus valores nutricionales
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-card hover:shadow-fresh transition-shadow animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-3">Comunidad Activa</h3>
            <p className="text-muted-foreground">
              Comparte tus recetas y descubre creaciones de otros usuarios
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-primary rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad y comienza a crear recetas saludables hoy mismo
          </p>
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
            onClick={signInWithGoogle}
          >
            Comenzar ahora
          </Button>
        </div>
      </section>
    </div>
  );
}
