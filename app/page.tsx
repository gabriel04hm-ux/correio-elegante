"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Search,
  Menu,
  MessageCircle,
  ShieldCheck,
  Truck,
  Star,
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
}

function normalizarNomeProduto(nome: string) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export default function Home() {
  const [busca, setBusca] = useState("")
  const [animar, setAnimar] = useState(false)
  const [totalItens, setTotalItens] = useState(0)
  const [menuAberto, setMenuAberto] = useState(false)
  const [estoquePorProduto, setEstoquePorProduto] = useState<EstoquePorProduto>({})
  const [carregandoEstoque, setCarregandoEstoque] = useState(true)

  const produtos: Produto[] = [
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

  function atualizarTotalCarrinho() {
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

    for (const produto of produtos) {
      const chaveEstoque = normalizarNomeProduto(produto.nome)
      const itemEstoque = estoque[chaveEstoque]

      if (itemEstoque && !itemEstoque.disponivel) {
        const id = String(produto.id)

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
      atualizarTotalCarrinho()
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
    atualizarTotalCarrinho()

    const aoFocar = () => {
      atualizarTotalCarrinho()
      carregarEstoque()
    }

    window.addEventListener("focus", aoFocar)

    return () => {
      window.removeEventListener("focus", aoFocar)
    }
  }, [])

  useEffect(() => {
    carregarEstoque()
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

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white text-black">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100 shadow-sm">
        <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="p-2 rounded-lg hover:bg-pink-50 transition"
            >
              <Menu size={24} className="text-pink-600" />
            </button>

            <div>
              <p className="font-bold text-lg text-pink-600 leading-none">
                Correio Elegante
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Presentes e mensagens especiais
              </p>
            </div>
          </div>

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

        {menuAberto && (
          <div className="border-t border-pink-100 bg-white px-4 py-3 shadow-sm">
            <div className="max-w-6xl mx-auto flex flex-col gap-3 text-sm font-medium text-gray-700">
              <a
                href="#inicio"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                🏠 Início
              </a>
              <a
                href="#produtos"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                📦 Produtos
              </a>
              <a
                href="#sobre"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                📜 Sobre nós
              </a>
              <a
                href="https://wa.me/5599999999999?text=Oi%2C%20quero%20tirar%20uma%20d%C3%BAvida%20sobre%20os%20produtos"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                💬 Suporte no WhatsApp
              </a>
              <a
                href="#como-funciona"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                💰 Como funciona
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                📸 Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="hover:text-pink-600"
              >
                📱 TikTok
              </a>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="max-w-6xl mx-auto px-4 pt-5">
        <div className="flex items-center bg-white rounded-full px-4 py-3 shadow-md border border-pink-100">
          <Search size={18} className="text-pink-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="ml-2 outline-none w-full bg-transparent text-black placeholder:text-gray-400"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl shadow-lg">
          <img
            src="/banner.jpg"
            alt="Banner principal"
            className="w-full h-[180px] sm:h-[240px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-pink-700/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
            <h1 className="text-2xl sm:text-4xl font-extrabold max-w-xl leading-tight">
              Presentes e mensagens para momentos especiais
            </h1>
            <p className="mt-2 text-sm sm:text-base max-w-md text-pink-50">
              Escolha seu produto, personalize e surpreenda alguém de forma única.
            </p>
            <a
              href="#produtos"
              className="mt-4 w-fit bg-white text-pink-600 font-semibold px-5 py-2 rounded-full shadow hover:scale-105 transition"
            >
              Ver produtos
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-5">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="min-w-[230px] bg-white rounded-2xl shadow-md border border-pink-100 p-4">
            <div className="flex items-center gap-2 text-pink-600 font-bold">
              <ShieldCheck size={20} />
              Compra segura
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Atendimento confiável e processo simples para pedir.
            </p>
          </div>

          <div className="min-w-[230px] bg-white rounded-2xl shadow-md border border-pink-100 p-4">
            <div className="flex items-center gap-2 text-pink-600 font-bold">
              <Truck size={20} />
              Entrega rápida
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Seu pedido preparado com agilidade para não perder o momento.
            </p>
          </div>

          <div className="min-w-[230px] bg-white rounded-2xl shadow-md border border-pink-100 p-4">
            <div className="flex items-center gap-2 text-pink-600 font-bold">
              <MessageCircle size={20} />
              Suporte no WhatsApp
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tire dúvidas rapidamente e receba atendimento direto.
            </p>
          </div>

          <div className="min-w-[230px] bg-white rounded-2xl shadow-md border border-pink-100 p-4">
            <div className="flex items-center gap-2 text-pink-600 font-bold">
              <Star size={20} />
              Muito procurado
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Produtos escolhidos para encantar e vender mais.
            </p>
          </div>
        </div>
      </section>

      <section id="produtos" className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Produtos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Clique no produto para ver a descrição completa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtrados.map((p) => {
            const whatsappMsg = `Oi, tenho interesse no ${p.nome}`
            const disponivel = produtoDisponivel(p.nome)
            const esgotado = !disponivel

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-pink-100 ${
                  esgotado ? "opacity-80" : ""
                }`}
              >
                <div className="relative">
                  {esgotado && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      ESGOTADO
                    </div>
                  )}

                  <Link href={`/produto/${p.id}`} className="block">
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className={`w-full h-36 object-cover transition duration-300 ${
                        esgotado ? "grayscale" : "hover:scale-105"
                      }`}
                    />

                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {p.nome}
                      </h3>

                      <p className="font-extrabold text-pink-600 text-lg mt-1">
                        R$ {p.preco.toFixed(2)}
                      </p>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {p.descricao}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="px-3 pb-3 flex flex-col gap-2">
                  <button
                    onClick={() => adicionar(p.id, p.nome)}
                    disabled={esgotado}
                    className={`w-full py-2 rounded-xl text-sm font-semibold transition ${
                      esgotado
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-pink-500 text-white hover:bg-pink-600"
                    }`}
                  >
                    {esgotado ? "Indisponível" : "Adicionar ao carrinho"}
                  </button>

                  <a
                    href={`https://wa.me/5599999999999?text=${encodeURIComponent(
                      whatsappMsg
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full border border-green-500 text-green-600 py-2 rounded-xl text-sm font-semibold text-center hover:bg-green-50 transition"
                  >
                    Tirar dúvida
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {filtrados.length === 0 && (
          <div className="bg-white rounded-2xl p-6 mt-4 shadow text-center text-gray-500">
            Nenhum produto encontrado.
          </div>
        )}
      </section>

      <section id="como-funciona" className="max-w-6xl mx-auto px-4 pt-10">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-extrabold">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-5">
            <div className="bg-white/15 rounded-2xl p-4">
              <p className="font-bold text-lg">1. Escolha</p>
              <p className="text-sm text-pink-50 mt-1">
                Clique no produto e veja os detalhes antes de comprar.
              </p>
            </div>

            <div className="bg-white/15 rounded-2xl p-4">
              <p className="font-bold text-lg">2. Personalize</p>
              <p className="text-sm text-pink-50 mt-1">
                Adicione ao carrinho e preencha as informações do pedido.
              </p>
            </div>

            <div className="bg-white/15 rounded-2xl p-4">
              <p className="font-bold text-lg">3. Finalize</p>
              <p className="text-sm text-pink-50 mt-1">
                Faça o pagamento e aguarde a entrega do seu pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="max-w-6xl mx-auto px-4 pt-10 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-md border border-pink-100 p-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Sobre nós</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">
              Criamos uma forma simples e especial de surpreender alguém com
              presentes e mensagens. Nosso foco é unir praticidade, carinho e
              um atendimento rápido para tornar cada pedido memorável.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-pink-100 p-6">
            <h2 className="text-2xl font-extrabold text-gray-800">
              Redes e suporte
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="https://wa.me/5599999999999?text=Oi%2C%20quero%20falar%20com%20o%20suporte"
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white py-3 rounded-xl text-center font-semibold hover:bg-green-600 transition"
              >
                Falar no WhatsApp
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="border border-pink-300 text-pink-600 py-3 rounded-xl text-center font-semibold hover:bg-pink-50 transition"
              >
                Instagram
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="border border-pink-300 text-pink-600 py-3 rounded-xl text-center font-semibold hover:bg-pink-50 transition"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

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