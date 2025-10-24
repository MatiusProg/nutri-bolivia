import { useState } from 'react';
import { ChefHat, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RecetasPublicas() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleCreateRecipe = () => {
    // Usuarios públicos pueden crear recetas temporales
    navigate('/recetas/nueva');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Creador de Recetas
              </h1>
              <p className="text-muted-foreground mt-1">
                Crea recetas nutritivas y calcula su valor nutricional
              </p>
            </div>
          </div>

          <Button onClick={handleCreateRecipe} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nueva Receta
          </Button>
        </div>

        {/* Info Banner */}
        {!user && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Modo Público</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Puedes crear y calcular recetas libremente. Para guardar tus recetas y acceder a ellas más tarde, necesitas una cuenta gratuita.
                </p>
                <Button onClick={() => setShowAuthDialog(true)} variant="outline" size="sm">
                  Crear Cuenta Gratis
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 text-center hover:shadow-lg transition-all animate-fade-up">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="font-semibold mb-2">Busca Ingredientes</h3>
          <p className="text-sm text-muted-foreground">
            Explora nuestra base de datos con 156+ alimentos bolivianos
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧮</span>
          </div>
          <h3 className="font-semibold mb-2">Calcula Nutrientes</h3>
          <p className="text-sm text-muted-foreground">
            Calcula automáticamente calorías, proteínas, carbohidratos y más
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💾</span>
          </div>
          <h3 className="font-semibold mb-2">Guarda y Comparte</h3>
          <p className="text-sm text-muted-foreground">
            {user ? 'Guarda tus recetas favoritas' : 'Crea cuenta para guardar tus recetas'}
          </p>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-subtle rounded-2xl border p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">¿Cómo empezar?</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold mb-2">Explora Alimentos</h3>
            <p className="text-sm text-muted-foreground">
              Busca en nuestra base de datos de alimentos bolivianos
            </p>
            <Button variant="link" onClick={() => navigate('/alimentos')} className="mt-2">
              Ver Alimentos →
            </Button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold mb-2">Crea tu Receta</h3>
            <p className="text-sm text-muted-foreground">
              Añade ingredientes y cantidades personalizadas
            </p>
            <Button variant="link" onClick={handleCreateRecipe} className="mt-2">
              Crear Ahora →
            </Button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold mb-2">Guarda y Comparte</h3>
            <p className="text-sm text-muted-foreground">
              {user ? 'Guarda tus recetas en tu perfil' : 'Crea cuenta para guardar'}
            </p>
            {!user && (
              <Button variant="link" onClick={() => setShowAuthDialog(true)} className="mt-2">
                Crear Cuenta →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Cuenta Gratis</DialogTitle>
            <DialogDescription>
              Inicia sesión para guardar tus recetas y acceder a ellas desde cualquier dispositivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              onClick={() => {
                signInWithGoogle();
                setShowAuthDialog(false);
              }}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Al continuar, aceptas nuestros términos y condiciones
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
