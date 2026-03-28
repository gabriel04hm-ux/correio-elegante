"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

type Produto = {
  id: number
  nome: string
  preco: number
  imagem?: string
}

type DadosItem = {
  mensagem: string
  remetente: string
  nome: string
  sala: string
  anonimo: boolean
}

type EstoqueItem = {
  produto: string
  disponivel: boolean
  esgotado: boolean
}

type EstoquePorProduto = Record<string, EstoqueItem>

function normalizarNomeProduto(nome: string) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export default function CartPage() {
  const router = useRouter()

  const [carrinho, setCarrinho] = useState<Record<number, number>>({})
  const [dados, setDados] = useState<Record<number, DadosItem[]>>({})
  const [whats, setWhats] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [estoquePorProduto, setEstoquePorProduto] = useState<EstoquePorProduto>({})
  const [carregandoEstoque, setCarregandoEstoque] = useState(true)

  const produtos: Produto[] = [
    { id: 1, nome: "Produto 1", preco: 1, imagem: "/p1.jpg" },
    { id: 2, nome: "Produto 2", preco: 6, imagem: "/p2.jpg" },
    { id: 3, nome: "Produto 3", preco: 7, imagem: "/p3.jpg" },
    { id: 4, nome: "Produto 4", preco: 8, imagem: "/p4.jpg" },
    { id: 5, nome: "Produto 5", preco: 10, imagem: "/p5.jpg" },
  ]

  const salas = [
    "Professor(a)",

    "1 Eletrônica",
    "1 Ene. Renovável",
    "1 Fab. Mecânica",
    "1 Informática",
    "1 Logística",
    "1 Seg. Trabalho",

    "2 Eletrônica",
    "2 Ene. Renovável",
    "2 Fab. Mecânica",
    "2 Informática",
    "2 Logística",
    "2 Seg. Trabalho",

    "3 Eletrônica",
    "3 Informática",
    "3 Logística",
    "3 Propedêutico",
    "3 Seg. Trabalho",
  ]

  function produtoDisponivel(nomeProduto: string, estoqueAtual?: EstoquePorProduto) {
    const mapa = estoqueAtual || estoquePorProduto
    const chave = normalizarNomeProduto(nomeProduto)
    const item = mapa[chave]

    if (carregandoEstoque && !estoqueAtual) return true
    if (!item) return true

    return Boolean(item.disponivel)
  }

  function removerProdutosEsgotados(estoqueAtual: EstoquePorProduto) {
    setCarrinho((prev) => {
      const novoCarrinho = { ...prev }
      let alterou = false

      for (const produto of produtos) {
        if (!produtoDisponivel(produto.nome, estoqueAtual) && novoCarrinho[produto.id]) {
          delete novoCarrinho[produto.id]
          alterou = true
        }
      }

      return alterou ? novoCarrinho : prev
    })

    setDados((prev) => {
      const novoDados = { ...prev }
      let alterou = false

      for (const produto of produtos) {
        if (!produtoDisponivel(produto.nome, estoqueAtual) && novoDados[produto.id]) {
          delete novoDados[produto.id]
          alterou = true
        }
      }

      return alterou ? novoDados : prev
    })
  }

  async function carregarEstoque() {
    try {
      setCarregandoEstoque(true)

      const response = await fetch("/api/estoque", {
        method: "GET",
        cache: "no-store",
      })

      const data = await response.json()

      if (data?.ok && data?.estoquePorProduto) {
        setEstoquePorProduto(data.estoquePorProduto)
        removerProdutosEsgotados(data.estoquePorProduto)
      } else {
        setEstoquePorProduto({})
      }
    } catch (error) {
      console.error("Erro ao buscar estoque:", error)
      setEstoquePorProduto({})
    } finally {
      setCarregandoEstoque(false)
    }
  }

  useEffect(() => {
    const carrinhoSalvo = JSON.parse(localStorage.getItem("carrinho") || "{}")
    const dadosSalvos = JSON.parse(localStorage.getItem("carrinhoDados") || "{}")
    const whatsSalvo = localStorage.getItem("carrinhoWhats") || ""

    setCarrinho(carrinhoSalvo)
    setDados(dadosSalvos)
    setWhats(whatsSalvo)
  }, [])

  useEffect(() => {
    carregarEstoque()

    const aoFocar = () => {
      carregarEstoque()
    }

    window.addEventListener("focus", aoFocar)

    return () => {
      window.removeEventListener("focus", aoFocar)
    }
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

  const itensNoCarrinho = useMemo(() => {
    return produtos.filter((produto) => {
      const quantidade = carrinho[produto.id] || 0
      return quantidade > 0 && produtoDisponivel(produto.nome)
    })
  }, [carrinho, estoquePorProduto, carregandoEstoque])

  const totalItens = useMemo(() => {
    return itensNoCarrinho.reduce((acc, produto) => {
      return acc + (carrinho[produto.id] || 0)
    }, 0)
  }, [itensNoCarrinho, carrinho])

  const totalPreco = useMemo(() => {
    return itensNoCarrinho.reduce((acc, produto) => {
      return acc + produto.preco * (carrinho[produto.id] || 0)
    }, 0)
  }, [itensNoCarrinho, carrinho])

  function formatarWhats(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11)

    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  function alterarQuantidade(id: number, delta: number) {
    const produto = produtos.find((p) => p.id === id)

    if (!produto) return

    if (delta > 0 && !produtoDisponivel(produto.nome)) {
      return
    }

    setCarrinho((prev) => {
      const atual = prev[id] || 0
      const novaQtd = atual + delta
      const novoCarrinho = { ...prev }

      if (novaQtd <= 0) {
        delete novoCarrinho[id]
      } else {
        novoCarrinho[id] = novaQtd
      }

      return novoCarrinho
    })

    setDados((prev) => {
      const qtdAtual = carrinho[id] || 0
      const novaQtd = qtdAtual + delta
      const listaAtual = prev[id] || []
      const novo = { ...prev }

      if (novaQtd <= 0) {
        delete novo[id]
        return novo
      }

      if (delta > 0) {
        const novosItens = [...listaAtual]
        while (novosItens.length < novaQtd) {
          novosItens.push({
            mensagem: "",
            remetente: "",
            nome: "",
            sala: "",
            anonimo: false,
          })
        }
        novo[id] = novosItens
      } else {
        novo[id] = listaAtual.slice(0, novaQtd)
      }

      return novo
    })
  }

  function atualizarCampo(
    produtoId: number,
    index: number,
    campo: keyof DadosItem,
    valor: string | boolean
  ) {
    setDados((prev) => {
      const copia = { ...prev }
      const lista = [...(copia[produtoId] || [])]

      while (lista.length <= index) {
        lista.push({
          mensagem: "",
          remetente: "",
          nome: "",
          sala: "",
          anonimo: false,
        })
      }

      lista[index] = {
        ...lista[index],
        [campo]: valor,
      }

      copia[produtoId] = lista
      return copia
    })
  }

  function limparCarrinhoCompleto() {
    setCarrinho({})
    setDados({})
    setWhats("")
    localStorage.removeItem("carrinho")
    localStorage.removeItem("carrinhoDados")
    localStorage.removeItem("carrinhoWhats")
  }

  async function finalizarPedido() {
    try {
      await carregarEstoque()

      const itensAtualizados = produtos.filter((produto) => {
        const quantidade = carrinho[produto.id] || 0
        return quantidade > 0 && produtoDisponivel(produto.nome)
      })

      if (itensAtualizados.length === 0) {
        alert("Seu carrinho está vazio ou os produtos ficaram esgotados")
        return
      }

      const numeroLimpo = whats.replace(/\D/g, "")

      if (!numeroLimpo || numeroLimpo.length < 10) {
        alert("Digite um WhatsApp válido")
        return
      }

      const pedido: any[] = []

      for (const produto of itensAtualizados) {
        if (!produtoDisponivel(produto.nome)) {
          alert(`O produto ${produto.nome} ficou esgotado e foi removido do carrinho`)
          return
        }

        const quantidade = carrinho[produto.id] || 0
        const listaDados = dados[produto.id] || []

        for (let i = 0; i < quantidade; i++) {
          const item = listaDados[i]

          if (!item?.nome?.trim()) {
            alert(`Preencha o destinatário do item ${i + 1} de ${produto.nome}`)
            return
          }

          if (!item?.sala?.trim()) {
            alert(`Selecione a sala do item ${i + 1} de ${produto.nome}`)
            return
          }

          pedido.push({
            produto: produto.nome,
            mensagem: item.mensagem?.trim() || "",
            remetente: item.anonimo ? "Anônimo" : item.remetente?.trim() || "",
            destinatario: item.nome.trim(),
            sala: item.sala.trim(),
            whatsapp: numeroLimpo,
          })
        }
      }

      setCarregando(true)

      const pagamento = await fetch("/api/pedido/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens: [
            {
              id: "1",
              title: "Pedido Correio Elegante",
              quantity: 1,
              unit_price: totalPreco,
            },
          ],
          pedido,
        }),
      })

      const textoPagamento = await pagamento.text()
      console.log("Status /api/pedido/pagamento:", pagamento.status)
      console.log("Resposta /api/pedido/pagamento:", textoPagamento)

      if (!pagamento.ok) {
        console.error("Erro ao gerar pagamento:", textoPagamento)
        alert(`Erro ao gerar pagamento: ${textoPagamento}`)
        return
      }

      let pag: any

      try {
        pag = JSON.parse(textoPagamento)
      } catch {
        console.error("Resposta inválida da API /api/pedido/pagamento:", textoPagamento)
        alert("A API de pagamento não retornou JSON válido")
        return
      }

      if (!pag.init_point) {
        console.error("init_point não encontrado:", pag)
        alert("O link de pagamento não foi retornado")
        return
      }

      if (pag.referencia) {
        localStorage.setItem("referenciaPagamentoAtual", pag.referencia)
      }

      window.location.href = pag.init_point
    } catch (error) {
      console.error("Erro no catch:", error)
      alert("Erro inesperado ao finalizar pedido")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white p-4 md:p-8 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="sticky top-0 z-40 mb-6 rounded-2xl bg-pink-50/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-1 py-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white shadow border border-pink-100 hover:bg-pink-50 transition"
            >
              <ArrowLeft size={22} className="text-pink-600" />
            </button>

            <h1 className="text-2xl font-bold text-pink-700">Carrinho</h1>

            <Link
              href="/cart"
              className="p-2 rounded-full bg-white shadow border border-pink-100"
            >
              <ShoppingCart size={22} className="text-pink-600" />
            </Link>
          </div>
        </div>

        {itensNoCarrinho.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-lg font-medium text-gray-700">
              Seu carrinho está vazio.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white"
            >
              Escolher produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {itensNoCarrinho.map((produto) => {
              const quantidade = carrinho[produto.id] || 0
              const esgotado = !produtoDisponivel(produto.nome)

              return (
                <section
                  key={produto.id}
                  className="rounded-2xl bg-white p-5 shadow"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      {produto.imagem ? (
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className={`h-20 w-20 rounded-xl object-cover ${
                            esgotado ? "grayscale opacity-70" : ""
                          }`}
                        />
                      ) : null}

                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {produto.nome}
                        </h2>
                        <p className="text-sm text-gray-600">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                        {esgotado && (
                          <p className="mt-1 text-sm font-semibold text-red-500">
                            ESGOTADO
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto.id, -1)}
                        className="h-10 w-10 rounded-full bg-pink-100 text-xl font-bold text-pink-700"
                      >
                        -
                      </button>

                      <span className="min-w-[24px] text-center text-lg font-semibold">
                        {quantidade}
                      </span>

                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto.id, 1)}
                        disabled={esgotado}
                        className={`h-10 w-10 rounded-full text-xl font-bold ${
                          esgotado
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-pink-600 text-white"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    {Array.from({ length: quantidade }).map((_, index) => {
                      const item = dados[produto.id]?.[index] || {
                        mensagem: "",
                        remetente: "",
                        nome: "",
                        sala: "",
                        anonimo: false,
                      }

                      return (
                        <div
                          key={`${produto.id}-${index}`}
                          className="rounded-2xl border border-pink-100 bg-pink-50 p-4"
                        >
                          <h3 className="mb-4 text-sm font-bold text-pink-700">
                            {produto.nome} #{index + 1}
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Mensagem
                              </label>
                              <textarea
                                value={item.mensagem}
                                onChange={(e) =>
                                  atualizarCampo(
                                    produto.id,
                                    index,
                                    "mensagem",
                                    e.target.value
                                  )
                                }
                                className="min-h-[100px] w-full rounded-xl border border-pink-200 bg-white p-3 outline-none"
                                placeholder="Digite a mensagem"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={item.anonimo || false}
                                  onChange={(e) =>
                                    atualizarCampo(
                                      produto.id,
                                      index,
                                      "anonimo",
                                      e.target.checked
                                    )
                                  }
                                />
                                Enviar anonimamente
                              </label>
                            </div>

                            {!item.anonimo && (
                              <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                  Remetente
                                </label>
                                <input
                                  type="text"
                                  value={item.remetente}
                                  onChange={(e) =>
                                    atualizarCampo(
                                      produto.id,
                                      index,
                                      "remetente",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-pink-200 bg-white p-3 outline-none"
                                  placeholder="Seu nome"
                                />
                              </div>
                            )}

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Destinatário *
                              </label>
                              <input
                                type="text"
                                value={item.nome}
                                onChange={(e) =>
                                  atualizarCampo(
                                    produto.id,
                                    index,
                                    "nome",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-pink-200 bg-white p-3 outline-none"
                                placeholder="Nome de quem vai receber"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Sala *
                              </label>
                              <select
                                value={item.sala}
                                onChange={(e) =>
                                  atualizarCampo(
                                    produto.id,
                                    index,
                                    "sala",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-pink-200 bg-white p-3 outline-none"
                              >
                                <option value="">Selecione a sala</option>
                                {salas.map((sala) => (
                                  <option key={sala} value={sala}>
                                    {sala}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            <section className="rounded-2xl bg-white p-5 shadow">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={formatarWhats(whats)}
                    onChange={(e) =>
                      setWhats(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    className="w-full rounded-xl border border-pink-200 bg-white p-3 outline-none"
                    placeholder="(31) 99999-9999"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="rounded-xl bg-pink-50 p-4">
                    <p className="text-sm text-gray-700">
                      Itens: <strong>{totalItens}</strong>
                    </p>
                    <p className="text-lg font-bold text-pink-700">
                      Total: R$ {totalPreco.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={limparCarrinhoCompleto}
                  className="rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-800"
                >
                  Limpar carrinho
                </button>

                <button
                  type="button"
                  onClick={finalizarPedido}
                  disabled={carregando}
                  className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {carregando ? "Processando..." : "Confirmar e pagar"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}