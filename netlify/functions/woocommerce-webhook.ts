import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function handler(event: any) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body)

    console.log('Order ID:', body.id)
    console.log('Order status:', body.status)

    // 👉 Solo pedidos COMPLETED
    if (body.status !== 'completed') {
      return {
        statusCode: 200,
        body: 'Ignored (order not completed)',
      }
    }

    const email = body.billing?.email
    const orderId = body.id
    const lineItems = body.line_items || []

    if (!email || !orderId) {
      console.error('Missing email or order ID')
      return { statusCode: 400, body: 'Invalid payload' }
    }

    // 👉 Detectar compra de carta digital
    const hasCartaDigital = lineItems.some((item: any) =>
      item.name?.toLowerCase().includes('carta')
    )

    if (!hasCartaDigital) {
      console.log('Order does not include carta digital')
      return {
        statusCode: 200,
        body: 'No carta digital product',
      }
    }

    // 👉 Evitar duplicados
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existing) {
      console.log('Purchase already exists')
      return {
        statusCode: 200,
        body: 'Already processed',
      }
    }

    // 👉 Expiración (1 año)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { error } = await supabase.from('purchases').insert({
      email,
      product: 'carta_digital',
      order_id: orderId,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return { statusCode: 500, body: 'DB error' }
    }

    console.log('Purchase created for', email)

    return {
      statusCode: 200,
      body: 'OK',
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return {
      statusCode: 500,
      body: 'Server error',
    }
  }
}