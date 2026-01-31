import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

/**
 * =====================================
 * 1️⃣ Inicializar Supabase (SERVICE ROLE)
 * =====================================
 */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * =====================================
 * 2️⃣ Webhook handler
 * =====================================
 */
export const handler: Handler = async (event) => {
  console.log('=== WEBHOOK RECIBIDO ===')
  console.log('Method:', event.httpMethod)
  console.log('Headers:', event.headers)
  console.log('Body RAW:', event.body)

  /**
   * =====================================
   * 3️⃣ WooCommerce handshake (NO JSON)
   * =====================================
   * Woo valida el endpoint enviando requests
   * que NO son JSON → hay que responder 200
   */
  const contentType =
    event.headers['content-type'] ||
    event.headers['Content-Type'] ||
    ''

  if (!contentType.includes('application/json')) {
    console.log('Request no JSON (handshake Woo)')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  /**
   * =====================================
   * 4️⃣ Parse seguro del JSON
   * =====================================
   */
  let payload: any

  try {
    payload = JSON.parse(event.body || '{}')
  } catch (err) {
    console.error('JSON inválido, ignorado', err)
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  /**
   * =====================================
   * 5️⃣ Solo pedidos COMPLETADOS
   * =====================================
   */
  const allowedStatuses = ['completed', 'processing']

if (!allowedStatuses.includes(payload.status)) {
  console.log('Pedido ignorado. Status:', payload.status)
  return {
    statusCode: 200,
    body: 'OK',
  }
}



  /**
   * =====================================
   * 6️⃣ Validaciones básicas
   * =====================================
   */
  const customerEmail = payload.billing?.email?.toLowerCase()
  const orderId = payload.id

  if (!customerEmail || !orderId) {
    console.log('Pedido sin email u orderId')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  /**
   * =====================================
   * 7️⃣ Detectar CARTA DIGITAL
   * (por nombre o SKU)
   * =====================================
   */
  const hasCartaDigital = payload.line_items?.some(
    (item: any) =>
      item.sku === 'carta_digital' ||
      item.name?.toLowerCase().includes('carta')
  )

  if (!hasCartaDigital) {
    console.log('Pedido sin carta digital')
    return {
      statusCode: 200,
      body: 'OK',
    }
  }

  /**
   * =====================================
   * 8️⃣ Buscar o crear usuario en AUTH
   * =====================================
   */
  const { data: users, error: listError } =
    await supabase.auth.admin.listUsers({
      email: customerEmail,
    })

  if (listError) {
    console.error('Error listando usuarios:', listError)
    return { statusCode: 500, body: 'Error listando usuarios' }
  }

  let userId: string

  if (users.users.length > 0) {
    // Usuario existente
    userId = users.users[0].id
    console.log('Usuario existente:', userId)
  } else {
    // Crear usuario CONFIRMADO
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // 👈 CLAVE para evitar "Email not confirmed"
      })

    if (createError || !newUser.user) {
      console.error('Error creando usuario:', createError)
      return { statusCode: 500, body: 'Error creando usuario' }
    }

    userId = newUser.user.id
    console.log('Usuario creado:', userId)
  }

  /**
   * =====================================
   * 9️⃣ Calcular expiración (ej: 1 año)
   * =====================================
   */
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)



    /* ===============================
       4️⃣ CREAR USUARIO EN AUTH
       👉 ESTA ES LA PARTE QUE PREGUNTÁS
    =============================== */

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })

    if (authError && authError.message !== 'User already exists') {
      console.error('Error creando auth user:', authError)
      throw authError
    }

    userId =
      authUser?.user?.id ??
      (
        await supabase.auth.admin.getUserByEmail(email)
      ).data.user?.id

    if (!userId) {
      throw new Error('No se pudo obtener user_id')
    }

    console.log('Auth user ID:', userId)

  /**
   * =====================================
   * 🔟 Insertar compra en purchases
   * =====================================
   */
  const { error: purchaseError } = await supabase
    .from('purchases')
    .upsert(
      {
        user_id: userId,
        email: customerEmail,
        product: 'carta_digital',
        order_id: orderId,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'order_id',
      }
    )

  if (purchaseError) {
    console.error('Error guardando purchase:', purchaseError)
    return { statusCode: 500, body: 'Error guardando purchase' }
  }

  console.log('✅ Compra registrada correctamente')

  /**
   * =====================================
   * 11️⃣ Respuesta final a Woo
   * =====================================
   */
  return {
    statusCode: 200,
    body: 'OK',
  }
}