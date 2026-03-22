import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const { itens, numeroPedido } = await req.json()

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "Token do Mercado Pago não encontrado no .env.local",
        },
        { status: 500 }
      )
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Itens do pagamento não enviados corretamente",
        },
        { status: 400 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const preference = new Preference(client)

    const res = await preference.create({
      body: {
        items: itens,
        external_reference: String(numeroPedido || ""),
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
          ],
          installments: 1,
        },
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
    console.error("Erro em /api/pedido/pagamento:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao criar pagamento",
      },
      { status: 500 }
    )
  }
}