"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react"

function CheckoutConteudo() {
  const searchParams = useSearchParams()

  const statusUrl = searchParams.get("status") || "pending"

  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    searchParams.get("paymentId") ||
    ""

  const referencia =
    searchParams.get("external_reference") ||
    localStorage.getItem("referenciaPagamentoAtual") ||
    ""

  const [statusReal, setStatusReal] = useState<string>(statusUrl)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function verificarPagamento() {
      try {
        console.log("statusUrl:", statusUrl)
        console.log("paymentId:", paymentId)
        console.log("referencia:", referencia)

        if (!paymentId && !referencia) {
          if (ativo) {
            setStatusReal(statusUrl || "pending")
            setCarregando(false)
          }
          return
        }

        const resposta = await fetch(
          `/api/pedido/pagamento/status?paymentId=${encodeURIComponent(
            paymentId
          )}&referencia=${encodeURIComponent(referencia)}`
        )

        const dados = await resposta.json()

        console.log("retorno /api/pedido/pagamento/status:", dados)

        if (!ativo) return

        if (dados?.ok && dados?.aprovado) {
          setStatusReal("success")

          localStorage.removeItem("carrinho")
          localStorage.removeItem("carrinhoDados")
          localStorage.removeItem("carrinhoWhats")
          localStorage.removeItem("referenciaPagamentoAtual")
        } else {
          setStatusReal(statusUrl || "pending")
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)

        if (ativo) {
          setStatusReal(statusUrl || "pending")
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    verificarPagamento()

    const intervalo = setInterval(verificarPagamento, 4000)

    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [paymentId, referencia, statusUrl])

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f2ebe4_52%,#fbf8f5_100%)] p-4 text-[#241718]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="rounded-full border border-[#eaded6] bg-white p-2.5 shadow-sm transition hover:bg-[#f6eee8] active:scale-95"
          >
            <ArrowLeft size={22} className="text-[#6B0F1A]" />
          </button>

          <h1 className="text-2xl font-extrabold text-[#6B0F1A]">Pagamento</h1>

          <Link
            href="/cart"
            className="rounded-full border border-[#eaded6] bg-white p-2.5 shadow-sm"
          >
            <ShoppingCart size={22} className="text-[#6B0F1A]" />
          </Link>
        </div>

        <div className="rounded-[32px] border border-[#eaded6] bg-white p-6 text-center shadow-[0_18px_42px_rgba(74,9,18,0.10)] sm:p-8">
          {carregando && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f3ebe4]">
                <Clock3 size={40} className="text-[#8A2132]" />
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[#241718]">
                Verificando pagamento
              </h2>

              <p className="mt-2 leading-relaxed text-[#6f5d5d]">
                Aguarde um instante enquanto confirmamos seu pagamento.
              </p>

              <div className="mx-auto mt-6 h-2 w-40 overflow-hidden rounded-full bg-[#efe7df]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,#6B0F1A_0%,#A13A4D_100%)]" />
              </div>
            </>
          )}

          {!carregando && statusReal === "success" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f7ee] shadow-[0_10px_24px_rgba(34,197,94,0.14)]">
                <CheckCircle2 size={42} className="text-green-600" />
              </div>

              <div className="mx-auto mt-4 w-fit rounded-full bg-[#edf8f1] px-4 py-1 text-xs font-bold tracking-wide text-green-700">
                PAGAMENTO CONFIRMADO
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-[#241718]">
                Pagamento aprovado
              </h2>

              <p className="mt-2 leading-relaxed text-[#6f5d5d]">
                Seu pagamento foi confirmado com sucesso e o pedido já foi registrado.
              </p>

              {paymentId && (
                <div className="mt-5 rounded-2xl bg-[#fbf8f5] p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A2132]">
                    Detalhe do pagamento
                  </p>
                  <p className="mt-2 break-all text-sm text-[#5f4d4d]">
                    ID do pagamento: <span className="font-semibold">{paymentId}</span>
                  </p>
                </div>
              )}
            </>
          )}

          {!carregando && statusReal === "pending" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff5d8] shadow-[0_10px_24px_rgba(234,179,8,0.14)]">
                <Clock3 size={42} className="text-yellow-600" />
              </div>

              <div className="mx-auto mt-4 w-fit rounded-full bg-[#fff7df] px-4 py-1 text-xs font-bold tracking-wide text-yellow-700">
                AGUARDANDO CONFIRMAÇÃO
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-[#241718]">
                Pagamento pendente
              </h2>

              <p className="mt-2 leading-relaxed text-[#6f5d5d]">
                O pagamento ainda está sendo analisado ou aguardando confirmação.
              </p>

              {paymentId && (
                <div className="mt-5 rounded-2xl bg-[#fbf8f5] p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A2132]">
                    Detalhe do pagamento
                  </p>
                  <p className="mt-2 break-all text-sm text-[#5f4d4d]">
                    ID do pagamento: <span className="font-semibold">{paymentId}</span>
                  </p>
                </div>
              )}
            </>
          )}

          {!carregando && statusReal === "failure" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fdeaea] shadow-[0_10px_24px_rgba(239,68,68,0.12)]">
                <XCircle size={42} className="text-red-600" />
              </div>

              <div className="mx-auto mt-4 w-fit rounded-full bg-[#fff0f0] px-4 py-1 text-xs font-bold tracking-wide text-red-700">
                PAGAMENTO NÃO CONCLUÍDO
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-[#241718]">
                Pagamento não concluído
              </h2>

              <p className="mt-2 leading-relaxed text-[#6f5d5d]">
                Houve um problema no pagamento. Você pode tentar novamente.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-2xl bg-[linear-gradient(135deg,#6B0F1A_0%,#8A2132_100%)] px-5 py-3 font-semibold text-[#F7F3EE] shadow-[0_14px_26px_rgba(107,15,26,0.2)] transition hover:opacity-95 active:scale-[0.98]"
            >
              Voltar para a página inicial
            </Link>

            <Link
              href="/cart"
              className="rounded-2xl bg-[#ddd6d0] px-5 py-3 font-semibold text-[#4a413f] transition hover:bg-[#d3cbc4] active:scale-[0.98]"
            >
              Ir para o carrinho
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#241718]">Carregando...</div>}>
      <CheckoutConteudo />
    </Suspense>
  )
}