"use client"

import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Clock3, XCircle, ArrowLeft, ShoppingCart } from "lucide-react"

function CheckoutConteudo() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  useEffect(() => {
    if (status === "success") {
      localStorage.removeItem("carrinho")
      localStorage.removeItem("carrinhoDados")
      localStorage.removeItem("carrinhoWhats")
    }
  }, [status])

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
          {status === "success" && (
            <>
              <CheckCircle2 size={64} className="text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Pagamento aprovado
              </h2>
              <p className="text-gray-600 mt-2">
                Seu pagamento foi recebido com sucesso. Agora o pedido deve ser processado automaticamente.
              </p>
            </>
          )}

          {status === "pending" && (
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

          {status === "failure" && (
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

          {!status && (
            <>
              <Clock3 size={64} className="text-pink-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Aguardando status do pagamento
              </h2>
              <p className="text-gray-600 mt-2">
                Esta página mostra o retorno do pagamento.
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