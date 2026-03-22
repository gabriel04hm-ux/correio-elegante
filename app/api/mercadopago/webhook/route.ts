import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    const id =
      url.searchParams.get("id") ||
      url.searchParams.get("data.id")

    console.log("Webhook recebido:", { topic, id })

    if (!id) {
      const bodySemId = await req.text()
      console.log("Webhook sem id no query:", bodySemId)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!token) {
      console.error("Token do Mercado Pago não encontrado no webhook")
      return NextResponse.json(
        { ok: false, error: "Token não encontrado" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const payment = new Payment(client)
    const paymentInfo: any = await payment.get({ id })

    console.log("Pagamento consultado:", JSON.stringify(paymentInfo))

    if (!paymentInfo || paymentInfo.status !== "approved") {
      return NextResponse.json({
        ok: true,
        ignored: true,
        status: paymentInfo?.status || "unknown",
      })
    }

    const pedido = paymentInfo.metadata?.pedido

    if (!pedido || !Array.isArray(pedido) || pedido.length === 0) {
      console.error("Pedido não encontrado no metadata")
      return NextResponse.json(
        { ok: false, error: "Pedido não encontrado no metadata" },
        { status: 400 }
      )
    }

    const scriptURL =
      "https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec"

    const resposta = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: String(paymentInfo.id),
        pedido,
      }),
    })

    const texto = await resposta.text()
    console.log("Resposta Apps Script no webhook:", texto)

    if (!resposta.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Erro ao enviar pedido aprovado para planilha",
          detalhes: texto,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      enviadoParaPlanilha: true,
    })
  } catch (error: any) {
    console.error("Erro no webhook do Mercado Pago:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno no webhook",
      },
      { status: 500 }
    )
  }
}