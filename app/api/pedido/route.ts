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
      }
    )

    const texto = await response.text()
    const resultado = JSON.parse(texto)

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