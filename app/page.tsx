"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Search } from "lucide-react"

export default function Home() {
  const [busca, setBusca] = useState("")
  const [animar, setAnimar] = useState(false)
  const [totalItens, setTotalItens] = useState(0)

  useEffect(() => {
    const carrinho: Record<string, number> = JSON.parse(
      localStorage.getItem("carrinho") || "{}"
    )

    const total = Object.values(carrinho).reduce(
      (acc, qtd) => acc + Number(qtd),
      0
    )

    setTotalItens(total)
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

  const produtos = [
    { id: 1, nome: "Produto 1", preco: 5, imagem: "/p1.jpg" },
    { id: 2, nome: "Produto 2", preco: 6, imagem: "/p2.jpg" },
    { id: 3, nome: "Produto 3", preco: 4, imagem: "/p3.jpg" },
    { id: 4, nome: "Produto 4", preco: 7, imagem: "/p4.jpg" },
    { id: 5, nome: "Produto 5", preco: 3, imagem: "/p5.jpg" },
  ]

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="font-bold text-lg text-pink-600">💌 Correio Elegante</h1>

        <Link href="/cart" className="relative">
          <ShoppingCart
            size={26}
            className={`transition ${animar ? "scale-125" : "scale-100"}`}
          />

          {totalItens > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 rounded-full">
              {totalItens}
            </span>
          )}
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
          <Search size={18} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="ml-2 outline-none w-full text-black"
          />
        </div>
      </div>

      <div className="px-4">
        <img src="/banner.jpg" className="rounded-xl w-full shadow-md" />
      </div>

      <div className="flex gap-4 overflow-x-auto p-4">
        {["Amor", "Amizade", "Engraçado", "Anônimo"].map((c, i) => (
          <div key={i} className="flex flex-col items-center min-w-[70px]">
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center shadow text-xl">
              💖
            </div>

            <span className="text-xs mt-1 text-gray-700">{c}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
          >
            <img
              src={p.imagem}
              className="rounded-lg w-full h-32 object-cover"
            />

            <h2 className="text-sm mt-2 text-gray-800 font-semibold">
              {p.nome}
            </h2>

            <p className="font-bold text-pink-600">R$ {p.preco}</p>

            <button
              onClick={() => adicionar(p.id)}
              className="mt-2 w-full bg-pink-500 text-white py-2 rounded-lg text-sm hover:bg-pink-600"
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      <a
        href="https://wa.me/5599999999999"
        target="_blank"
        className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
      >
        💬
      </a>
    </div>
  )
}