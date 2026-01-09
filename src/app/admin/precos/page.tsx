'use client';

import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    serverTimestamp,
    doc
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

/* =======================
   INTERFACES
======================= */

interface Cliente {
    nome: string;
    endereco: string;
    enderecoEntrega: string;
    telefone: string;
    cnpj: string;
    inscricaoEstadual: string;
    nomeContato: string;
    nomeContatoCompra: string;
    diasRecebimento: string[];
    horarioRecebimento: string;
}

interface Produto {
    codigo: string;
    ean: string;
    nome: string;
    tamanho: string;
    decorado: string;
}

interface ProdutoNaTabela {
    codigo: string;
    precoCompra: number;
    porcentagemLucro: number;
    valorVenda: number;
}

interface TabelaPreco {
    nome: string;
    produtos: ProdutoNaTabela[];
}

/* =======================
   COMPONENTE
======================= */

export default function Precos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [tabelas, setTabelas] = useState<TabelaPreco[]>([]);
    const [selectedTabela, setSelectedTabela] = useState('');
    const [novaTabelaNome, setNovaTabelaNome] = useState('');
    const [selectedProduto, setSelectedProduto] = useState('');
    const [precoCompra, setPrecoCompra] = useState(0);
    const [porcentagemLucro, setPorcentagemLucro] = useState(0);
    const [reajusteTipo, setReajusteTipo] = useState<'porcentagem' | 'valor'>('porcentagem');
    const [reajusteValor, setReajusteValor] = useState(0);
    const [nomeCliente, setNomeCliente] = useState('');
    const [clientes, setClientes] = useState<Cliente[]>([]);

    /* =======================
       LOAD FIREBASE
    ======================= */

    useEffect(() => {
        loadProdutos();
        loadClientes();
        loadTabelas();
    }, []);

    const loadProdutos = async () => {
        const snap = await getDocs(collection(db, 'produtos'));
        const lista: Produto[] = snap.docs.map(d => ({
            codigo: String(d.data().codigo).trim(),
            ean: d.data().ean ?? '',
            nome: d.data().nome ?? '',
            tamanho: d.data().tamanho ?? '',
            decorado: d.data().decorado ?? ''
        }));
        setProdutos(lista);
    };

    const loadClientes = async () => {
        const snap = await getDocs(collection(db, 'clientes'));
        setClientes(snap.docs.map(d => d.data() as Cliente));
    };

    const loadTabelas = async () => {
        const snap = await getDocs(collection(db, 'tabelas'));
        const lista: TabelaPreco[] = snap.docs.map(d => ({
            nome: d.data().nome,
            produtos: d.data().produtos || []
        }));
        setTabelas(lista);
    };

    const syncTabelaFirebase = async (tabela: TabelaPreco) => {
        const snap = await getDocs(collection(db, 'tabelas'));
        const ref = snap.docs.find(d => d.data().nome === tabela.nome);
        if (!ref) return;

        await updateDoc(doc(db, 'tabelas', ref.id), {
            produtos: tabela.produtos,
            updatedAt: serverTimestamp()
        });
    };

    /* =======================
       MAPA DE PRODUTOS (FIX)
    ======================= */

    const produtosMap = useMemo(() => {
        const map = new Map<string, Produto>();
        produtos.forEach(p => map.set(p.codigo.trim(), p));
        return map;
    }, [produtos]);

    /* =======================
       TABELAS
    ======================= */

    const handleCriarTabela = async () => {
        if (!novaTabelaNome.trim()) return;

        await addDoc(collection(db, 'tabelas'), {
            nome: novaTabelaNome.trim(),
            produtos: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        setTabelas(prev => [...prev, { nome: novaTabelaNome.trim(), produtos: [] }]);
        setNovaTabelaNome('');
    };

    const handleAddProduto = () => {
        if (!selectedTabela || !selectedProduto) return;

        const codigo = selectedProduto.trim();
        const valorVenda = precoCompra * (1 + porcentagemLucro / 100);

        setTabelas(prev => {
            const novas = prev.map(t =>
                t.nome === selectedTabela
                    ? {
                        ...t,
                        produtos: [
                            ...t.produtos.filter(p => p.codigo !== codigo),
                            { codigo, precoCompra, porcentagemLucro, valorVenda }
                        ]
                    }
                    : t
            );

            const tabelaAtualizada = novas.find(t => t.nome === selectedTabela);
            if (tabelaAtualizada) syncTabelaFirebase(tabelaAtualizada);

            return novas;
        });
    };

    const handleReajuste = () => {
        if (!selectedTabela || reajusteValor <= 0) return;

        setTabelas(prev => {
            const novas = prev.map(t =>
                t.nome === selectedTabela
                    ? {
                        ...t,
                        produtos: t.produtos.map(p => {
                            const novoPreco =
                                reajusteTipo === 'porcentagem'
                                    ? p.precoCompra * (1 + reajusteValor / 100)
                                    : p.precoCompra + reajusteValor;

                            return {
                                ...p,
                                precoCompra: novoPreco,
                                valorVenda: novoPreco * (1 + p.porcentagemLucro / 100)
                            };
                        })
                    }
                    : t
            );

            const tabelaAtualizada = novas.find(t => t.nome === selectedTabela);
            if (tabelaAtualizada) syncTabelaFirebase(tabelaAtualizada);

            return novas;
        });

        setReajusteValor(0);
    };

    const handleDeleteProduto = (tabelaNome: string, codigo: string) => {
        setTabelas(prev => {
            const novas = prev.map(t =>
                t.nome === tabelaNome
                    ? { ...t, produtos: t.produtos.filter(p => p.codigo !== codigo) }
                    : t
            );

            const tabelaAtualizada = novas.find(t => t.nome === tabelaNome);
            if (tabelaAtualizada) syncTabelaFirebase(tabelaAtualizada);

            return novas;
        });
    };

    /* =======================
       PDF (INALTERADO, só lookup corrigido)
    ======================= */

    const handleGeneratePDF = async (tabela: TabelaPreco) => {
        if (!nomeCliente.trim()) {
            alert('Selecione um cliente');
            return;
        }

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 5;

        pdf.setFontSize(16);
        pdf.text(`Tabela de Preço`, 10, yPosition);
        pdf.setFontSize(12);
        pdf.text(`Cliente: ${nomeCliente}`, 10, yPosition + 7);
        yPosition += 12;

        pdf.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 5;

        const headers = ['Código', 'EAN', 'Nome', 'Valor Venda'];
        const columnWidths = [30, 40, 100, 20];

        let x = 10;
        headers.forEach((h, i) => {
            pdf.text(h, x, yPosition);
            x += columnWidths[i];
        });

        yPosition += 5;

        tabela.produtos.forEach(p => {
            const info = produtosMap.get(p.codigo);

            const row = [
                p.codigo,
                info?.ean || '',
                info?.nome || '',
                `R$ ${p.valorVenda.toFixed(2)}`
            ];

            x = 10;
            row.forEach((cell, i) => {
                pdf.text(cell, x, yPosition);
                x += columnWidths[i];
            });

            yPosition += 8;
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }
        });

        pdf.save(`${nomeCliente}.pdf`);
        setNomeCliente('');
    };


    /* =======================
       JSX (100% ORIGINAL)
    ======================= */


    return (
        <div className="container mx-auto p-4 text-gray-800 bg-white w-6xl">
            
            <h1 className="text-3xl font-bold mb-4 text-center">Gerenciamento de Preços</h1>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Criar Nova Tabela de Preços</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={novaTabelaNome}
                        onChange={(e) => setNovaTabelaNome(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Nome da Tabela"
                    />
                    <button
                        onClick={handleCriarTabela}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Criar Tabela
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Gerenciar Tabela</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Selecionar Tabela</label>
                        <select
                            value={selectedTabela}
                            onChange={(e) => setSelectedTabela(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Selecione uma Tabela</option>
                            {tabelas.map(t => <option key={t.nome} value={t.nome}>{t.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Produto</label>
                        <select
                            value={selectedProduto}
                            onChange={(e) => setSelectedProduto(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Selecione um Produto</option>
                            {produtos.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} - {p.nome} {p.tamanho} {p.decorado} </option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço de Compra</label>
                        <input
                            type="number"
                            value={precoCompra}
                            onChange={(e) => setPrecoCompra(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Porcentagem de Lucro (%)</label>
                        <input
                            type="number"
                            value={porcentagemLucro}
                            onChange={(e) => setPorcentagemLucro(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAddProduto}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                            Adicionar Produto
                        </button>
                    </div>
                </div>
                {selectedTabela && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Reajuste de Preços na Tabela</h3>
                        <div className="flex gap-4">
                            <select
                                value={reajusteTipo}
                                onChange={(e) => setReajusteTipo(e.target.value as 'porcentagem' | 'valor')}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="porcentagem">Porcentagem (%)</option>
                                <option value="valor">Valor Fixo (R$)</option>
                            </select>
                            <input
                                type="number"
                                value={reajusteValor}
                                onChange={(e) => setReajusteValor(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                                step="0.01"
                                placeholder={reajusteTipo === 'porcentagem' ? 'Ex: 10' : 'Ex: 5.00'}
                            />
                            <button
                                onClick={handleReajuste}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                            >
                                Aplicar Reajuste
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Configurações do PDF</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                        <select
                            value={nomeCliente}
                            onChange={(e) => {setNomeCliente(e.target.value)}}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Selecione um Cliente</option>
                            {clientes.map(c => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
                          
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Tabelas de Preços</h2>
                {tabelas.map(tabela => (
                    <div key={tabela.nome} className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold">{tabela.nome}</h3>
                            <button
                                onClick={() => handleGeneratePDF(tabela)}
                                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            >
                                Gerar PDF
                            </button>
                        </div>
                        {tabela.produtos.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2">Código</th>
                                            <th className="border border-gray-300 px-4 py-2">EAN</th>
                                            <th className="border border-gray-300 px-4 py-2">Nome</th>
                                            <th className="border border-gray-300 px-4 py-2">Valor Venda</th>
                                            <th className="border border-gray-300 px-4 py-2">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tabela.produtos.map(produto => {
                                            const prodInfo = produtos.find(p => p.codigo === produto.codigo);
                                            return (
                                                <tr key={produto.codigo}>
                                                    <td className="border border-gray-300 px-4 py-2">{produto.codigo}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{prodInfo?.ean || ''}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{prodInfo?.nome || ''}</td>
                                                    <td className="border border-gray-300 px-4 py-2">R$ {produto.valorVenda.toFixed(2)}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        <button
                                                            onClick={() => handleDeleteProduto(tabela.nome, produto.codigo)}
                                                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                                        >
                                                            Remover
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">Nenhum produto nesta tabela.</p>
                        )}
                    </div>
                ))}
            </div>
          
        </div>
    );
}