import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, ChefHat, Palette, QrCode, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <nav className="container relative z-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">MenuDigital</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button>Empezar Gratis</Button>
            </Link>
          </div>
        </nav>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-semibold text-foreground leading-tight animate-fade-in">
              Tu menú digital en{' '}
              <span className="text-primary">minutos</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto animate-fade-in">
              Crea un menú elegante para tu restaurante. Tus clientes escanean un QR y ven tus platillos al instante.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/register">
                <Button size="lg" className="text-base px-8 h-12">
                  Crear mi menú gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center text-foreground mb-12">
            Todo lo que necesitas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ChefHat,
                title: 'Gestión Simple',
                description: 'Agrega, edita y organiza tus productos y categorías fácilmente desde el panel.',
              },
              {
                icon: Palette,
                title: '4 Plantillas',
                description: 'Elige entre 4 diseños profesionales para mostrar tu menú de la mejor manera.',
              },
              {
                icon: QrCode,
                title: 'Listo para QR',
                description: 'Genera un enlace único para tu menú que tus clientes pueden escanear.',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Empieza hoy mismo
            </h2>
            <p className="text-muted-foreground mb-8">
              Crea tu cuenta gratuita y ten tu menú digital listo en minutos
            </p>
            <Link to="/register">
              <Button size="lg">
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MenuDigital. Hecho con ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
