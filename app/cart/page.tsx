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

    if (tipo === "mais") {
      novo[id] = (novo[id] || 0) + 1
    }

    if (tipo === "menos") {
      novo[id] = (novo[id] || 0) - 1
      if (novo[id] <= 0) delete novo[id]
    }

    setCarrinho(novo)
    localStorage.setItem("carrinho", JSON.stringify(novo))
  }

  function atualizarCampo(
    produtoId: number,
    index: number,
    campo: string,
    valor: any
  ) {
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

  async function finalizarPedido() {
    const numeroLimpo = whats.replace(/\D/g, "")

    if (!numeroLimpo) {
      alert("Digite seu WhatsApp")
      return
    }

    if (!/^\d{10,11}$/.test(numeroLimpo)) {
      alert("Digite o WhatsApp no padrão correto, com DDD. Ex: 31999999999")
      return
    }

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

      if (!response.ok || !resultado.ok) {
        console.error(resultado)
        alert("Erro ao enviar pedido")
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
              <div
                key={i}
                className="bg-white border border-gray-200 p-3 rounded-lg"
              >
                <p className="text-sm font-semibold mb-2 text-black">
                  Mensagem {i + 1}
                </p>

                <textarea
                  placeholder="Digite sua mensagem..."
                  className="w-full border border-gray-300 rounded p-2 text-sm text-black bg-white"
                  onChange={(e) =>
                    atualizarCampo(p.id, i, "mensagem", e.target.value)
                  }
                />

                {!dados?.[p.id]?.[i]?.anonimo && (
                  <input
                    placeholder="Seu nome (quem envia)"
                    className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
                    onChange={(e) =>
                      atualizarCampo(p.id, i, "remetente", e.target.value)
                    }
                  />
                )}

                <input
                  placeholder="Nome de quem recebe"
                  className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
                  onChange={(e) =>
                    atualizarCampo(p.id, i, "nome", e.target.value)
                  }
                />

                <select
                  className="w-full border border-gray-300 rounded p-2 mt-2 text-sm text-black bg-white"
                  defaultValue=""
                  onChange={(e) =>
                    atualizarCampo(p.id, i, "sala", e.target.value)
                  }
                >
                  <option value="" disabled>
                    Selecione a sala
                  </option>

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

                <label className="flex items-center gap-2 mt-2 text-sm text-black">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-pink-500"
                    onChange={(e) =>
                      atualizarCampo(p.id, i, "anonimo", e.target.checked)
                    }
                  />
                  Enviar anonimamente
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <input
        placeholder="Seu WhatsApp com DDD (ex: 31999999999)"
        className="w-full border border-gray-300 rounded p-2 mt-3 text-black bg-white"
        value={whats}
        inputMode="numeric"
        maxLength={11}
        onChange={(e) => {
          const somenteNumeros = e.target.value.replace(/\D/g, "")
          setWhats(somenteNumeros)
        }}
      />

      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <h2 className="font-bold text-lg text-black">Total: R$ {total}</h2>

        <button
          onClick={finalizarPedido}
          className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg"
        >
          Confirmar Pedido
        </button>
      </div>
    </div>
  )
}