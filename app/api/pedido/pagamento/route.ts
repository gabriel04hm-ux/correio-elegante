import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, numeroPedido } = body

    console.log("Body recebido em /api/pedido/pagamento:", body)

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    if (!token) {
      console.error("Token do Mercado Pago não encontrado")
      return NextResponse.json(
        {
          ok: false,
          error: "Token do Mercado Pago não encontrado no .env.local",
        },
        { status: 500 }
      )
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      console.error("Itens inválidos:", itens)
      return NextResponse.json(
        {
          ok: false,
          error: "Itens inválidos para pagamento",
        },
        { status: 400 }
      )
    }

    const itensFormatados = itens.map((item: any) => ({
      id: String(item.id ?? ""),
      title: String(item.title ?? "Pedido"),
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      currency_id: "BRL",
    }))

    console.log("Itens formatados:", itensFormatados)
    console.log("Site URL:", siteUrl)

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const preference = new Preference(client)

    const res = await preference.create({
      body: {
        items: itensFormatados,
        external_reference: String(numeroPedido || ""),
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
            { id: "atm" },
          ],
          installments: 1,
        },
        back_urls: {
          success: `${siteUrl}/checkout?status=success`,
          failure: `${siteUrl}/checkout?status=failure`,
          pending: `${siteUrl}/checkout?status=pending`,
        },
      },
    })

    console.log("Resposta Mercado Pago:", res)

    return NextResponse.json({
      ok: true,
      init_point: res.init_point,
      sandbox_init_point: res.sandbox_init_point,
      preference_id: res.id,
    })
  } catch (error: any) {
    console.error("Erro detalhado em /api/pedido/pagamento:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao criar pagamento",
        cause: error?.cause || null,
      },
      { status: 500 }
    )
  }
}