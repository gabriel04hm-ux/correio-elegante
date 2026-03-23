import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const paymentId = body?.paymentId

    console.log("Recebido paymentId:", paymentId)

    if (!paymentId) {
      return NextResponse.json(
        { ok: false, error: "paymentId não enviado" },
        { status: 400 }
      )
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token não encontrado" },
        { status: 500 }
      )
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
    })

    const payment = new Payment(client)

    const paymentInfo: any = await payment.get({ id: paymentId })

    console.log("Pagamento encontrado:", paymentInfo)

    return NextResponse.json({
      ok: true,
      status: paymentInfo.status,
    })
  } catch (error: any) {
    console.error("Erro verificar:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}