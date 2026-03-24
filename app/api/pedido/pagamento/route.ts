import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, pedido } = body

    if (!itens || itens.length === 0) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 })
    }

    if (!pedido || pedido.length === 0) {
      return NextResponse.json({ error: "Pedido vazio" }, { status: 400 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)

    const res = await preference.create({
      body: {
        items: itens,

        // 🔥 ESSENCIAL PRA PLANILHA
        metadata: {
          pedido: JSON.stringify(pedido),
        },

        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`,

        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=pending`,
        },

        auto_return: "approved",
      },
    })

    return NextResponse.json({
      init_point: res.init_point,
    })

  } catch (error) {
    console.error("Erro pagamento:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}