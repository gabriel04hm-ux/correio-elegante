import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, pedido } = body

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token do Mercado Pago não encontrado no ambiente" },
        { status: 500 }
      )
    }

    if (!rawSiteUrl) {
      return NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_SITE_URL não encontrada no ambiente" },
        { status: 500 }
      )
    }

    const siteUrl = rawSiteUrl.replace(/\/+$/, "")

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Itens inválidos para pagamento" },
        { status: 400 }
      )
    }

    if (!pedido || !Array.isArray(pedido) || pedido.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Pedido inválido" },
        { status: 400 }
      )
    }

    const referencia = `pedido_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const itensFormatados = itens.map((item: any) => ({
      id: String(item.id ?? ""),
      title: String(item.title ?? "Pedido"),
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      currency_id: "BRL",
    }))

    const temPrecoInvalido = itensFormatados.some(
      (item) =>
        !item.title ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price <= 0
    )

    if (temPrecoInvalido) {
      return NextResponse.json(
        {
          ok: false,
          error: "Os itens do pagamento estão com preço ou quantidade inválidos",
          itens: itensFormatados,
        },
        { status: 400 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const preference = new Preference(client)

    const notificationUrl = `${siteUrl}/api/mercadopago/webhook`

    const res = await preference.create({
      body: {
        items: itensFormatados,
        external_reference: referencia,
        metadata: {
          pedido: JSON.stringify(pedido),
          referencia,
        },
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
            { id: "atm" },
          ],
          installments: 1,
        },
        notification_url: notificationUrl,
        back_urls: {
          success: `${siteUrl}/checkout?status=success`,
          failure: `${siteUrl}/checkout?status=failure`,
          pending: `${siteUrl}/checkout?status=pending`,
        },
        auto_return: "approved",
      },
    })

    const linkPagamento = res.init_point || res.sandbox_init_point

    if (!linkPagamento) {
      return NextResponse.json(
        {
          ok: false,
          error: "Mercado Pago não retornou link de pagamento",
          resposta: res,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      init_point: linkPagamento,
      preference_id: res.id,
      referencia,
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