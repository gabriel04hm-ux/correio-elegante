"use client"

import { useState } from "react"

export default function Checkout() {
  const [loading, setLoading] = useState(false)

  async function pagar() {
    try {
      setLoading(true)

      const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]")

      const res = await fetch("/api/pedido/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens: carrinho.map((item: any) => ({
            title: item.nome,
            quantity: item.quantidade,
            unit_price: item.preco,
          })),
          pedido: carrinho,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("Erro: " + JSON.stringify(data))
        return
      }

      window.location.href = data.init_point
    } catch (error) {
      console.error(error)
      alert("Erro ao pagar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={pagar}
        className="bg-pink-600 text-white p-3 rounded"
      >
        {loading ? "Carregando..." : "Pagar com Pix"}
      </button>
    </div>
  )
}