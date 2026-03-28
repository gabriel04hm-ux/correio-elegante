"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, MessageCircle } from "lucide-react"

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

export default function ProdutoPage() {
  const params = useParams()
  const router = useRouter()

  const [animar, setAnimar] = useState(false)
  const [totalItens, setTotalItens] = useState(0)
  const [estoquePorProduto, setEstoquePorProduto] = useState<EstoquePorProduto>({})
  const [carregandoEstoque, setCarregandoEstoque] = useState(true)

  const produtos = [
    {
      id: 1,
      nome: "Coração",
      preco: 0.5,
      imagem: "/p1.jpg",
      descricao:
        "Um gesto simples e cheio de carinho para surpreender alguém especial.",
    },
    {
      id: 2,
      nome: "Bala c/ coração",
      preco: 0.75,
      imagem: "/p2.jpg",
      descricao:
        "Um mimo doce com uma mensagem especial para alegrar o dia.",
    },
    {
      id: 3,
      nome: "Pirulito c/ coração",
      preco: 1,
      imagem: "/p3.jpg",
      descricao:
        "Uma forma divertida e doce de demonstrar carinho.",
    },
    {
      id: 4,
      nome: "Bombom c/ coração",
      preco: 3.5,
      imagem: "/p4.jpg",
      descricao:
        "Perfeito para surpreender com algo mais especial e saboroso.",
    },
    {
      id: 5,
      nome: "Fini c/ coração",
      preco: 2.5,
      imagem: "/p5.jpg",
      descricao:
        "Uma opção divertida e colorida para presentear.",
    },
    {
      id: 6,
      nome: "Polaroide c/ coração",
      preco: 4,
      imagem: "/p1.jpg",
      descricao:
        "Inclui uma foto especial para tornar o momento inesquecível.",
    },
    {
      id: 7,
      nome: "Flor c/ coração",
      preco: 12,
      imagem: "/p2.jpg",
      descricao:
        "Um presente completo, delicado e cheio de significado.",
    },
    {
      id: 8,
      nome: "Ingresso Dia D",
      preco: 3,
      imagem: "/p3.jpg",
      descricao:
        "Ingresso especial para o Dia D. Basta preencher nome completo, sala e CPF.",
    },
  ]

  const produtoId = Number(params.id)
  const produto = useMemo(
    () => produtos.find((p) => p.id === produtoId),
    [produtoId]
  )

  const outrosProdutos = produtos.filter((p) => p.id !== produtoId)

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

    return () => {
      window.removeEventListener("focus", aoFocar)
    }
  }, [])

  function produtoDisponivel(nomeProduto: string) {
    const chave = normalizarNomeProduto(nomeProduto)
    const item = estoquePorProduto[chave]

    if (carregandoEstoque) return true
    if (!item) return true

    return Boolean(item.disponivel)
  }

  function adicionar(id: number, nomeProduto: string) {
    if (!produtoDisponivel(nomeProduto)) {
      return
    }

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
    setTimeout(() => setAnimar(false), 300)
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white text-black">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white shadow border border-pink-100"
            >
              <ArrowLeft size={22} className="text-pink-600" />
            </button>

            <Link href="/cart" className="relative">
              <ShoppingCart size={26} className="text-pink-600" />
            </Link>
          </div>

          <div className="mt-10 bg-white rounded-3xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Produto não encontrado
            </h1>
            <p className="text-gray-500 mt-2">
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white text-black">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="sticky top-0 z-40 bg-pink-50/90 backdrop-blur rounded-2xl">
          <div className="flex items-center justify-between px-1 py-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white shadow border border-pink-100 hover:bg-pink-50 transition"
            >
              <ArrowLeft size={22} className="text-pink-600" />
            </button>

            <Link href="/cart" className="relative">
              <ShoppingCart
                size={28}
                className={`text-pink-600 transition duration-300 ${
                  animar ? "scale-125" : "scale-100"
                }`}
              />

              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-bold">
                  {totalItens}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="mt-3 bg-white rounded-3xl shadow-lg overflow-hidden border border-pink-100">
          <div className="relative">
            {produtoEsgotado && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                ESGOTADO
              </div>
            )}

            <img
              src={produto.imagem}
              alt={produto.nome}
              className={`w-full h-72 sm:h-96 object-cover ${
                produtoEsgotado ? "grayscale" : ""
              }`}
            />
          </div>

          <div className="p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              {produto.nome}
            </h1>

            <p className="text-pink-600 font-extrabold text-2xl mt-2">
              R$ {produto.preco.toFixed(2)}
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {produto.descricao}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => adicionar(produto.id, produto.nome)}
                disabled={produtoEsgotado}
                className={`flex-1 py-3 rounded-2xl font-semibold transition ${
                  produtoEsgotado
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-pink-500 text-white hover:bg-pink-600"
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
                className="flex-1 border border-green-500 text-green-600 py-3 rounded-2xl font-semibold text-center hover:bg-green-50 transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                Outros produtos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Aproveite e adicione mais itens ao carrinho
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {outrosProdutos.map((item) => {
              const esgotado = !produtoDisponivel(item.nome)

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-md border border-pink-100 overflow-hidden ${
                    esgotado ? "opacity-80" : ""
                  }`}
                >
                  <div className="relative">
                    {esgotado && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                        ESGOTADO
                      </div>
                    )}

                    <Link href={`/produto/${item.id}`} className="block">
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className={`w-full h-24 sm:h-28 object-cover transition duration-300 ${
                          esgotado ? "grayscale" : "hover:scale-105"
                        }`}
                      />

                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                          {item.nome}
                        </h3>

                        <p className="text-pink-600 font-extrabold mt-1">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="px-3 pb-3">
                    <button
                      onClick={() => adicionar(item.id, item.nome)}
                      disabled={esgotado}
                      className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        esgotado
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-pink-500 text-white hover:bg-pink-600"
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
        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-xl z-50 hover:scale-110 transition"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}