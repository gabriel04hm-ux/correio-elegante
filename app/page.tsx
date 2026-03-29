"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Search,
  Menu,
  MessageCircle,
  ShieldCheck,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  House,
  Package,
  Info,
  Image as ImageIcon,
  Instagram,
  Smartphone,
  CircleHelp,
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

type StoryItem = {
  id: number
  titulo: string
  imagem: string
  tipo?: "foto" | "video"
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
  const [indiceCarousel, setIndiceCarousel] = useState(0)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const mouseEndX = useRef<number | null>(null)

  const produtos: Produto[] = [
    {
      id: 1,
      nome: "Coração",
      preco: 0.5,
      imagem: "/p1.jpg",
      descricao: "Um gesto simples e cheio de carinho para surpreender alguém especial.",
    },
    {
      id: 2,
      nome: "Bala c/ coração",
      preco: 0.75,
      imagem: "/p2.jpg",
      descricao: "Um mimo doce com uma mensagem especial para alegrar o dia.",
    },
    {
      id: 3,
      nome: "Pirulito c/ coração",
      preco: 1,
      imagem: "/p3.jpg",
      descricao: "Uma forma divertida e doce de demonstrar carinho.",
    },
    {
      id: 4,
      nome: "Bombom c/ coração",
      preco: 3.5,
      imagem: "/p4.jpg",
      descricao: "Perfeito para surpreender com algo mais especial e saboroso.",
    },
    {
      id: 5,
      nome: "Fini c/ coração",
      preco: 2.5,
      imagem: "/p5.jpg",
      descricao: "Uma opção divertida e colorida para presentear.",
    },
    {
      id: 6,
      nome: "Polaroide c/ coração",
      preco: 4,
      imagem: "/p1.jpg",
      descricao: "Inclui uma foto especial para tornar o momento inesquecível.",
    },
    {
      id: 7,
      nome: "Flor c/ coração",
      preco: 12,
      imagem: "/p2.jpg",
      descricao: "Um presente completo, delicado e cheio de significado.",
    },
    {
      id: 8,
      nome: "Ingresso Dia D",
      preco: 3,
      imagem: "/p3.jpg",
      descricao: "Ingresso especial para o Dia D. Basta preencher nome completo, sala e CPF.",
    },
  ]

  const stories: StoryItem[] = [
    { id: 1, titulo: "Correio", imagem: "/story1.jpg", tipo: "foto" },
    { id: 2, titulo: "Dia D", imagem: "/story2.jpg", tipo: "video" },
    { id: 3, titulo: "Eventos", imagem: "/story3.jpg", tipo: "foto" },
    { id: 4, titulo: "Terceirão", imagem: "/story4.jpg", tipo: "video" },
    { id: 5, titulo: "Prévia", imagem: "/story5.jpg", tipo: "foto" },
  ]

  const fotosTerceirao = [
    "/story1.jpg",
    "/story2.jpg",
    "/story3.jpg",
    "/story4.jpg",
    "/story5.jpg",
  ]

  function proximaFoto() {
    setIndiceCarousel((prev) => (prev + 1) % fotosTerceirao.length)
  }

  function fotoAnterior() {
    setIndiceCarousel((prev) =>
      prev === 0 ? fotosTerceirao.length - 1 : prev - 1
    )
  }

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
    return () => window.removeEventListener("focus", aoFocar)
  }, [])

  useEffect(() => {
    carregarEstoque()
  }, [])

  useEffect(() => {
    if (fotosTerceirao.length <= 1) return

    const intervalo = setInterval(() => {
      proximaFoto()
    }, 3200)

    return () => clearInterval(intervalo)
  }, [fotosTerceirao.length])

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

  function iniciarToque(x: number) {
    touchStartX.current = x
    touchEndX.current = x
  }

  function moverToque(x: number) {
    touchEndX.current = x
  }

  function finalizarToque() {
    if (touchStartX.current === null || touchEndX.current === null) return

    const distancia = touchStartX.current - touchEndX.current

    if (distancia > 45) proximaFoto()
    else if (distancia < -45) fotoAnterior()

    touchStartX.current = null
    touchEndX.current = null
  }

  function iniciarMouse(x: number) {
    mouseStartX.current = x
    mouseEndX.current = x
  }

  function moverMouse(x: number) {
    if (mouseStartX.current !== null) {
      mouseEndX.current = x
    }
  }

  function finalizarMouse() {
    if (mouseStartX.current === null || mouseEndX.current === null) return

    const distancia = mouseStartX.current - mouseEndX.current

    if (distancia > 45) proximaFoto()
    else if (distancia < -45) fotoAnterior()

    mouseStartX.current = null
    mouseEndX.current = null
  }

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ef_0%,#f3ece6_50%,#fcfaf7_100%)] text-[#241718]">
      <header className="sticky top-0 z-40 border-b border-[#eaded6] bg-[rgba(248,244,239,0.92)] backdrop-blur-xl shadow-[0_10px_30px_rgba(101,8,20,0.08)]">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="z-10 rounded-2xl p-2.5 text-[#7d1020] transition hover:bg-[#f1e7e2] active:scale-95"
          >
            <Menu size={24} />
          </button>

          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </div>

          <Link href="/cart" className="relative z-10 rounded-2xl p-2.5 transition active:scale-95">
            <ShoppingCart
              size={28}
              className={`text-[#7d1020] transition duration-300 ${
                animar ? "scale-125" : "scale-100"
              }`}
            />
            {totalItens > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#7d1020] px-1 text-xs font-bold text-[#F7F3EE] shadow-lg">
                {totalItens}
              </span>
            )}
          </Link>
        </div>

        {menuAberto && (
          <div className="border-t border-[#eaded6] bg-[#fcfaf7] px-4 py-4 shadow-[0_16px_30px_rgba(101,8,20,0.08)]">
            <div className="mx-auto max-w-6xl space-y-2">
              <a
                href="#inicio"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <House size={18} />
                Início
              </a>

              <a
                href="#produtos"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <Package size={18} />
                Produtos
              </a>

              <a
                href="#como-funciona"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <CircleHelp size={18} />
                Como funciona
              </a>

              <a
                href="#terceirao"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <ImageIcon size={18} />
                Terceirão
              </a>

              <a
                href="#sobre"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <Info size={18} />
                Sobre nós
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <Instagram size={18} />
                Instagram
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#533f3f] transition hover:bg-[#f3ebe4] hover:text-[#7d1020]"
              >
                <Smartphone size={18} />
                TikTok
              </a>

              <a
                href="https://wa.me/5599999999999?text=Oi%2C%20quero%20tirar%20uma%20d%C3%BAvida%20sobre%20os%20produtos"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#7d1020_0%,#a2182d_100%)] px-3 py-3 text-sm font-semibold text-[#F7F3EE] shadow-[0_12px_24px_rgba(125,16,32,0.16)] transition hover:opacity-95"
              >
                <MessageCircle size={18} />
                Suporte no WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-5">
        <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stories.map((story) => (
            <button
              key={story.id}
              className="group shrink-0"
              type="button"
              onClick={() => setIndiceCarousel((story.id - 1) % fotosTerceirao.length)}
            >
              <div className="relative rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#7d1020_0deg,#b01c32_120deg,#d17482_240deg,#7d1020_360deg)] p-[2px] shadow-[0_8px_22px_rgba(125,16,32,0.14)] transition duration-300 group-active:scale-95">
                <div className="relative h-[74px] w-[74px] overflow-hidden rounded-full border-2 border-[#F7F3EE] bg-[#efe7df]">
                  <img
                    src={story.imagem}
                    alt={story.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {story.tipo === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/18">
                      <div className="rounded-full bg-white/88 p-1.5 text-[#7d1020]">
                        <Play size={14} fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 w-[78px] truncate text-center text-xs font-semibold text-[#5c4447]">
                {story.titulo}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section id="inicio" className="mx-auto max-w-6xl px-4 pt-6">
        <div className="flex items-center rounded-full border border-[#eaded6] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(101,8,20,0.06)]">
          <Search size={18} className="text-[#8f1830]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="ml-2 w-full bg-transparent text-[#241718] outline-none placeholder:text-[#9f8a86]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-[32px] border border-[#e7dbd3] shadow-[0_24px_56px_rgba(101,8,20,0.12)]">
          <img
            src="/banner.jpg"
            alt="Banner principal"
            className="h-[220px] w-full object-cover sm:h-[280px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(101,8,20,0.82)_0%,rgba(125,16,32,0.54)_40%,rgba(125,16,32,0.08)_100%)]" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 text-[#F7F3EE] sm:px-8">
            <span className="w-fit rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
              TERCEIRÃO 2026
            </span>
            <h1 className="mt-3 max-w-lg text-[2rem] font-extrabold leading-tight sm:text-[2.5rem]">
              Correio elegante com identidade, estilo e emoção
            </h1>
            <p className="mt-3 max-w-md text-sm text-[#f5e9e1] sm:text-base">
              Escolha seu produto, personalize o pedido e surpreenda alguém de um jeito especial.
            </p>
            <a
              href="#produtos"
              className="mt-5 w-fit rounded-full bg-[#F7F3EE] px-6 py-3 font-semibold text-[#7d1020] shadow-lg transition hover:scale-[1.03] active:scale-95"
            >
              Ver produtos
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            {
              icon: <ShieldCheck size={20} />,
              titulo: "Compra segura",
              texto: "Atendimento confiável e processo simples para pedir.",
            },
            {
              icon: <Truck size={20} />,
              titulo: "Entrega rápida",
              texto: "Seu pedido preparado com agilidade para não perder o momento.",
            },
            {
              icon: <MessageCircle size={20} />,
              titulo: "Suporte no WhatsApp",
              texto: "Tire dúvidas rapidamente e receba atendimento direto.",
            },
            {
              icon: <Star size={20} />,
              titulo: "Muito procurado",
              texto: "Produtos escolhidos para encantar e vender mais.",
            },
          ].map((item) => (
            <div
              key={item.titulo}
              className="min-w-[255px] rounded-[28px] border border-[#eaded6] bg-white p-5 shadow-[0_14px_34px_rgba(101,8,20,0.06)] transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 font-bold text-[#7d1020]">
                {item.icon}
                {item.titulo}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6f5d5d]">
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-5">
          <h2 className="text-3xl font-extrabold text-[#241718]">Produtos</h2>
          <p className="mt-1 text-sm text-[#7d6a68]">
            Clique no produto para ver a descrição completa
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((p) => {
            const whatsappMsg = `Oi, tenho interesse no ${p.nome}`
            const disponivel = produtoDisponivel(p.nome)
            const esgotado = !disponivel

            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-[28px] border border-[#eaded6] bg-white shadow-[0_16px_36px_rgba(101,8,20,0.06)] transition duration-300 hover:shadow-[0_22px_42px_rgba(101,8,20,0.10)]"
              >
                <Link href={`/produto/${p.id}`} className="block">
                  <div className="relative">
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className={`h-40 w-full object-cover transition duration-500 ${
                        esgotado ? "scale-[1.02] blur-[1px] brightness-[0.52]" : "hover:scale-105"
                      }`}
                    />

                    {esgotado && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#7d1020] px-4 py-1.5 text-xs font-extrabold tracking-wide text-[#F7F3EE] shadow-[0_10px_24px_rgba(101,8,20,0.28)]">
                        ESGOTADO
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-extrabold text-[#241718]">
                      {p.nome}
                    </h3>

                    <p className="mt-1 text-xl font-extrabold text-[#7d1020]">
                      R$ {p.preco.toFixed(2)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#7a6664]">
                      {p.descricao}
                    </p>
                  </div>
                </Link>

                <div className="px-4 pb-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => adicionar(p.id, p.nome)}
                    disabled={esgotado}
                    className={`w-full rounded-2xl py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                      esgotado
                        ? "cursor-not-allowed bg-[#d6d0cb] text-[#7b7470]"
                        : "bg-[linear-gradient(135deg,#7d1020_0%,#a2182d_100%)] text-[#F7F3EE] shadow-[0_12px_22px_rgba(125,16,32,0.20)] hover:opacity-95"
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
                    className="w-full rounded-2xl border border-[#d8cac2] bg-[#fbf8f5] py-2.5 text-center text-sm font-semibold text-[#7d1020] transition hover:bg-[#f3ebe4] active:scale-[0.98]"
                  >
                    Tirar dúvida
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {filtrados.length === 0 && (
          <div className="mt-4 rounded-[24px] border border-[#eaded6] bg-white p-6 text-center text-[#7d6a68] shadow-[0_12px_28px_rgba(101,8,20,0.06)]">
            Nenhum produto encontrado.
          </div>
        )}
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#7d1020_0%,#a2182d_58%,#be4054_100%)] p-6 text-[#F7F3EE] shadow-[0_24px_56px_rgba(101,8,20,0.22)]">
          <h2 className="text-3xl font-extrabold">Como funciona</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              {
                titulo: "1. Escolha",
                texto: "Clique no produto e veja os detalhes antes de comprar.",
              },
              {
                titulo: "2. Personalize",
                texto: "Adicione ao carrinho e preencha as informações do pedido.",
              },
              {
                titulo: "3. Finalize",
                texto: "Faça o pagamento e aguarde a entrega do seu pedido.",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-md"
              >
                <p className="text-lg font-bold">{item.titulo}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#f5e9e1]">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="terceirao" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="overflow-hidden rounded-[32px] border border-[#eaded6] bg-white p-4 shadow-[0_18px_40px_rgba(101,8,20,0.06)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold text-[#241718]">
              Momentos do terceirão
            </h2>
            <p className="mt-1 text-sm text-[#7d6a68]">
              Fotos, vídeos, correios elegantes e prévias dos eventos.
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] bg-[#efe7df] select-none"
            onTouchStart={(e) => iniciarToque(e.touches[0].clientX)}
            onTouchMove={(e) => moverToque(e.touches[0].clientX)}
            onTouchEnd={finalizarToque}
            onMouseDown={(e) => iniciarMouse(e.clientX)}
            onMouseMove={(e) => moverMouse(e.clientX)}
            onMouseUp={finalizarMouse}
            onMouseLeave={finalizarMouse}
          >
            <img
              src={fotosTerceirao[indiceCarousel]}
              alt={`Foto ${indiceCarousel + 1} do terceirão`}
              draggable={false}
              className="h-[270px] w-full object-cover transition duration-700 sm:h-[380px] md:h-[470px]"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.22)_100%)]" />

            <button
              type="button"
              onClick={fotoAnterior}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#7d1020] shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={proximaFoto}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#7d1020] shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {fotosTerceirao.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndiceCarousel(i)}
                  aria-label={`Ir para foto ${i + 1}`}
                  className={`rounded-full transition ${
                    i === indiceCarousel
                      ? "h-2.5 w-6 bg-white"
                      : "h-2.5 w-2.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="mx-auto max-w-6xl px-4 pb-28 pt-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] border border-[#eaded6] bg-white p-6 shadow-[0_16px_36px_rgba(101,8,20,0.06)]">
            <h2 className="text-3xl font-extrabold text-[#241718]">Sobre nós</h2>
            <p className="mt-3 leading-relaxed text-[#6f5d5d]">
              Criamos uma forma simples e especial de surpreender alguém com presentes
              e mensagens. Nosso foco é unir praticidade, carinho e um atendimento
              rápido para tornar cada pedido memorável.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#eaded6] bg-white p-6 shadow-[0_16px_36px_rgba(101,8,20,0.06)]">
            <h2 className="text-3xl font-extrabold text-[#241718]">
              Redes e suporte
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="https://wa.me/5599999999999?text=Oi%2C%20quero%20falar%20com%20o%20suporte"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-[linear-gradient(135deg,#7d1020_0%,#a2182d_100%)] py-3 text-center font-semibold text-[#F7F3EE] shadow-[0_14px_30px_rgba(125,16,32,0.20)] transition hover:opacity-95 active:scale-[0.98]"
              >
                Falar no WhatsApp
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[#d8cac2] bg-[#fbf8f5] py-3 text-center font-semibold text-[#7d1020] transition hover:bg-[#f3ebe4] active:scale-[0.98]"
              >
                Instagram
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[#d8cac2] bg-[#fbf8f5] py-3 text-center font-semibold text-[#7d1020] transition hover:bg-[#f3ebe4] active:scale-[0.98]"
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
        className="fixed bottom-4 right-4 z-50 rounded-full bg-[#1fa855] p-4 text-white shadow-[0_18px_34px_rgba(31,168,85,0.34)] transition hover:scale-110 active:scale-95"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  )
}