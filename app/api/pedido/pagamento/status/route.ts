import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get("paymentId") || ""
    const referencia = req.nextUrl.searchParams.get("referencia") || ""

    if (!paymentId && !referencia) {
      return NextResponse.json(
        { ok: false, error: "paymentId ou referencia não informados" },
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

    const url =
      `${scriptUrl}?paymentId=${encodeURIComponent(paymentId)}` +
      `&referencia=${encodeURIComponent(referencia)}`

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