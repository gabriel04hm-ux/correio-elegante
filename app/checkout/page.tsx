"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type Estado = "carregando" | "aprovado" | "pendente" | "falhou" | "erro"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [estado, setEstado] = useState<Estado>("carregando")
  const [mensagem, setMensagem] = useState("Verificando pagamento...")

  useEffect(() => {
    async function verificar() {
      try {
        const statusUrl = searchParams.get("status") || ""
        const paymentId =
          searchParams.get("payment_id") ||
          searchParams.get("collection_id") ||
          ""

        console.log("Parâmetros do checkout:", { statusUrl, paymentId })

        if (!paymentId) {
          if (statusUrl === "success") {
            setEstado("pendente")
            setMensagem("Pagamento enviado. Estamos aguardando a confirmação.")
            return
          }

          if (statusUrl === "pending") {
            setEstado("pendente")
            setMensagem("Pagamento pendente.")
            return
          }

          setEstado("falhou")
          setMensagem("Pagamento não identificado.")
          return
        }

        const resposta = await fetch("/api/mercadopago/verificar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId }),
        })

        const texto = await resposta.text()
        console.log("Resposta da verificação:", texto)

        if (!resposta.ok) {
          setEstado("erro")
          setMensagem("Erro ao verificar pagamento.")
          return
        }

        const json = JSON.parse(texto)
        const status = json.status

        if (status === "approved") {
          setEstado("aprovado")
          setMensagem("Pagamento aprovado com sucesso.")
          localStorage.removeItem("carrinho")
          localStorage.removeItem("carrinhoDados")
          localStorage.removeItem("carrinhoWhats")
          return
        }

        if (status === "pending" || status === "in_process") {
          setEstado("pendente")
          setMensagem("Pagamento pendente.")
          return
        }

        setEstado("falhou")
        setMensagem("Pagamento não foi aprovado.")
      } catch (error) {
        console.error("Erro ao verificar checkout:", error)
        setEstado("erro")
        setMensagem("Erro ao verificar pagamento.")
      }
    }

    verificar()
  }, [searchParams])

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold text-pink-700">Status do pagamento</h1>

      <p className="mt-4 text-lg text-gray-700">{mensagem}</p>

      {estado === "aprovado" && (
        <p className="mt-3 font-semibold text-green-600">
          Seu pedido foi confirmado e enviado com sucesso.
        </p>
      )}

      {estado === "pendente" && (
        <p className="mt-3 font-semibold text-yellow-600">
          Assim que o pagamento for confirmado, seu pedido será processado.
        </p>
      )}

      {estado === "falhou" && (
        <p className="mt-3 font-semibold text-red-600">
          O pagamento não foi concluído.
        </p>
      )}

      {estado === "erro" && (
        <p className="mt-3 font-semibold text-red-600">
          Tivemos um problema para consultar seu pagamento.
        </p>
      )}

      <div className="mt-6">
        <Link
          href="/"
          className="inline-block rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-pink-50 p-4 md:p-8">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-pink-700">
              Status do pagamento
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Verificando pagamento...
            </p>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </main>
  )
}