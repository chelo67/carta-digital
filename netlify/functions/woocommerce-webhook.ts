import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  try {
    console.log('=== WEBHOOK RECIBIDO ===')
    console.log('Method:', event.httpMethod)
    console.log('Headers:', event.headers)
    console.log('Body RAW:', event.body)

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    }
  } catch (error) {
    console.error('WEBHOOK ERROR:', error)

    return {
      statusCode: 200, // ⚠️ OJO: igual devolvemos 200 para que Woo no reintente
      body: JSON.stringify({ ok: false }),
    }
  }
}