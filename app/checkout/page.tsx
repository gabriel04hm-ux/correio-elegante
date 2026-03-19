"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Search } from "lucide-react"

export default function Home(){

const [busca,setBusca] = useState("")

const produtos = [
{ id:1, nome:"Produto 1", preco:5, imagem:"/p1.jpg" },
{ id:2, nome:"Produto 2", preco:6, imagem:"/p2.jpg" },
{ id:3, nome:"Produto 3", preco:4, imagem:"/p3.jpg" },
{ id:4, nome:"Produto 4", preco:7, imagem:"/p4.jpg" },
{ id:5, nome:"Produto 5", preco:3, imagem:"/p5.jpg" },
]

const filtrados = produtos.filter(p =>
p.nome.toLowerCase().includes(busca.toLowerCase())
)

return(

<div className="min-h-screen bg-gray-100">

{/* HEADER */}
<div className="flex justify-end p-4 bg-white shadow">

<Link href="/cart">
<ShoppingCart size={26} />
</Link>

</div>

{/* BUSCA */}
<div className="p-4">

<div className="flex items-center bg-white rounded-full px-4 py-2 shadow">

<Search size={18} />

<input
value={busca}
onChange={(e)=>setBusca(e.target.value)}
placeholder="O que você está buscando?"
className="ml-2 outline-none w-full"
/>

</div>

</div>

{/* BANNER */}
<div className="px-4">
<img
src="/banner.jpg"
className="rounded-xl w-full"
/>
</div>

{/* CATEGORIAS */}
<div className="flex gap-4 overflow-x-auto p-4">

{["Amor","Amizade","Engraçado","Anônimo"].map((c,i)=>(
<div key={i} className="flex flex-col items-center min-w-[70px]">

<div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow">
❤️
</div>

<span className="text-xs mt-1">
{c}
</span>

</div>
))}

</div>

{/* PRODUTOS */}
<div className="grid grid-cols-2 gap-4 p-4">

{filtrados.map(p=>(
<div key={p.id} className="bg-white p-2 rounded-xl shadow">

<img src={p.imagem} className="rounded-lg"/>

<h2 className="text-sm mt-2">
{p.nome}
</h2>

<p className="font-bold">
R$ {p.preco}
</p>

</div>
))}

</div>

{/* BOTÃO WHATSAPP */}
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