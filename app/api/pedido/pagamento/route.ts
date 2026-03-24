import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, pedido } = body

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token não encontrado" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const preference = new Preference(client)

    const res = await preference.create({
      body: {
        items: itens,

        metadata: {
          pedido,
        },

        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
          ],
        },

        notification_url: `${siteUrl}/api/mercadopago/webhook`,

        back_urls: {
          success: `${siteUrl}/checkout?status=success`,
          failure: `${siteUrl}/checkout?status=failure`,
          pending: `${siteUrl}/checkout?status=pending`,
        },

        auto_return: "approved",
      },
    })

    return NextResponse.json({
      ok: true,
      init_point: res.init_point,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { ok: false, error: "Erro ao criar pagamento" },
      { status: 500 }
    )
  }
}