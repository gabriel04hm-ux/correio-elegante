type CheckoutPageProps = {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const status = params.status

  let mensagem = "Aguardando retorno do pagamento..."

  if (status === "success") {
    mensagem = "Pagamento aprovado com sucesso!"
  }

  if (status === "failure") {
    mensagem = "Pagamento não foi concluído."
  }

  if (status === "pending") {
    mensagem = "Pagamento pendente."
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-black mb-4">Checkout</h1>
        <p className="text-gray-700">{mensagem}</p>
      </div>
    </div>
  )
}