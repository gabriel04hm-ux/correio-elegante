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
  cpf: string
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
    { id: 1, nome: "Coração", preco: 0.5, imagem: "/p1.jpg" },
    { id: 2, nome: "Bala c/ coração", preco: 0.75, imagem: "/p2.jpg" },
    { id: 3, nome: "Pirulito c/ coração", preco: 1, imagem: "/p3.jpg" },
    { id: 4, nome: "Bombom c/ coração", preco: 3.5, imagem: "/p4.jpg" },
    { id: 5, nome: "Fini c/ coração", preco: 2.5, imagem: "/p5.jpg" },
    { id: 6, nome: "Polaroide c/ coração", preco: 4, imagem: "/p1.jpg" },
    { id: 7, nome: "Flor c/ coração", preco: 12, imagem: "/p2.jpg" },
    { id: 8, nome: "Ingresso Dia D", preco: 3, imagem: "/p3.jpg" },
  ]

  const salas = [
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

    "Professor(a)",
  ]

  function isIngressoDiaD(produto: Produto) {
    return produto.nome === "Ingresso Dia D"
  }

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

  function formatarCPF(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11)

    if (n.length <= 3) return n
    if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`
    if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`
    return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`
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
            cpf: "",
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
          cpf: "",
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
            alert(`Preencha o nome do item ${i + 1} de ${produto.nome}`)
            return
          }

          if (!item?.sala?.trim()) {
            alert(`Selecione a sala do item ${i + 1} de ${produto.nome}`)
            return
          }

          if (isIngressoDiaD(produto)) {
            const cpfLimpo = String(item?.cpf || "").replace(/\D/g, "")

            if (cpfLimpo.length !== 11) {
              alert(`Digite um CPF válido para o item ${i + 1} de ${produto.nome}`)
              return
            }

            pedido.push({
              produto: produto.nome,
              mensagem: `CPF: ${formatarCPF(cpfLimpo)}`,
              remetente: "",
              destinatario: item.nome.trim(),
              sala: item.sala.trim(),
              whatsapp: numeroLimpo,
            })

            continue
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f2ebe4_52%,#fbf8f5_100%)] p-4 text-[#241718] md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="sticky top-0 z-40 mb-6 rounded-[28px] border border-[#eaded6] bg-[rgba(247,243,238,0.92)] backdrop-blur-xl shadow-[0_14px_34px_rgba(74,9,18,0.08)]">
          <div className="flex items-center justify-between gap-4 px-3 py-3">
            <button
              onClick={() => router.back()}
              className="rounded-full bg-white p-2.5 shadow border border-[#eaded6] transition hover:bg-[#f6eee8] active:scale-95"
            >
              <ArrowLeft size={22} className="text-[#6B0F1A]" />
            </button>

            <h1 className="text-2xl font-extrabold text-[#6B0F1A]">Carrinho</h1>

            <Link
              href="/cart"
              className="rounded-full bg-white p-2.5 shadow border border-[#eaded6]"
            >
              <ShoppingCart size={22} className="text-[#6B0F1A]" />
            </Link>
          </div>
        </div>

        {itensNoCarrinho.length === 0 ? (
          <div className="rounded-[28px] border border-[#eaded6] bg-white p-8 text-center shadow-[0_16px_36px_rgba(74,9,18,0.08)]">
            <p className="text-lg font-medium text-[#6b5958]">
              Seu carrinho está vazio.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block rounded-2xl bg-[linear-gradient(135deg,#6B0F1A_0%,#8A2132_100%)] px-5 py-3 font-semibold text-[#F7F3EE] shadow-[0_14px_26px_rgba(107,15,26,0.2)] transition active:scale-[0.98]"
            >
              Escolher produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {itensNoCarrinho.map((produto) => {
              const quantidade = carrinho[produto.id] || 0
              const esgotado = !produtoDisponivel(produto.nome)
              const produtoEhIngresso = isIngressoDiaD(produto)

              return (
                <section
                  key={produto.id}
                  className="rounded-[28px] border border-[#eaded6] bg-white p-5 shadow-[0_16px_36px_rgba(74,9,18,0.08)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      {produto.imagem ? (
                        <div className="relative overflow-hidden rounded-2xl">
                          <img
                            src={produto.imagem}
                            alt={produto.nome}
                            className={`h-20 w-20 object-cover transition ${
                              esgotado ? "blur-[1px] brightness-[0.55]" : ""
                            }`}
                          />
                          {esgotado && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="rounded-full bg-[#6B0F1A] px-2 py-1 text-[10px] font-extrabold text-[#F7F3EE]">
                                ESGOTADO
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div>
                        <h2 className="text-lg font-extrabold text-[#241718]">
                          {produto.nome}
                        </h2>
                        <p className="text-sm text-[#6e5d5b]">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto.id, -1)}
                        className="h-10 w-10 rounded-full bg-[#efe7df] text-xl font-bold text-[#6B0F1A] transition active:scale-95"
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
                        className={`h-10 w-10 rounded-full text-xl font-bold transition active:scale-95 ${
                          esgotado
                            ? "bg-[#d7d0cb] text-[#7b7470] cursor-not-allowed"
                            : "bg-[#6B0F1A] text-[#F7F3EE]"
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
                        cpf: "",
                      }

                      return (
                        <div
                          key={`${produto.id}-${index}`}
                          className="rounded-[24px] border border-[#eaded6] bg-[#fbf8f5] p-4"
                        >
                          <h3 className="mb-4 text-sm font-extrabold text-[#6B0F1A]">
                            {produto.nome} #{index + 1}
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            {produtoEhIngresso ? (
                              <>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
                                    Nome completo *
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
                                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                    placeholder="Digite o nome completo"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
                                    CPF *
                                  </label>
                                  <input
                                    type="text"
                                    value={formatarCPF(item.cpf || "")}
                                    onChange={(e) =>
                                      atualizarCampo(
                                        produto.id,
                                        index,
                                        "cpf",
                                        e.target.value.replace(/\D/g, "").slice(0, 11)
                                      )
                                    }
                                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                    placeholder="000.000.000-00"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
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
                                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                  >
                                    <option value="">Selecione a sala</option>
                                    {salas.map((sala) => (
                                      <option key={sala} value={sala}>
                                        {sala}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="md:col-span-2">
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
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
                                    className="min-h-[100px] w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                    placeholder="Digite a mensagem"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-[#4e4140]">
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
                                    <label className="mb-1 block text-sm font-medium text-[#4e4140]">
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
                                      className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                      placeholder="Seu nome"
                                    />
                                  </div>
                                )}

                                <div>
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
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
                                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                    placeholder="Nome de quem vai receber"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
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
                                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                                  >
                                    <option value="">Selecione a sala</option>
                                    {salas.map((sala) => (
                                      <option key={sala} value={sala}>
                                        {sala}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            <section className="rounded-[28px] border border-[#eaded6] bg-white p-5 shadow-[0_16px_36px_rgba(74,9,18,0.08)]">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4e4140]">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={formatarWhats(whats)}
                    onChange={(e) =>
                      setWhats(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    className="w-full rounded-2xl border border-[#e2d6cf] bg-white p-3 outline-none"
                    placeholder="(31) 99999-9999"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="rounded-[24px] bg-[#fbf8f5] p-4">
                    <p className="text-sm text-[#655554]">
                      Itens: <strong>{totalItens}</strong>
                    </p>
                    <p className="text-xl font-extrabold text-[#6B0F1A]">
                      Total: R$ {totalPreco.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={limparCarrinhoCompleto}
                  className="rounded-2xl bg-[#ddd6d0] px-5 py-3 font-semibold text-[#4a413f] transition active:scale-[0.98]"
                >
                  Limpar carrinho
                </button>

                <button
                  type="button"
                  onClick={finalizarPedido}
                  disabled={carregando}
                  className="rounded-2xl bg-[linear-gradient(135deg,#6B0F1A_0%,#8A2132_100%)] px-5 py-3 font-semibold text-[#F7F3EE] shadow-[0_14px_26px_rgba(107,15,26,0.2)] transition disabled:opacity-60 active:scale-[0.98]"
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