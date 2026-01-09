"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

/* ===================== TIPOS ===================== */

export type CorProduto =
  | "Branco"
  | "Preto"
  | "Azul"
  | "Vermelho"
  | "Amarelo"
  | "Verde"
  | "Cinza"
  | "Roxo"
  | "Laranja"
  | "Rosa"
  | "Prata";

export interface Produto {
  codigo?: string;
  ncm?: string;
  ean?: string;
  nome?: string;
  categoria?: string;
  fornecedor?: string;
  imagens?: string[];
  tamanho?: string;
  cores?: CorProduto[];
  comprimento?: number;
  largura?: number;
  altura?: number;
  peso?: number;
  litragem?: number;
  material?: string;
  decorado?: string;
  createdAt?: Timestamp;
}

/* ===================== COMPONENT ===================== */

export function UploadProdutos() {
  const [file, setFile] = useState<File | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ===================== HELPERS ===================== */

  // Remove campos undefined (Firestore não aceita)
  function sanitizeData(produto: Produto) {
    const clean: Record<string, any> = {};
    Object.entries(produto).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        clean[key] = value;
      }
    });
    return clean;
  }

  function parseArray(value: any): string[] | undefined {
    if (!value) return undefined;
    return String(value)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  }

  /* ===================== HANDLERS ===================== */

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const parsed: Produto[] = rows.map((row) => ({
        codigo: row.codigo,
        ncm: row.ncm,
        ean: row.ean,
        nome: row.nome,
        categoria: row.categoria,
        fornecedor: row.fornecedor,
        imagens: parseArray(row.imagens),
        tamanho: row.tamanho,
        cores: parseArray(row.cores) as CorProduto[] | undefined,
        comprimento: parseNumber(row.comprimento),
        largura: parseNumber(row.largura),
        altura: parseNumber(row.altura),
        peso: parseNumber(row.peso),
        litragem: parseNumber(row.litragem),
        material: row.material,
        decorado: row.decorado,
      }));

      setProdutos(parsed);

      for (const produto of parsed) {
        if (!produto.codigo) continue;

        const q = query(
          collection(db, "produtos"),
          where("codigo", "==", produto.codigo)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          // UPDATE
          const docRef = snap.docs[0].ref;
          const updateData = sanitizeData(produto);
          await updateDoc(docRef, updateData);
        } else {
          // CREATE
          const createData = sanitizeData(produto);
          createData.createdAt = Timestamp.now();
          await addDoc(collection(db, "produtos"), createData);
        }
      }

      setMessage(`✔ ${parsed.length} produtos importados/atualizados com sucesso`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao importar a planilha");
    } finally {
      setLoading(false);
    }
  }

  /* ===================== UI ===================== */

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Importar Produtos</h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          {loading ? "Importando..." : "Importar Planilha"}
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>

      {produtos.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Pré-visualização</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Código</th>
                <th className="p-2">Nome</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Fornecedor</th>
                <th className="p-2">Cores</th>
                <th className="p-2">Material</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p.codigo}</td>
                  <td className="p-2">{p.nome}</td>
                  <td className="p-2">{p.categoria}</td>
                  <td className="p-2">{p.fornecedor}</td>
                  <td className="p-2">{p.cores?.join(", ")}</td>
                  <td className="p-2">{p.material}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
