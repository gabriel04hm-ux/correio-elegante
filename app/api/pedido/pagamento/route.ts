import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function GET() {
  return NextResponse.json({
    ok: true,
    mensagem: "API de pagamento online. Use POST para criar o pagamento.",
    tokenConfigurado: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    siteUrlConfigurado: process.env.NEXT_PUBLIC_SITE_URL || null,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itens, numeroPedido } = body

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          erro: "Itens do pagamento não enviados.",
        },
        { status: 400 }
      )
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel.",
        },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken,
    })

    const preference = new Preference(client)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const resposta = await preference.create({
      body: {
        items: itens.map((item: any) => ({
          id: String(item.id),
          title: String(item.title),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: "BRL",
        })),
        back_urls: {
          success: `${siteUrl}/checkout?status=success`,
          failure: `${siteUrl}/checkout?status=failure`,
          pending: `${siteUrl}/checkout?status=pending`,
        },
        auto_return: "approved",
        external_reference: numeroPedido ? String(numeroPedido) : undefined,
      },
    })

    return NextResponse.json({
      ok: true,
      init_point: resposta.init_point,
      sandbox_init_point: resposta.sandbox_init_point,
      id: resposta.id,
    })
  } catch (erro: any) {
    console.error("ERRO PAGAMENTO:", erro)

    return NextResponse.json(
      {
        ok: false,
        erro: erro?.message || String(erro),
        detalhe: erro?.cause || null,
      },
      { status: 500 }
    )
  }
}