import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("Webhook recebido:", JSON.stringify(body))

    const paymentId = body?.data?.id

    if (!paymentId) {
      console.log("Webhook sem paymentId")
      return NextResponse.json(
        { ok: false, error: "paymentId não encontrado" },
        { status: 400 }
      )
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL

    if (!token) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN não encontrada")
      return NextResponse.json(
        { ok: false, error: "Token não configurado" },
        { status: 500 }
      )
    }

    if (!scriptUrl) {
      console.error("GOOGLE_SCRIPT_URL não encontrada")
      return NextResponse.json(
        { ok: false, error: "GOOGLE_SCRIPT_URL não configurada" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const payment = new Payment(client)
    const paymentInfo: any = await payment.get({ id: String(paymentId) })

    console.log("Pagamento encontrado:", {
      id: paymentId,
      status: paymentInfo?.status,
    })

    if (paymentInfo?.status !== "approved") {
      return NextResponse.json({
        ok: true,
        status: paymentInfo?.status || "desconhecido",
      })
    }

    const pedidoRaw = paymentInfo?.metadata?.pedido

    if (!pedidoRaw) {
      console.log("Sem pedido no metadata")
      return NextResponse.json(
        { ok: false, error: "metadata.pedido ausente" },
        { status: 400 }
      )
    }

    let pedido: any[] = []

    try {
      pedido = JSON.parse(pedidoRaw)
    } catch (error) {
      console.error("Erro ao converter metadata.pedido:", error)
      return NextResponse.json(
        { ok: false, error: "metadata.pedido inválido" },
        { status: 400 }
      )
    }

    if (!Array.isArray(pedido) || pedido.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Pedido vazio ou inválido" },
        { status: 400 }
      )
    }

    const respostaPlanilha = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: String(paymentId),
        pedido,
      }),
    })

    const textoPlanilha = await respostaPlanilha.text()

    console.log("Resposta Apps Script:", respostaPlanilha.status, textoPlanilha)

    if (!respostaPlanilha.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Erro ao enviar para a planilha",
          status: respostaPlanilha.status,
          resposta: textoPlanilha,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      paymentId: String(paymentId),
      respostaPlanilha: textoPlanilha,
    })
  } catch (error: any) {
    console.error("Erro webhook:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno no webhook",
      },
      { status: 500 }
    )
  }
}