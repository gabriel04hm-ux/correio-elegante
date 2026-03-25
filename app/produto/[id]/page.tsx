"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, MessageCircle } from "lucide-react"

export default function ProdutoPage() {
  const params = useParams()
  const router = useRouter()

  const [animar, setAnimar] = useState(false)
  const [totalItens, setTotalItens] = useState(0)

  const produtos = [
    {
      id: 1,
      nome: "Produto 1",
      preco: 5,
      imagem: "/p1.jpg",
      descricao:
        "Descrição do produto 1. Ideal para surpreender com carinho e tornar o momento ainda mais especial.",
    },
    {
      id: 2,
      nome: "Produto 2",
      preco: 6,
      imagem: "/p2.jpg",
      descricao:
        "Descrição do produto 2. Uma opção linda para presentear de forma simples, rápida e especial.",
    },
    {
      id: 3,
      nome: "Produto 3",
      preco: 4,
      imagem: "/p3.jpg",
      descricao:
        "Descrição do produto 3. Perfeito para quem quer emocionar e deixar o pedido inesquecível.",
    },
    {
      id: 4,
      nome: "Produto 4",
      preco: 7,
      imagem: "/p4.jpg",
      descricao:
        "Descrição do produto 4. Uma escolha diferenciada para presentear com estilo e personalidade.",
    },
    {
      id: 5,
      nome: "Produto 5",
      preco: 3,
      imagem: "/p5.jpg",
      descricao:
        "Descrição do produto 5. Ótima opção para lembranças delicadas e cheias de significado.",
    },
  ]

  const produtoId = Number(params.id)
  const produto = useMemo(
    () => produtos.find((p) => p.id === produtoId),
    [produtoId]
  )

  const outrosProdutos = produtos.filter((p) => p.id !== produtoId)

  useEffect(() => {
    const atualizarCarrinho = () => {
      const carrinho: Record<string, number> = JSON.parse(
        localStorage.getItem("carrinho") || "{}"
      )

      const total = Object.values(carrinho).reduce(
        (acc, qtd) => acc + Number(qtd),
        0
      )

      setTotalItens(total)
    }

    atualizarCarrinho()
    window.addEventListener("focus", atualizarCarrinho)

    return () => {
      window.removeEventListener("focus", atualizarCarrinho)
    }
  }, [])

  function adicionar(id: number) {
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
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-72 sm:h-96 object-cover"
          />

          <div className="p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              {produto.nome}
            </h1>

            <p className="text-pink-600 font-extrabold text-2xl mt-2">
              R$ {produto.preco}
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {produto.descricao}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => adicionar(produto.id)}
                className="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-semibold hover:bg-pink-600 transition"
              >
                Adicionar ao carrinho
              </button>

              <a
                href={`https://wa.me/5599999999999?text=${encodeURIComponent(
                  whatsappMsg
                )}`}
                target="_blank"
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
            {outrosProdutos.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md border border-pink-100 overflow-hidden"
              >
                <Link href={`/produto/${item.id}`} className="block">
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    className="w-full h-24 sm:h-28 object-cover hover:scale-105 transition duration-300"
                  />

                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                      {item.nome}
                    </h3>

                    <p className="text-pink-600 font-extrabold mt-1">
                      R$ {item.preco}
                    </p>
                  </div>
                </Link>

                <div className="px-3 pb-3">
                  <button
                    onClick={() => adicionar(item.id)}
                    className="w-full bg-pink-500 text-white py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-pink-600 transition"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a
        href="https://wa.me/5599999999999?text=Oi%2C%20quero%20tirar%20uma%20d%C3%BAvida"
        target="_blank"
        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-xl z-50 hover:scale-110 transition"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}