import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec"

async function enviarParaPlanilha(paymentInfo: any) {
  const pedido = paymentInfo?.metadata?.pedido

  if (!pedido || !Array.isArray(pedido) || pedido.length === 0) {
    throw new Error("Pedido não encontrado no metadata")
  }

  const resposta = await fetch(SCRIPT_URL, {
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
  console.log("Resposta Apps Script na verificação:", texto)

  if (!resposta.ok) {
    throw new Error(`Erro ao enviar para planilha: ${texto}`)
  }

  return texto
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const paymentId = String(body?.paymentId || "")

    if (!paymentId) {
      return NextResponse.json(
        { ok: false, error: "paymentId não informado" },
        { status: 400 }
      )
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token do Mercado Pago não encontrado" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const payment = new Payment(client)
    const paymentInfo: any = await payment.get({ id: paymentId })

    console.log("Pagamento consultado na verificação:", JSON.stringify(paymentInfo))

    if (!paymentInfo) {
      return NextResponse.json(
        { ok: false, error: "Pagamento não encontrado" },
        { status: 404 }
      )
    }

    if (paymentInfo.status === "approved") {
      await enviarParaPlanilha(paymentInfo)
    }

    return NextResponse.json({
      ok: true,
      status: paymentInfo.status,
      paymentId: String(paymentInfo.id),
    })
  } catch (error: any) {
    console.error("Erro em /api/mercadopago/verificar:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao verificar pagamento",
      },
      { status: 500 }
    )
  }
}