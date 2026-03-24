import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook recebido:", body);

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: false });
    }

    // 🔥 busca dados do pagamento no Mercado Pago
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await paymentRes.json();

    console.log("Pagamento completo:", payment);

    // 🔥 só continua se aprovado
    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // 🔥 aqui vem o segredo: metadata
    const pedido = payment.metadata?.pedido;

    if (!pedido) {
      console.log("Sem metadata");
      return NextResponse.json({ ok: true });
    }

    // 🔥 envia pra planilha
    await fetch("https://script.google.com/macros/s/AKfycbyPWSvP56h4zq8V_UXXOx8sP5bFFbQajksq0NyAVFkA-HWuZMm8sH_iLFpo4-tVmT577A/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        pedido,
      }),
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Erro webhook:", error);
    return NextResponse.json({ ok: false });
  }
}