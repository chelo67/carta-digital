import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Utensils, Mail, Lock, Store } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await signUp(email, password, restaurantName);
        if (error) {
          toast({
            title: 'Error al registrarse',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: '¡Bienvenido!',
            description: 'Tu cuenta ha sido creada exitosamente.',
          });
          navigate('/admin');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Error al iniciar sesión',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          navigate('/admin');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Utensils className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' 
              ? 'Accede a tu panel de administración'
              : 'Crea tu menú digital en minutos'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-xl border border-border shadow-lg">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="restaurantName" className="text-sm font-medium">
                Nombre del Restaurante
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="restaurantName"
                  type="text"
                  placeholder="Ej: La Buena Mesa"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            {loading 
              ? 'Cargando...' 
              : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
            }
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-primary font-medium hover:underline"
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-primary font-medium hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
