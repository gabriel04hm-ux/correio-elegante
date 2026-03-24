import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const carrinho = body.carrinho

    if (!carrinho || carrinho.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    const items = carrinho.map((item: any) => ({
      title: item.nome,
      quantity: item.quantidade,
      unit_price: item.preco,
      currency_id: "BRL",
    }))

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items,

        metadata: {
          pedido: carrinho,
        },

        external_reference: "pedido_" + Date.now(),

        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" },
            { id: "debit_card" },
            { id: "ticket" },
          ],
        },

        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?status=pending`,
        },

        auto_return: "approved",
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      init_point: data.init_point,
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}