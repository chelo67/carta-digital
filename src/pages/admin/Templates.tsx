import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { MenuTemplate } from '@/lib/types';

const templates: { id: MenuTemplate; name: string; description: string; preview: string }[] = [
  {
    id: 'elegant_images',
    name: 'Elegante con Imágenes',
    description: 'Diseño sofisticado con imágenes grandes y tipografía serif',
    preview: '🖼️',
  },
  {
    id: 'modern_images',
    name: 'Moderno con Imágenes',
    description: 'Grid de productos con imágenes cuadradas y estilo minimalista',
    preview: '📱',
  },
  {
    id: 'minimal_text',
    name: 'Minimalista Texto',
    description: 'Lista simple con líneas punteadas entre nombre y precio',
    preview: '📝',
  },
  {
    id: 'classic_text',
    name: 'Clásico Texto',
    description: 'Diseño tradicional con descripciones e ingredientes visibles',
    preview: '📜',
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { restaurant, updateTemplate } = useRestaurant();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSelectTemplate = async (templateId: MenuTemplate) => {
    const { error } = await updateTemplate(templateId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Plantilla actualizada' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Plantillas</h2>
          <p className="text-muted-foreground">Elige el diseño de tu menú público</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isSelected = restaurant?.selected_template === template.id;
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                      {template.preview}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-medium text-lg">{template.name}</h3>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Preview Link */}
        {restaurant && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-3">
                Previsualiza tu menú con la plantilla seleccionada:
              </p>
              <a
                href={`/menu/${restaurant.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Ver menú público →
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
