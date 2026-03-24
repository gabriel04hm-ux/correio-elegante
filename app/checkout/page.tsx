"use client"

import { useState, useEffect } from "react"

export default function Checkout() {
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [remetente, setRemetente] = useState("")
  const [destinatario, setDestinatario] = useState("")
  const [sala, setSala] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [anonimo, setAnonimo] = useState(false)

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("carrinho") || "[]")
    setCarrinho(dados)
  }, [])

  const total = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  async function finalizarPedido() {
    try {
      setLoading(true)

      if (!destinatario || !sala || !whatsapp) {
        alert("Preencha todos os campos obrigatórios")
        return
      }

      const carrinhoFinal = carrinho.map((item) => ({
        ...item,
        remetente: anonimo ? "Anônimo" : remetente,
        destinatario,
        sala,
        whatsapp,
      }))

      // 🔥 ENVIA PRO BACKEND CORRETAMENTE
      const res = await fetch("/api/pedido/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrinho: carrinhoFinal,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("Erro ao gerar pagamento: " + JSON.stringify(data))
        return
      }

      // 🔥 REDIRECIONA PRO MERCADO PAGO
      window.location.href = data.init_point
    } catch (error) {
      console.error(error)
      alert("Erro ao finalizar pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Finalizar Pedido</h1>

      <label className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={anonimo}
          onChange={(e) => setAnonimo(e.target.checked)}
        />
        Enviar anonimamente
      </label>

      {!anonimo && (
        <input
          className="border p-2 w-full mb-2"
          placeholder="Seu nome"
          value={remetente}
          onChange={(e) => setRemetente(e.target.value)}
        />
      )}

      <input
        className="border p-2 w-full mb-2"
        placeholder="Nome de quem recebe"
        value={destinatario}
        onChange={(e) => setDestinatario(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2"
        value={sala}
        onChange={(e) => setSala(e.target.value)}
      >
        <option value="">Selecione a sala</option>

        <option>Professor(a)</option>

        <option>1 Eletrônica</option>
        <option>1 Ene. Renovável</option>
        <option>1 Fab. Mecânica</option>
        <option>1 Informática</option>
        <option>1 Logística</option>
        <option>1 Seg. Trabalho</option>

        <option>2 Eletrônica</option>
        <option>2 Ene. Renovável</option>
        <option>2 Fab. Mecânica</option>
        <option>2 Informática</option>
        <option>2 Logística</option>
        <option>2 Seg. Trabalho</option>

        <option>3 Eletrônica</option>
        <option>3 Informática</option>
        <option>3 Logística</option>
        <option>3 Propedêutico</option>
        <option>3 Seg. Trabalho</option>
      </select>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Seu WhatsApp"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      <div className="mt-4">
        <p>Itens: {carrinho.length}</p>
        <p className="font-bold">Total: R$ {total.toFixed(2)}</p>
      </div>

      <button
        onClick={finalizarPedido}
        disabled={loading}
        className="bg-pink-600 text-white w-full p-3 mt-4 rounded"
      >
        {loading ? "Processando..." : "Pagar com Pix"}
      </button>
    </div>
  )
}