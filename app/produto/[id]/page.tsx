"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  ChevronRight,
} from "lucide-react"

type EstoqueItem = {
  produto: string
  disponivel: boolean
  esgotado: boolean
}

type EstoquePorProduto = Record<string, EstoqueItem>

type Produto = {
  id: number
  nome: string
  preco: number
  imagem: string
  descricao: string
  detalhes: string[]
}

function normalizarNomeProduto(nome: string) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export default function ProdutoPage() {
  const params = useParams()
  const router = useRouter()

  const [animar, setAnimar] = useState(false)
  const [totalItens, setTotalItens] = useState(0)
  const [estoquePorProduto, setEstoquePorProduto] = useState<EstoquePorProduto>({})
  const [carregandoEstoque, setCarregandoEstoque] = useState(true)

  const produtos: Produto[] = [
    {
      id: 1,
      nome: "Coração",
      preco: 0.5,
      imagem: "/p1.jpg",
      descricao: "Um gesto simples e cheio de carinho para surpreender alguém especial.",
      detalhes: [
        "Ideal para uma lembrança delicada.",
        "Pode acompanhar sua mensagem personalizada.",
        "Opção acessível e simbólica.",
      ],
    },
    {
      id: 2,
      nome: "Bala c/ coração",
      preco: 0.75,
      imagem: "/p2.jpg",
      descricao: "Um mimo doce com uma mensagem especial para alegrar o dia.",
      detalhes: [
        "Combina carinho com um toque doce.",
        "Ótimo para presentear de forma leve.",
        "Perfeito para pequenos gestos.",
      ],
    },
    {
      id: 3,
      nome: "Pirulito c/ coração",
      preco: 1,
      imagem: "/p3.jpg",
      descricao: "Uma forma divertida e doce de demonstrar carinho.",
      detalhes: [
        "Visual chamativo e criativo.",
        "Ótimo para surpreender com leveza.",
        "Muito pedido em ações de correio elegante.",
      ],
    },
    {
      id: 4,
      nome: "Bombom c/ coração",
      preco: 3.5,
      imagem: "/p4.jpg",
      descricao: "Perfeito para surpreender com algo mais especial e saboroso.",
      detalhes: [
        "Uma opção mais marcante e romântica.",
        "Transmite mais presença no presente.",
        "Muito bom para quem quer impressionar.",
      ],
    },
    {
      id: 5,
      nome: "Fini c/ coração",
      preco: 2.5,
      imagem: "/p5.jpg",
      descricao: "Uma opção divertida e colorida para presentear.",
      detalhes: [
        "Ideal para algo descontraído e alegre.",
        "Combina bem com mensagens divertidas.",
        "Tem ótima aceitação entre os alunos.",
      ],
    },
    {
      id: 6,
      nome: "Polaroide c/ coração",
      preco: 4,
      imagem: "/p1.jpg",
      descricao: "Inclui uma foto especial para tornar o momento inesquecível.",
      detalhes: [
        "Cria um presente com valor emocional maior.",
        "Ótimo para recordar momentos especiais.",
        "Combina imagem e mensagem em um só item.",
      ],
    },
    {
      id: 7,
      nome: "Flor c/ coração",
      preco: 12,
      imagem: "/p2.jpg",
      descricao: "Um presente completo, delicado e cheio de significado.",
      detalhes: [
        "Opção premium para impressionar de verdade.",
        "Tem presença visual mais forte.",
        "Ideal para um gesto mais marcante.",
      ],
    },
    {
      id: 8,
      nome: "Ingresso Dia D",
      preco: 3,
      imagem: "/p3.jpg",
      descricao: "Ingresso especial para o Dia D. Basta preencher nome completo, sala e CPF.",
      detalhes: [
        "Produto com formulário específico.",
        "Não precisa mensagem personalizada.",
        "Solicita nome completo, sala e CPF.",
      ],
    },
  ]

  const produtoId = Number(params.id)
  const produto = useMemo(
    () => produtos.find((p) => p.id === produtoId),
    [produtoId]
  )

  const outrosProdutos = produtos.filter((p) => p.id !== produtoId).slice(0, 4)

  function atualizarCarrinho() {
    const carrinho: Record<string, number> = JSON.parse(
      localStorage.getItem("carrinho") || "{}"
    )

    const total = Object.values(carrinho).reduce(
      (acc, qtd) => acc + Number(qtd),
      0
    )

    setTotalItens(total)
  }

  function removerProdutosEsgotadosDoCarrinho(estoque: EstoquePorProduto) {
    const carrinhoAtual: Record<string, number> = JSON.parse(
      localStorage.getItem("carrinho") || "{}"
    )

    const carrinhoDadosAtual: Record<string, any[]> = JSON.parse(
      localStorage.getItem("carrinhoDados") || "{}"
    )

    let houveAlteracao = false
    const novoCarrinho: Record<string, number> = { ...carrinhoAtual }
    const novoCarrinhoDados: Record<string, any[]> = { ...carrinhoDadosAtual }

    for (const item of produtos) {
      const chaveEstoque = normalizarNomeProduto(item.nome)
      const itemEstoque = estoque[chaveEstoque]

      if (itemEstoque && !itemEstoque.disponivel) {
        const id = String(item.id)

        if (novoCarrinho[id]) {
          delete novoCarrinho[id]
          houveAlteracao = true
        }

        if (novoCarrinhoDados[id]) {
          delete novoCarrinhoDados[id]
          houveAlteracao = true
        }
      }
    }

    if (houveAlteracao) {
      localStorage.setItem("carrinho", JSON.stringify(novoCarrinho))
      localStorage.setItem("carrinhoDados", JSON.stringify(novoCarrinhoDados))
      atualizarCarrinho()
    }
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
        removerProdutosEsgotadosDoCarrinho(data.estoquePorProduto)
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
    atualizarCarrinho()
    carregarEstoque()

    const aoFocar = () => {
      atualizarCarrinho()
      carregarEstoque()
    }

    window.addEventListener("focus", aoFocar)
    return () => window.removeEventListener("focus", aoFocar)
  }, [])

  function produtoDisponivel(nomeProduto: string) {
    const chave = normalizarNomeProduto(nomeProduto)
    const item = estoquePorProduto[chave]

    if (carregandoEstoque) return true
    if (!item) return true

    return Boolean(item.disponivel)
  }

  function adicionar(id: number, nomeProduto: string) {
    if (!produtoDisponivel(nomeProduto)) return

    const carrinhoAtual: Record<string, number> = JSON.parse(
      localStorage.getItem("carrinho") || "{}"
    )

    const quantidade = carrinhoAtual[id] || 0

    const novoCarrinho = {
      ...carrinhoAtual,
      [id]: quantidade + 1,
    }

    localStorage.setItem("carrinho", JSON.stringify(novoCarrinho))
    setTotalItens((prev) => prev + 1)

    setAnimar(true)
    setTimeout(() => setAnimar(false), 260)
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f2ebe4_52%,#fbf8f5_100%)] text-[#241718]">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="rounded-full border border-[#eaded6] bg-white p-2.5 shadow-sm"
            >
              <ArrowLeft size={22} className="text-[#6B0F1A]" />
            </button>

            <Link href="/cart" className="relative">
              <ShoppingCart size={26} className="text-[#6B0F1A]" />
            </Link>
          </div>

          <div className="mt-10 rounded-[28px] border border-[#eaded6] bg-white p-8 text-center shadow-[0_14px_34px_rgba(74,9,18,0.08)]">
            <h1 className="text-2xl font-extrabold text-[#241718]">
              Produto não encontrado
            </h1>
            <p className="mt-2 text-[#7b6a68]">
              Esse produto não existe ou foi removido.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const whatsappMsg = `Oi, tenho interesse no ${produto.nome}`
  const produtoEsgotado = !produtoDisponivel(produto.nome)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ee_0%,#f2ebe4_52%,#fbf8f5_100%)] text-[#241718]">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="sticky top-0 z-40 rounded-[28px] border border-[#eaded6] bg-[rgba(247,243,238,0.92)] px-3 py-2 backdrop-blur-xl shadow-[0_14px_34px_rgba(74,9,18,0.08)]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="rounded-full border border-[#eaded6] bg-white p-2.5 shadow-sm transition active:scale-95"
            >
              <ArrowLeft size={22} className="text-[#6B0F1A]" />
            </button>

            <Link href="/cart" className="relative rounded-full border border-[#eaded6] bg-white p-2.5 shadow-sm">
              <ShoppingCart
                size={28}
                className={`text-[#6B0F1A] transition duration-300 ${
                  animar ? "scale-125" : "scale-100"
                }`}
              />

              {totalItens > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#6B0F1A] px-1 text-xs font-bold text-[#F7F3EE]">
                  {totalItens}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[30px] border border-[#eaded6] bg-white shadow-[0_18px_42px_rgba(74,9,18,0.10)]">
          <div className="relative">
            <img
              src={produto.imagem}
              alt={produto.nome}
              className={`h-72 w-full object-cover sm:h-96 ${
                produtoEsgotado ? "brightness-[0.55] blur-[1px]" : ""
              }`}
            />

            {produtoEsgotado && (
              <div className="absolute left-4 top-4 rounded-full bg-[#6B0F1A] px-4 py-2 text-sm font-extrabold text-[#F7F3EE] shadow-[0_12px_24px_rgba(74,9,18,0.28)]">
                ESGOTADO
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f3ebe4] px-3 py-1 text-xs font-bold text-[#6B0F1A]">
                Produto
              </span>
              {produtoEsgotado && (
                <span className="rounded-full bg-[#efe2df] px-3 py-1 text-xs font-bold text-[#6B0F1A]">
                  Indisponível
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold text-[#241718]">
              {produto.nome}
            </h1>

            <p className="mt-2 text-3xl font-extrabold text-[#6B0F1A]">
              R$ {produto.preco.toFixed(2)}
            </p>

            <p className="mt-4 leading-relaxed text-[#6f5d5d]">
              {produto.descricao}
            </p>

            <div className="mt-5 rounded-[24px] bg-[#fbf8f5] p-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#6B0F1A]">
                Detalhes
              </h2>
              <div className="mt-3 space-y-2">
                {produto.detalhes.map((detalhe) => (
                  <div key={detalhe} className="flex items-start gap-2 text-sm text-[#665654]">
                    <ChevronRight size={16} className="mt-0.5 shrink-0 text-[#8A2132]" />
                    <span>{detalhe}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => adicionar(produto.id, produto.nome)}
                disabled={produtoEsgotado}
                className={`flex-1 rounded-2xl py-3 font-semibold transition active:scale-[0.98] ${
                  produtoEsgotado
                    ? "cursor-not-allowed bg-[#d6d0cb] text-[#7b7470]"
                    : "bg-[linear-gradient(135deg,#6B0F1A_0%,#8A2132_100%)] text-[#F7F3EE] shadow-[0_14px_26px_rgba(107,15,26,0.2)]"
                }`}
              >
                {produtoEsgotado ? "Indisponível" : "Adicionar ao carrinho"}
              </button>

              <a
                href={`https://wa.me/5599999999999?text=${encodeURIComponent(
                  whatsappMsg
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#d8cac2] bg-[#fbf8f5] py-3 font-semibold text-[#6B0F1A] transition hover:bg-[#f3ebe4] active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-[#241718]">
              Outros produtos
            </h2>
            <p className="mt-1 text-sm text-[#7d6a68]">
              Aproveite e adicione mais itens ao carrinho
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {outrosProdutos.map((item) => {
              const esgotado = !produtoDisponivel(item.nome)

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[24px] border border-[#eaded6] bg-white shadow-[0_14px_30px_rgba(74,9,18,0.08)]"
                >
                  <div className="relative">
                    <Link href={`/produto/${item.id}`} className="block">
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className={`h-28 w-full object-cover ${
                          esgotado ? "brightness-[0.55] blur-[1px]" : ""
                        }`}
                      />
                    </Link>

                    {esgotado && (
                      <div className="absolute left-2 top-2 rounded-full bg-[#6B0F1A] px-2 py-1 text-[10px] font-extrabold text-[#F7F3EE]">
                        ESGOTADO
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <Link href={`/produto/${item.id}`} className="block">
                      <h3 className="line-clamp-1 text-sm font-extrabold text-[#241718]">
                        {item.nome}
                      </h3>

                      <p className="mt-1 font-extrabold text-[#6B0F1A]">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </Link>

                    <button
                      onClick={() => adicionar(item.id, item.nome)}
                      disabled={esgotado}
                      className={`mt-3 w-full rounded-xl py-2 text-sm font-semibold transition active:scale-[0.98] ${
                        esgotado
                          ? "cursor-not-allowed bg-[#d6d0cb] text-[#7b7470]"
                          : "bg-[#6B0F1A] text-[#F7F3EE]"
                      }`}
                    >
                      {esgotado ? "Indisponível" : "Adicionar"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <a
        href="https://wa.me/5599999999999?text=Oi%2C%20quero%20tirar%20uma%20d%C3%BAvida"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-[#1fa855] p-4 text-white shadow-[0_18px_34px_rgba(31,168,85,0.34)] transition hover:scale-110 active:scale-95"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}