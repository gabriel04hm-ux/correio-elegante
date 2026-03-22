import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const dados = await req.json()

    const scriptURL =
      "https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec"

    const resposta = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    })

    const texto = await resposta.text()
    console.log("Resposta Apps Script:", texto)

    if (!resposta.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Erro ao enviar para planilha",
          detalhes: texto,
        },
        { status: 500 }
      )
    }

    try {
      const json = JSON.parse(texto)
      return NextResponse.json(json)
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Apps Script não retornou JSON válido",
          detalhes: texto,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro em /api/pedido:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno em /api/pedido",
      },
      { status: 500 }
    )
  }
}