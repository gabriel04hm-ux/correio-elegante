import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, pedido } = body

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    const client = new MercadoPagoConfig({
      accessToken: token!,
    })

    const preference = new Preference(client)

    const res = await preference.create({
      body: {
        items: itens,
        metadata: {
          pedido: JSON.stringify(pedido), // 🔥 AQUI É A CORREÇÃO
        },
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
      },
    })

    return NextResponse.json({
      ok: true,
      init_point: res.init_point,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }
}