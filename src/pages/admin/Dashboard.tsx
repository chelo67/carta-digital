import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, UtensilsCrossed, Eye, QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

//PROBAR
import { supabase } from '@/integrations/supabase/client'



//
function getPublicOrigin() {
  // When running inside the editor sandbox domain, the origin requires a token query param.
  // For QR codes we must generate a truly public URL.
  const host = window.location.host;
  if (host.endsWith('.lovableproject.com')) {
    const projectId = host.replace('.lovableproject.com', '');
    return `https://id-preview--${projectId}.lovable.app`;
  }
  return window.location.origin;
}

function ensureHttps(url: string) {
  // Some mobile scanners treat values without an explicit scheme as plain text.
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/\//, '')}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { categories } = useCategories(restaurant?.id);
  const { products } = useProducts(restaurant?.id);

  const menuUrl = restaurant
    ? ensureHttps(new URL(`/menu/${restaurant.id}`, getPublicOrigin()).toString())
    : '';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);


  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Categorías',
      value: categories.length,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Productos',
      value: products.length,
      icon: UtensilsCrossed,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Plantilla',
      value: restaurant?.selected_template?.replace('_', ' ') || 'No seleccionada',
      icon: Eye,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            ¡Hola, {restaurant?.name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestiona tu menú digital desde aquí
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-semibold text-foreground capitalize">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <QrCode className="w-5 h-5 text-primary" />
              Código QR de tu Menú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Escanea o descarga este código QR para compartir tu menú:
            </p>
            {restaurant && (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-background rounded-xl shadow-sm border border-border">
                  <QRCodeSVG
                    id="qr-code"
                    value={menuUrl}
                    size={240}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Enlace del menú:</p>
                    <code className="text-sm break-all text-foreground">
                      {menuUrl}
                    </code>
                  </div>
                  <Button
                    onClick={() => {
                      const svg = document.getElementById('qr-code');
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL('image/png');
                          const downloadLink = document.createElement('a');
                          downloadLink.download = `qr-menu-${restaurant.name}.png`;
                          downloadLink.href = pngFile;
                          downloadLink.click();
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                      }
                    }}
                    className="w-full md:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar QR
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/admin/products')}
          >
            <CardContent className="p-5">
              <h3 className="font-serif font-medium text-lg mb-2">Agregar Producto</h3>
              <p className="text-sm text-muted-foreground">
                Añade nuevos platillos a tu menú
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/admin/templates')}
          >
            <CardContent className="p-5">
              <h3 className="font-serif font-medium text-lg mb-2">Cambiar Plantilla</h3>
              <p className="text-sm text-muted-foreground">
                Personaliza el diseño de tu menú
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
