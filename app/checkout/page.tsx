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
  const statusUrl = searchParams.get("status")
  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    searchParams.get("paymentId") ||
    ""

  const [statusReal, setStatusReal] = useState<string>(statusUrl || "pending")
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function verificar() {
      try {
        const referencia =
          localStorage.getItem("referenciaPagamentoAtual") || ""

        const resposta = await fetch(
          `/api/pagamento/status?paymentId=${encodeURIComponent(paymentId)}&referencia=${encodeURIComponent(referencia)}`
        )

        const dados = await resposta.json()

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
      } catch {
        if (ativo) setStatusReal(statusUrl || "pending")
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    verificar()
    const intervalo = setInterval(verificar, 4000)

    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [paymentId, statusUrl])

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white p-4 text-black">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full bg-white shadow border border-pink-100 hover:bg-pink-50 transition"
          >
            <ArrowLeft size={22} className="text-pink-600" />
          </button>

          <h1 className="text-2xl font-bold text-pink-700">Pagamento</h1>

          <Link
            href="/cart"
            className="p-2 rounded-full bg-white shadow border border-pink-100"
          >
            <ShoppingCart size={22} className="text-pink-600" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 text-center">
          {carregando && (
            <>
              <Clock3 size={64} className="text-pink-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Verificando pagamento
              </h2>
              <p className="text-gray-600 mt-2">
                Aguarde um instante enquanto confirmamos seu pagamento.
              </p>
            </>
          )}

          {!carregando && statusReal === "success" && (
            <>
              <CheckCircle2 size={64} className="text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Pagamento aprovado
              </h2>
              <p className="text-gray-600 mt-2">
                Seu pagamento foi confirmado com sucesso e o pedido já foi registrado.
              </p>
            </>
          )}

          {!carregando && statusReal === "pending" && (
            <>
              <Clock3 size={64} className="text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Pagamento pendente
              </h2>
              <p className="text-gray-600 mt-2">
                O pagamento ainda está sendo analisado ou aguardando confirmação.
              </p>
            </>
          )}

          {!carregando && statusReal === "failure" && (
            <>
              <XCircle size={64} className="text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Pagamento não concluído
              </h2>
              <p className="text-gray-600 mt-2">
                Houve um problema no pagamento. Você pode tentar novamente.
              </p>
            </>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700 transition"
            >
              Voltar para a página inicial
            </Link>

            <Link
              href="/cart"
              className="rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-300 transition"
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
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <CheckoutConteudo />
    </Suspense>
  )
}