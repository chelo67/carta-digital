import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔒 SOLO backend
)

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const order = JSON.parse(event.body || '{}')

    // Solo órdenes completadas
    if (order.status !== 'completed') {
      return { statusCode: 200, body: 'Ignored' }
    }

    const email = order.billing?.email
    const orderId = order.id
    const lineItems = order.line_items || []

    // Verificar que sea CARTA DIGITAL
    const hasCartaDigital = lineItems.some((item: any) =>
      item.meta_data?.some(
        (meta: any) =>
          meta.key === 'cartel_tipo' &&
          meta.value === 'carta_digital'
      )
    )

    if (!hasCartaDigital) {
      return { statusCode: 200, body: 'Not carta digital' }
    }

    const { error } = await supabase.from('purchases').insert({
      email,
      order_id: orderId,
      product: 'carta_digital',
      status: 'active',
    })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    }
  } catch (err: any) {
    console.error('WEBHOOK ERROR:', err)
    return {
      statusCode: 500,
      body: err.message,
    }
  }
}