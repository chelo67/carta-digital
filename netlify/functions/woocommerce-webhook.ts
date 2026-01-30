import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event) => {
  console.log('=== WEBHOOK RECIBIDO ===')
  console.log('Method:', event.httpMethod)
  console.log('Headers:', event.headers)
  console.log('Body RAW:', event.body)

  // 🔐 Woo valida el endpoint con requests NO JSON
  const contentType = event.headers['content-type'] || ''

  if (!contentType.includes('application/json')) {
    console.log('Request no JSON, ignorado (handshake WooCommerce)')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

let payload: any = null;

try {
  const contentType = event.headers['content-type'] || event.headers['Content-Type'];

  if (contentType?.includes('application/json') && event.body) {
    payload = JSON.parse(event.body);
  } else {
    console.log('Webhook no JSON (verificación Woo)', event.body);
    return {
      statusCode: 200,
      body: 'OK',
    };
  }
} catch (err) {
  console.error('Error parseando JSON', err);
  return {
    statusCode: 200,
    body: 'OK',
  };
}


  // 🛑 Solo nos importa cuando el pedido está COMPLETADO
  if (payload.status !== 'completed') {
    console.log(`Pedido ignorado. Status: ${payload.status}`)
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  const email = payload.billing?.email
  const orderId = payload.id

  // 🛑 Seguridad mínima
  if (!email || !orderId) {
    console.log('Pedido incompleto, ignorado')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  // 🎯 Detectar producto CARTA DIGITAL
  const hasCartaDigital = payload.line_items?.some(
    (item: any) =>
      item.name?.toLowerCase().includes('carta') ||
      item.sku === 'carta_digital'
  )

  if (!hasCartaDigital) {
    console.log('Pedido sin carta digital, ignorado')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  // 🧠 Insertar / actualizar compra
  const { error } = await supabase.from('purchases').upsert({
    email,
    order_id: orderId,
    product: 'carta_digital',
    status: 'active',
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error Supabase:', error)
  } else {
    console.log('Compra carta digital registrada correctamente')
  }

  return {
    statusCode: 200,
    body: 'OK',
  }
}