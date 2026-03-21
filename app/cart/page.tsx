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
    setCarrinho(JSON.parse(localStorage.getItem("carrinho") || "{}"))
    setDados(JSON.parse(localStorage.getItem("carrinhoDados") || "{}"))
    setWhats(localStorage.getItem("carrinhoWhats") || "")
  }, [])

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(carrinho))
  }, [carrinho])

  useEffect(() => {
    localStorage.setItem("carrinhoDados", JSON.stringify(dados))
  }, [dados])

  useEffect(() => {
    localStorage.setItem("carrinhoWhats", whats)
  }, [whats])

  function alterar(id: number, tipo: string) {
    const novo = { ...carrinho }

    if (tipo === "mais") novo[id] = (novo[id] || 0) + 1

    if (tipo === "menos") {
      novo[id] = (novo[id] || 0) - 1
      if (novo[id] <= 0) delete novo[id]
    }

    setCarrinho(novo)
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

    for (const produtoId of Object.keys(carrinho)) {
      const quantidade = carrinho[produtoId]

      for (let i = 0; i < quantidade; i++) {
        const item = dados?.[produtoId]?.[i]

        if (!item?.nome) {
          alert(`Preencha o nome de quem recebe (Produto ${produtoId} - Mensagem ${i + 1})`)
          return
        }

        if (!item?.sala) {
          alert(`Selecione a sala (Produto ${produtoId} - Mensagem ${i + 1})`)
          return
        }

        if (!item?.mensagem) {
          alert(`Digite a mensagem (Produto ${produtoId} - Mensagem ${i + 1})`)
          return
        }

        pedido.push({
          produto: produtoId,
          mensagem: item.mensagem,
          remetente: item.anonimo ? "Anônimo" : item.remetente || "",
          destinatario: item.nome,
          sala: item.sala,
          whatsapp: numeroLimpo,
        })
      }
    }

    if (pedido.length === 0) {
      alert("Preencha pelo menos uma mensagem")
      return
    }

    try {
      const response = await fetch("/api/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      })

      const resultado = await response.json()

      if (!resultado.ok) {
        alert(resultado.erro || "Erro ao enviar pedido")
        return
      }

      alert("Pedido enviado com sucesso! Nº " + resultado.numeroPedido)

      localStorage.removeItem("carrinho")
      localStorage.removeItem("carrinhoDados")
      localStorage.removeItem("carrinhoWhats")

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
            <button
              onClick={() => alterar(p.id, "menos")}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              -
            </button>

            <span>{carrinho[p.id]}</span>

            <button
              onClick={() => alterar(p.id, "mais")}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              +
            </button>
          </div>

          {Array.from({ length: carrinho[p.id] }).map((_, i) => (
            <div key={i} className="mt-3 border p-3 rounded">
              <textarea
                placeholder="Mensagem *"
                className="w-full border p-2"
                value={dados?.[p.id]?.[i]?.mensagem || ""}
                onChange={(e) => atualizarCampo(p.id, i, "mensagem", e.target.value)}
              />

              <input
                placeholder="Nome de quem recebe *"
                className="w-full border p-2 mt-2"
                value={dados?.[p.id]?.[i]?.nome || ""}
                onChange={(e) => atualizarCampo(p.id, i, "nome", e.target.value)}
              />

              <select
                className="w-full border p-2 mt-2"
                value={dados?.[p.id]?.[i]?.sala || ""}
                onChange={(e) => atualizarCampo(p.id, i, "sala", e.target.value)}
              >
                <option value="">Selecione a sala *</option>

                <option>Professor(a)</option>

                <option>1º Eletrônica</option>
                <option>1º Ene. Renovável</option>
                <option>1º Fab. Mecânica</option>
                <option>1º Informática</option>
                <option>1º Logística</option>
                <option>1º Seg. Trabalho</option>

                <option>2º Eletrônica</option>
                <option>2º Ene. Renovável</option>
                <option>2º Fab. Mecânica</option>
                <option>2º Informática</option>
                <option>2º Logística</option>
                <option>2º Seg. Trabalho</option>

                <option>3º Eletrônica</option>
                <option>3º Informática</option>
                <option>3º Logística</option>
                <option>3º Propedêutico</option>
                <option>3º Seg. Trabalho</option>
              </select>

              {!dados?.[p.id]?.[i]?.anonimo && (
                <input
                  placeholder="Seu nome (opcional)"
                  className="w-full border p-2 mt-2"
                  value={dados?.[p.id]?.[i]?.remetente || ""}
                  onChange={(e) => atualizarCampo(p.id, i, "remetente", e.target.value)}
                />
              )}

              <label className="flex gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={dados?.[p.id]?.[i]?.anonimo || false}
                  onChange={(e) => atualizarCampo(p.id, i, "anonimo", e.target.checked)}
                />
                Enviar anonimamente
              </label>
            </div>
          ))}
        </div>
      ))}

      <input
        placeholder="Seu WhatsApp (ex: (31) 99999-9999)"
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