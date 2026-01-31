import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, UtensilsCrossed, Eye, QrCode, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/integrations/supabase/client'

function getPublicOrigin() {
  const host = window.location.host
  if (host.endsWith('.lovableproject.com')) {
    const projectId = host.replace('.lovableproject.com', '')
    return `https://id-preview--${projectId}.lovable.app`
  }
  return window.location.origin
}

function ensureHttps(url: string) {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { restaurant, loading: restaurantLoading } = useRestaurant()

  const { categories } = useCategories(restaurant?.id)
  const { products } = useProducts(restaurant?.id)

  const menuUrl = restaurant
    ? ensureHttps(new URL(`/menu/${restaurant.id}`, getPublicOrigin()).toString())
    : ''

  // 🔐 Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login')
  }, [user, authLoading, navigate])

  // 🏪 Crear restaurant si hay compra válida
  useEffect(() => {
    if (!user) return

    const run = async () => {
      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) return

      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('email', user.email)
        .eq('product', 'carta_digital')
        .eq('status', 'completed')
        .maybeSingle()

      if (!purchase) {
        navigate('/no-access')
        return
      }

      await supabase.from('restaurants').insert({
        user_id: user.id,
        name: 'Mi restaurante',
      })
    }

    run()
  }, [user, navigate])

  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando…</div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Categorías',
      value: categories.length,
      icon: FolderOpen,
    },
    {
      title: 'Productos',
      value: products.length,
      icon: UtensilsCrossed,
    },
    {
      title: 'Plantilla',
      value: restaurant?.selected_template ?? 'No seleccionada',
      icon: Eye,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">
          ¡Hola, {restaurant?.name}!
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-5 flex gap-4 items-center">
                <s.icon />
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-xl font-semibold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {restaurant && (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <QrCode /> Código QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-6 flex-col md:flex-row">
              <QRCodeSVG value={menuUrl} size={220} />
              <Button
                onClick={() => window.open(menuUrl, '_blank')}
              >
                Ver menú
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}