import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json(
        { ok: false, error: "paymentId não informado" },
        { status: 400 }
      )
    }

    const scriptUrl =
      process.env.GOOGLE_SCRIPT_URL || process.env.URL_DO_SCRIPT_DO_GOOGLE

    if (!scriptUrl) {
      return NextResponse.json(
        { ok: false, error: "GOOGLE_SCRIPT_URL não configurada" },
        { status: 500 }
      )
    }

    const url = `${scriptUrl}?paymentId=${encodeURIComponent(paymentId)}`
    const resposta = await fetch(url, { method: "GET" })
    const texto = await resposta.text()

    let json: any = null

    try {
      json = JSON.parse(texto)
    } catch {
      return NextResponse.json(
        { ok: false, error: "Resposta inválida do Apps Script", resposta: texto },
        { status: 500 }
      )
    }

    return NextResponse.json(json)
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro ao consultar status do pagamento",
      },
      { status: 500 }
    )
  }
}