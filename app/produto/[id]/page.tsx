"use client";

import { useParams } from "next/navigation";

const produtos = [
  {
    id: "1",
    nome: "Produto 1",
    preco: 1,
    imagem: "/p1.jpg",
    descricao: "Descrição do produto 1. Aqui você explica o que é, como funciona e porque comprar.",
  },
  {
    id: "2",
    nome: "Produto 2",
    preco: 4,
    imagem: "/p2.jpg",
    descricao: "Descrição do produto 2.",
  },
  {
    id: "3",
    nome: "Produto 3",
    preco: 5,
    imagem: "/p3.jpg",
    descricao: "Descrição do produto 3.",
  },
  {
    id: "4",
    nome: "Produto 4",
    preco: 6,
    imagem: "/p4.jpg",
    descricao: "Descrição do produto 4.",
  },
  {
    id: "5",
    nome: "Produto 5",
    preco: 7,
    imagem: "/p5.jpg",
    descricao: "Descrição do produto 5.",
  },
];

export default function ProdutoPage() {
  const params = useParams();
  const produto = produtos.find((p) => p.id === params.id);

  if (!produto) return <div>Produto não encontrado</div>;

  const whatsappMsg = `Oi, tenho interesse no ${produto.nome}`;

  return (
    <div className="p-4 max-w-md mx-auto">
      <img src={produto.imagem} className="w-full rounded-xl" />

      <h1 className="text-2xl font-bold mt-4">{produto.nome}</h1>
      <p className="text-green-600 text-xl font-semibold mt-2">
        R$ {produto.preco}
      </p>

      <p className="mt-4 text-gray-700">{produto.descricao}</p>

      <button
        className="bg-pink-500 text-white w-full py-3 rounded-xl mt-6"
        onClick={() => window.location.href = "/cart"}
      >
        Comprar
      </button>

      <a
        href={`https://wa.me/5531999999999?text=${encodeURIComponent(
          whatsappMsg
        )}`}
        target="_blank"
        className="block text-center border border-green-500 text-green-600 py-3 rounded-xl mt-3"
      >
        Falar no WhatsApp
      </a>
    </div>
  );
}