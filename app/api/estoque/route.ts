import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EstoqueItem = {
  produto: string;
  disponivel: boolean;
  esgotado: boolean;
};

function normalizarNomeProduto(nome: string) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export async function GET() {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        {
          ok: false,
          erro: "GOOGLE_SCRIPT_URL não configurada no ambiente.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const url = `${scriptUrl}?action=estoque`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const texto = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          erro: "Falha ao consultar o Apps Script.",
          statusExterno: response.status,
          respostaExterna: texto,
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    let data: any;

    try {
      data = JSON.parse(texto);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          erro: "O Apps Script não retornou um JSON válido.",
          respostaExterna: texto,
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    if (!data?.ok) {
      return NextResponse.json(
        {
          ok: false,
          erro: data?.erro || "O Apps Script retornou uma resposta inválida.",
          respostaOriginal: data,
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const estoqueRecebido = Array.isArray(data?.itens) ? data.itens : [];

    const itensNormalizados: EstoqueItem[] = estoqueRecebido.map((item: any) => {
      const produto = String(item?.produto || "");
      const disponivel = Boolean(item?.disponivel);

      return {
        produto,
        disponivel,
        esgotado: !disponivel,
      };
    });

    const estoquePorProduto = itensNormalizados.reduce<Record<string, EstoqueItem>>(
      (acc, item) => {
        acc[normalizarNomeProduto(item.produto)] = item;
        return acc;
      },
      {}
    );

    return NextResponse.json(
      {
        ok: true,
        itens: itensNormalizados,
        estoquePorProduto,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        erro: "Erro interno ao buscar estoque.",
        detalhes: error?.message || "Erro desconhecido.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}