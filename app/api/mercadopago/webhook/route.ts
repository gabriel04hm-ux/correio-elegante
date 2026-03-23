import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const paymentId = body?.data?.id

    if (!paymentId) {
      return NextResponse.json({ ok: false })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    })

    const payment = new Payment(client)
    const paymentInfo: any = await payment.get({ id: paymentId })

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    // 🔥 CORREÇÃO AQUI
    const pedidoRaw = paymentInfo.metadata?.pedido

    if (!pedidoRaw) {
      console.log("Sem pedido no metadata")
      return NextResponse.json({ ok: false })
    }

    const pedido = JSON.parse(pedidoRaw)

    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: String(paymentId),
        pedido,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Erro webhook:", error)
    return NextResponse.json({ ok: false })
  }
}