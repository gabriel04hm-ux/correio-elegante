import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

function extrairPaymentId(body: any, req: NextRequest) {
  return (
    body?.data?.id ||
    body?.id ||
    req.nextUrl.searchParams.get("data.id") ||
    req.nextUrl.searchParams.get("id") ||
    req.nextUrl.searchParams.get("resource.id") ||
    null
  )
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {}

    try {
      body = await req.json()
    } catch {
      body = {}
    }

    console.log("Webhook recebido:", JSON.stringify(body))
    console.log("Query params webhook:", req.nextUrl.search)

    const paymentId = extrairPaymentId(body, req)

    if (!paymentId) {
      console.log("Webhook sem paymentId")
      return NextResponse.json(
        {
          ok: true,
          ignorado: true,
          motivo: "paymentId não encontrado",
        },
        { status: 200 }
      )
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const scriptUrl =
      process.env.GOOGLE_SCRIPT_URL || process.env.URL_DO_SCRIPT_DO_GOOGLE

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
      id: String(paymentId),
      status: paymentInfo?.status,
      metadata: paymentInfo?.metadata,
    })

    if (paymentInfo?.status !== "approved") {
      return NextResponse.json(
        {
          ok: true,
          ignorado: true,
          paymentId: String(paymentId),
          status: paymentInfo?.status || "desconhecido",
        },
        { status: 200 }
      )
    }

    const pedidoRaw = paymentInfo?.metadata?.pedido
    const referencia = String(
      paymentInfo?.metadata?.referencia ||
        paymentInfo?.external_reference ||
        ""
    ).trim()

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
        referencia,
        pedido,
      }),
    })

    const textoPlanilha = await respostaPlanilha.text()

    console.log("Resposta Apps Script:", respostaPlanilha.status, textoPlanilha)

    let jsonPlanilha: any = null

    try {
      jsonPlanilha = JSON.parse(textoPlanilha)
    } catch {
      jsonPlanilha = null
    }

    if (!respostaPlanilha.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Erro HTTP ao enviar para a planilha",
          status: respostaPlanilha.status,
          resposta: textoPlanilha,
        },
        { status: 500 }
      )
    }

    if (jsonPlanilha && jsonPlanilha.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "Apps Script retornou erro",
          resposta: jsonPlanilha,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        paymentId: String(paymentId),
        referencia,
        respostaPlanilha: jsonPlanilha || textoPlanilha,
      },
      { status: 200 }
    )
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

export async function GET(req: NextRequest) {
  console.log("GET no webhook:", req.nextUrl.search)

  return NextResponse.json(
    {
      ok: true,
      mensagem: "Webhook online",
      query: req.nextUrl.search,
    },
    { status: 200 }
  )
}