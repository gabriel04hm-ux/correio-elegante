import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const pedido = await req.json()

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
        redirect: "follow",
      }
    )

    const texto = await response.text()

    let resultado: any

    try {
      resultado = JSON.parse(texto)
    } catch {
      console.error("Resposta inválida do Apps Script:", texto)

      return NextResponse.json(
        {
          ok: false,
          erro: "Resposta inválida do Apps Script",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(resultado)
  } catch (erro) {
    console.error("ERRO API:", erro)

    return NextResponse.json(
      {
        ok: false,
        erro: String(erro),
      },
      { status: 500 }
    )
  }
}