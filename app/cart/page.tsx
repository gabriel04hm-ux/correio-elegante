"use client"

import { useEffect, useState } from "react"

export default function Cart() {
  const [carrinho, setCarrinho] = useState<any>({})
  const [dados, setDados] = useState<any>({})
  const [whats, setWhats] = useState("")
  const [carregando, setCarregando] = useState(false)

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

    if (tipo === "mais") {
      novo[id] = (novo[id] || 0) + 1
    }

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

    if (!numeroLimpo) {
      alert("Digite seu WhatsApp")
      return
    }

    if (!/^\d{10,11}$/.test(numeroLimpo)) {
      alert("Digite o WhatsApp com DDD. Ex: 31999999999")
      return
    }

    const pedido: any[] = []

    for (const produtoId of Object.keys(carrinho)) {
      const quantidade = carrinho[produtoId]

      for (let i = 0; i < quantidade; i++) {
        const item = dados?.[produtoId]?.[i]

        if (!item?.mensagem?.trim()) {
          alert(`Digite a mensagem do item ${i + 1} do produto ${produtoId}`)
          return
        }

        if (!item?.nome?.trim()) {
          alert(`Preencha o nome de quem recebe no item ${i + 1} do produto ${produtoId}`)
          return
        }

        if (!item?.sala?.trim()) {
          alert(`Selecione a sala no item ${i + 1} do produto ${produtoId}`)
          return
        }

        pedido.push({
          produto: produtoId,
          mensagem: item.mensagem.trim(),
          remetente: item.anonimo ? "Anônimo" : (item.remetente || "").trim(),
          destinatario: item.nome.trim(),
          sala: item.sala.trim(),
          whatsapp: numeroLimpo,
        })
      }
    }

    if (pedido.length === 0) {
      alert("Seu carrinho está vazio")
      return
    }

    const itensPagamento = Object.keys(carrinho).map((produtoId) => {
      const produto = produtos.find((p) => p.id === Number(produtoId))

      return {
        id: produtoId,
        title: produto?.nome || `Produto ${produtoId}`,
        quantity: Number(carrinho[produtoId]),
        unit_price: Number(produto?.preco || 0),
      }
    })

    try {
      setCarregando(true)

      // 1) salva o pedido e recebe o número
      const responsePedido = await fetch("/api/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      })

      const resultadoPedido = await responsePedido.json()

      if (!resultadoPedido.ok) {
        alert(resultadoPedido.erro || "Erro ao registrar pedido")
        setCarregando(false)
        return
      }

      if (!resultadoPedido.numeroPedido) {
        alert("O pedido foi registrado, mas não retornou número do pedido")
        setCarregando(false)
        return
      }

      // 2) cria o pagamento no Mercado Pago
      const responsePagamento = await fetch("/api/pedido/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens: itensPagamento,
          numeroPedido: resultadoPedido.numeroPedido,
        }),
      })

      const resultadoPagamento = await responsePagamento.json()

      if (!resultadoPagamento.ok) {
        alert(resultadoPagamento.erro || "Erro ao gerar pagamento")
        setCarregando(false)
        return
      }

      const linkPagamento =
        resultadoPagamento.init_point || resultadoPagamento.sandbox_init_point

      if (!linkPagamento) {
        alert("O Mercado Pago não retornou o link de pagamento")
        setCarregando(false)
        return
      }

      localStorage.removeItem("carrinho")
      localStorage.removeItem("carrinhoDados")
      localStorage.removeItem("carrinhoWhats")

      window.location.href = linkPagamento
    } catch (err) {
      console.error(err)
      alert("Erro ao finalizar pedido")
      setCarregando(false)
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

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => alterar(p.id, "menos")}
              className="bg-gray-300 px-3 py-1 rounded text-black"
            >
              -
            </button>

            <span className="text-black">{carrinho[p.id]}</span>

            <button
              onClick={() => alterar(p.id, "mais")}
              className="bg-gray-300 px-3 py-1 rounded text-black"
            >
              +
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {Array.from({ length: carrinho[p.id] }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 p-3 rounded-lg">
                <p className="text-sm font-semibold mb-2 text-black">
                  Mensagem {i + 1}
                </p>

                <textarea
                  placeholder="Mensagem *"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-black bg-white"
                  value={dados?.[p.id]?.[i]?.mensagem || ""}
                  onChange={(e) => atualizarCampo(p.id, i, "mensagem", e.target.value)}
                />

                <input
                  placeholder="Nome de quem recebe *"
                  className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
                  value={dados?.[p.id]?.[i]?.nome || ""}
                  onChange={(e) => atualizarCampo(p.id, i, "nome", e.target.value)}
                />

                <select
                  className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
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
                    className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
                    value={dados?.[p.id]?.[i]?.remetente || ""}
                    onChange={(e) => atualizarCampo(p.id, i, "remetente", e.target.value)}
                  />
                )}

                <label className="flex items-center gap-2 mt-2 text-sm text-black">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-pink-500"
                    checked={dados?.[p.id]?.[i]?.anonimo || false}
                    onChange={(e) => atualizarCampo(p.id, i, "anonimo", e.target.checked)}
                  />
                  Enviar anonimamente
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <input
        placeholder="Seu WhatsApp (ex: (31) 99999-9999)"
        className="w-full border border-gray-300 rounded p-2 mt-3 text-black bg-white"
        value={formatarWhats(whats)}
        inputMode="numeric"
        onChange={(e) => setWhats(e.target.value.replace(/\D/g, "").slice(0, 11))}
      />

      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <h2 className="font-bold text-lg text-black">Total: R$ {total}</h2>

        <button
          onClick={finalizarPedido}
          disabled={carregando}
          className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg disabled:opacity-60"
        >
          {carregando ? "Gerando pagamento..." : "Confirmar Pedido e Ir para Pagamento"}
        </button>
      </div>
    </div>
  )
}