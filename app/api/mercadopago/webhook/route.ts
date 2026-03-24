import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const paymentId = body?.data?.id

    if (!paymentId) {
      return NextResponse.json({ ok: false })
    }

    // 🔥 busca pagamento no Mercado Pago
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    )

    const payment = await res.json()

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const pedidoRaw = payment.metadata?.pedido

    if (!pedidoRaw) {
      console.log("SEM METADATA")
      return NextResponse.json({ ok: true })
    }

    const pedido = JSON.parse(pedidoRaw)

    // 🔥 ENVIA PRA PLANILHA
    const resposta = await fetch("https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        pedido,
      }),
    })

    const texto = await resposta.text()
    console.log("RESPOSTA PLANILHA:", texto)

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("Erro webhook:", error)
    return NextResponse.json({ ok: false })
  }
}