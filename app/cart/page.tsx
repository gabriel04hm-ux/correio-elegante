"use client"

import { useEffect, useState } from "react"

export default function Cart() {
  const [carrinho, setCarrinho] = useState<any>({})
  const [dados, setDados] = useState<any>({})
  const [whats, setWhats] = useState("")

  const produtos = [
    { id: 1, nome: "Produto 1", preco: 5 },
    { id: 2, nome: "Produto 2", preco: 6 },
    { id: 3, nome: "Produto 3", preco: 4 },
    { id: 4, nome: "Produto 4", preco: 7 },
    { id: 5, nome: "Produto 5", preco: 3 },
  ]

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("carrinho") || "{}")
    setCarrinho(data)
  }, [])

  function alterar(id: number, tipo: string) {
    const novo = { ...carrinho }

    if (tipo === "mais") novo[id] = (novo[id] || 0) + 1
    if (tipo === "menos") {
      novo[id] = (novo[id] || 0) - 1
      if (novo[id] <= 0) delete novo[id]
    }

    setCarrinho(novo)
    localStorage.setItem("carrinho", JSON.stringify(novo))
  }

  function atualizarCampo(produtoId: number, index: number, campo: string, valor: any) {
    setDados((prev: any) => {
      const copia = { ...prev }

      if (!copia[produtoId]) copia[produtoId] = []

      if (!copia[produtoId][index]) {
        copia[produtoId][index] = {
          mensagem: "",
          nome: "",
          sala: "",
          remetente: "",
          anonimo: false,
        }
      }

      copia[produtoId][index][campo] = valor
      return copia
    })
  }

  function formatarWhats(valor: string) {
    const n = valor.replace(/\D/g, "")
    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`
  }

  async function finalizarPedido() {
    const numeroLimpo = whats.replace(/\D/g, "")

    if (!numeroLimpo) return alert("Digite seu WhatsApp")
    if (!/^\d{10,11}$/.test(numeroLimpo))
      return alert("Digite o WhatsApp com DDD. Ex: 31999999999")

    const pedido: any[] = []

    Object.keys(dados).forEach((produtoId) => {
      dados[produtoId].forEach((item: any) => {
        pedido.push({
          produto: produtoId,
          mensagem: item.mensagem || "",
          remetente: item.anonimo ? "Anônimo" : item.remetente || "",
          destinatario: item.nome || "",
          sala: item.sala || "",
          whatsapp: numeroLimpo,
        })
      })
    })

    if (pedido.length === 0) return alert("Preencha pelo menos uma mensagem")

    try {
      const response = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      })

      const resultado = await response.json()

      console.log("RESPOSTA:", resultado)

      if (!resultado.ok) {
        alert(resultado.erro || "Erro ao enviar pedido")
        return
      }

      alert("Pedido enviado com sucesso! Nº " + resultado.numeroPedido)

      localStorage.removeItem("carrinho")
      location.reload()
    } catch (err) {
      console.error(err)
      alert("Erro ao enviar pedido")
    }
  }

  const itens = produtos.filter((p) => carrinho[p.id])
  const total = itens.reduce((acc, p) => acc + p.preco * carrinho[p.id], 0)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">🛒 Seu Carrinho</h1>

      {itens.map((p) => (
        <div key={p.id} className="bg-white p-4 mb-4 rounded-xl shadow">
          <h2 className="font-semibold text-lg text-black">{p.nome}</h2>
          <p className="text-pink-600 font-bold">R$ {p.preco}</p>

          <div className="flex gap-2 mt-2">
            <button onClick={() => alterar(p.id, "menos")} className="bg-gray-300 px-3 py-1 rounded">-</button>
            <span>{carrinho[p.id]}</span>
            <button onClick={() => alterar(p.id, "mais")} className="bg-gray-300 px-3 py-1 rounded">+</button>
          </div>

          {Array.from({ length: carrinho[p.id] }).map((_, i) => (
            <div key={i} className="mt-3 border p-3 rounded">
              <textarea
                placeholder="Mensagem"
                className="w-full border p-2"
                onChange={(e) => atualizarCampo(p.id, i, "mensagem", e.target.value)}
              />

              <input
                placeholder="Quem envia"
                className="w-full border p-2 mt-2"
                onChange={(e) => atualizarCampo(p.id, i, "remetente", e.target.value)}
              />

              <input
                placeholder="Quem recebe"
                className="w-full border p-2 mt-2"
                onChange={(e) => atualizarCampo(p.id, i, "nome", e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}

      <input
        placeholder="(31) 99999-9999"
        className="w-full border p-2 mt-3"
        value={formatarWhats(whats)}
        onChange={(e) => setWhats(e.target.value.replace(/\D/g, "").slice(0, 11))}
      />

      <div className="mt-4">
        <h2>Total: R$ {total}</h2>

        <button
          onClick={finalizarPedido}
          className="w-full bg-green-500 text-white p-2 mt-2"
        >
          Confirmar Pedido
        </button>
      </div>
    </div>
  )
}