'use client';

import { Edit, PlusIcon, Trash2, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/src/context/AuthContext";

import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  updateDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type CorProduto =
  | 'Branco'
  | 'Preto'
  | 'Azul'
  | 'Vermelho'
  | 'Amarelo'
  | 'Verde'
  | 'Cinza'
  | 'Roxo'
  | 'Laranja'
  | 'Rosa'
  | 'Prata';


export interface Produto {
    id: string;
    codigo: string;
    ean: string;
    nome: string;
    categoria: string;
    fornecedor: string;
    imagens: string[];
    createdAt?: Timestamp;
    tamanho: string;
    ncm?: string;
    cores: CorProduto[];
    comprimento?: number;
    largura?: number;
    altura?: number;
    peso?: number;
    litragem?: number;
    material: string;
    decorado?: string;
}


export default function Produtos() {
    const { user, loading } = useAuth();

    // ✅ TODOS os hooks primeiro
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [fornecedores, setFornecedores] = useState<string[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [selectedFornecedor, setSelectedFornecedor] = useState<string | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

    const [form, setForm] = useState<Produto>({
        id: '',
        codigo: '',
        ean: '',
        nome: '',
        categoria: '',
        fornecedor: '',
        imagens: [''],
        tamanho: '',
        ncm: '',
        cores: [],
        material: '',
        comprimento: 0,
        largura: 0,
        altura: 0,
        peso: 0,
        litragem: 0,
        decorado: '',
    });

    useEffect(() => {
        if (loading || !user) return; // espera o Firebase carregar

        // TODOS os usuários podem carregar produtos, categorias e fornecedores
        loadProdutos();
        loadCategorias();
        loadFornecedores();
    }, [user, loading]);


     useEffect(() => {
        const { comprimento, altura, largura, decorado } = form;

        if (!comprimento || !altura || !largura) {
            setForm(prev => ({ ...prev, litragem: 0 }));
            return;
        }

        const fator =
            decorado === 'Decorado' || decorado === 'Decorada'
            ? 65
            : decorado === 'Simples'
            ? 75
            : 0;

        const resultado =
            ((comprimento * altura * largura) / 1000) * fator;

        setForm(prev => ({
            ...prev,
            litragem: Number(resultado.toFixed(0)),
        }));

        

    }, [
        form.comprimento,
        form.altura,
        form.largura,
        form.decorado,
    ]);

    // ⬇️ AGORA sim pode usar lógica condicional
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                Carregando...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                Você precisa estar logado para acessar esta página.
            </div>
        );
    }

    const CORES_DISPONIVEIS: CorProduto[] = [
        'Branco',
        'Preto',
        'Azul',
        'Vermelho',
        'Amarelo',
        'Verde',
        'Cinza',
        'Roxo',
        'Laranja',
        'Rosa',
        'Prata',
    ];

    
    function handleImagemChange(index: number, value: string) {
        const novasImagens = [...form.imagens];
        novasImagens[index] = value;
        setForm({ ...form, imagens: novasImagens });
    }

    function addImagem() {
        setForm({ ...form, imagens: [...form.imagens, ''] });
    }

    function removeImagem(index: number) {
        const novasImagens = form.imagens?.filter((_, i) => i !== index);
        setForm({ ...form, imagens: novasImagens });
    }


    async function loadCategorias() {
        const q = query(
            collection(db, "categorias"),
            orderBy("nome")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(doc => doc.data().nome as string);
        setCategorias(data);
        }

        async function loadFornecedores() {
        const q = query(
            collection(db, "fornecedores"),
            orderBy("nome")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(doc => doc.data().nome as string);
        setFornecedores(data);
    }

   
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (value === 'nova' && (name === 'categoria' || name === 'fornecedor')) {
            setNewItemName('');
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    async function loadProdutos() {
        const q = query(
            collection(db, 'produtos'),
            orderBy('createdAt', 'desc')
        );

        const snap = await getDocs(q);

        const data: Produto[] = snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Produto, 'id'>),
        }));

        setProdutos(data);
    }


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const novoProduto = {
            codigo: form.codigo,
            ean: form.ean,
            nome: form.nome,
            categoria: form.categoria,
            fornecedor: form.fornecedor,
            imagens: form.imagens.filter(img => img.trim() !== ''),
            tamanho: form.tamanho,
            ncm: form.ncm,
            cores: form.cores,
            decorado: form.decorado,
            material: form.material,
            comprimento: form.comprimento,
            largura: form.largura,
            altura: form.altura,
            peso: form.peso,
            litragem: form.litragem,
        };

        if (editingIndex !== null && form.id) {
            // ✏️ EDITAR
            const ref = doc(db, 'produtos', form.id);
            await updateDoc(ref, novoProduto);
        } else {
            // ➕ CRIAR
            await addDoc(collection(db, 'produtos'), {
            ...novoProduto,
            createdAt: serverTimestamp(),
            });
        }

        setForm({
            id: '',
            codigo: '',
            ean: '',
            nome: '',
            categoria: '',
            fornecedor: '',
            imagens: [''],
            material: '',
            comprimento: 0,
            largura: 0,
            altura: 0,
            peso: 0,
            litragem: 0,
            tamanho: '',
            ncm: '',
            cores: [],
            decorado: '',
        });

        setEditingIndex(null);
        loadProdutos();
    }

    const handleEdit = (index: number) => {

        const produto = produtos[index];

        setForm({
            id: produto.id,
            codigo: produto.codigo,
            ean: produto.ean,
            nome: produto.nome,
            categoria: produto.categoria,
            fornecedor: produto.fornecedor,
            imagens: produto.imagens?.length ? produto.imagens : [''],
            material: produto.material || '',
            comprimento: produto.comprimento || 0,
            largura: produto.largura || 0,
            altura: produto.altura || 0,
            peso: produto.peso || 0,
            litragem: produto.litragem || 0,
            tamanho: produto.tamanho || '',
            ncm: produto.ncm || '',
            cores: produto.cores,
            decorado: produto.decorado || 'false',
        });

        setEditingIndex(index);
    };


    async function handleDelete(index: number) {
        const produto = produtos[index];

        const confirmacao = confirm(
            `Tem certeza que deseja excluir o produto "${produto.nome}"?`
        );

        if (!confirmacao) return;

        try {
            await deleteDoc(doc(db, 'produtos', produto.id));

            setProdutos((prev) =>
            prev.filter((_, i) => i !== index)
            );
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir o produto');
        }
    }


    const filteredProdutos = produtos.filter(produto => {
        if (selectedFornecedor && produto.fornecedor !== selectedFornecedor) return false;
        if (selectedCategoria && produto.categoria !== selectedCategoria) return false;
        return true;
    });

    function toggleCor(cor: CorProduto, checked: boolean) {
        setForm((prev) => ({
            ...prev,
            cores: checked
            ? [...prev.cores, cor]
            : prev.cores.filter((c) => c !== cor),
        }));
    }

    

    
    return (
        <div className="container text-sm mx-auto p-4 text-gray-800 bg-white w-6xl">
            
            <h1 className="text-3xl font-bold mb-4 text-center">Cadastro de Produtos</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código do Produto</label>
                    <input
                        type="text"
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">EAN</label>
                    <input
                        type="text"
                        name="ean"
                        value={form.ean}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">NCM</label>
                    <input
                        type="text"
                        name="ncm"
                        value={form.ncm}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Selecione uma Categoria</option>
                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                    <select
                        name="fornecedor"
                        value={form.fornecedor}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Selecione um Fornecedor</option>
                        {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
                        
                    </select>

                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                    <select
                        name="tamanho"
                        value={form.tamanho}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Selecione um Tamanho</option>
                        <option value="PQ">PQ</option>
                        <option value="MD">MD</option>
                        <option value="GR">GR</option>
                        <option value="">--</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Decorado</label>
                    <select
                        name="decorado"
                        value={form.decorado}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Selecione um Tipo</option>
                        <option value="Decorado">Decorado</option>
                        <option value="Decorada">Decorada</option>
                        <option value="simples">Simples</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Material</label>
                    <input
                        type="text"
                        name="material"
                        value={form.material}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Cores</div>
                    <div className="grid grid-cols-4 max-h-40 overflow-y-auto border border-gray-300 p-2 rounded gap-2">
                        <div className="flex items-center gap-2 font-black ">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores?.length === CORES_DISPONIVEIS.length}
                                onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    cores: e.target.checked ? CORES_DISPONIVEIS : [],
                                }))
                                }
                            />
                            Selecionar Todos
                        </div>

                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Branco')}
                                onChange={(e) => toggleCor('Branco', e.target.checked)}
                            />
                            <div className="bg-black text-white px-1 rounded-sm">Branco</div>
                        </div>

                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Preto')}
                                onChange={(e) => toggleCor('Preto', e.target.checked)}
                            />
                            <div className=" text-black px-1 rounded-sm">Preto</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Azul')}
                                onChange={(e) => toggleCor('Azul', e.target.checked)}
                            />
                            <div className="bg-blue-500 text-white px-1 rounded-sm">Azul</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Vermelho')}
                                onChange={(e) => toggleCor('Vermelho', e.target.checked)}
                            />
                            <div className="bg-red-500 text-white px-1 rounded-sm">Vermelho</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Amarelo')}
                                onChange={(e) => toggleCor('Amarelo', e.target.checked)}
                            />
                            <div className="bg-yellow-500 text-black px-1 rounded-sm">Amarelo</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Verde')}
                                onChange={(e) => toggleCor('Verde', e.target.checked)}
                            />
                            <div className="bg-green-500 text-white px-1 rounded-sm">Verde</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Cinza')}
                                onChange={(e) => toggleCor('Cinza', e.target.checked)}
                            />
                            <div className="bg-gray-500 text-white px-1 rounded-sm">Cinza</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Roxo')}
                                onChange={(e) => toggleCor('Roxo', e.target.checked)}
                            />
                            <div className="bg-purple-500 text-white px-1 rounded-sm">Roxo</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Laranja')}
                                onChange={(e) => toggleCor('Laranja', e.target.checked)}
                            />
                            <div className="bg-orange-500 text-white px-1 rounded-sm">Laranja</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Rosa')}
                                onChange={(e) => toggleCor('Rosa', e.target.checked)}
                            />
                            <div className="bg-pink-500 text-white px-1 rounded-sm">Rosa</div>
                        </div>
                        <div className="flex gap-2 font-black">
                            <input
                                type="checkbox"
                                className="cursor-pointer w-5"
                                checked={form.cores.includes('Prata')}
                                onChange={(e) => toggleCor('Prata', e.target.checked)}
                            />
                            <div className="bg-gray-300 text-gray-700 px-1 rounded-sm">Prata</div>
                        </div>

                    </div>
                </div>
                

                <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagens do Produto
                    </label>

                    {form.imagens.map((img, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="url"
                            value={img}
                            onChange={(e) => handleImagemChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder={`URL da imagem ${index + 1}`}
                        />

                        {form.imagens.length > 1 && (
                            <button
                            type="button"
                            onClick={() => removeImagem(index)}
                            className="bg-red-500 text-white px-2 rounded"
                            >
                            <X size={16} />
                            </button>
                        )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addImagem}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        + Adicionar outra imagem
                    </button>
                </div>
                <div className='flex flex-1 justify-between col-span-3'>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Peso</label>
                        <input
                            type="number"
                            name="peso"
                            value={form.peso}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Comprimento</label>
                        <input
                            type="number"
                            name="comprimento"
                            value={form.comprimento}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Largura</label>
                        <input
                            type="number"
                            name="largura"
                            value={form.largura}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Altura</label>
                        <input
                            type="number"
                            name="altura"
                            value={form.altura}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center outline-none"
                            required
                        />
                    </div>
                   
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Litragem (ml)</label>
                        <input
                            type="number"
                            value={form.litragem}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center bg-gray-100 cursor-not-allowed outline-none"
                            />

                    </div>
                    <div className="rounded-md flex justify-center ">
                        <button
                            type="submit"
                            className="flex gap-2 justify-center items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
                        >
                            {editingIndex !== null ? <X /> : <PlusIcon />}
                            {editingIndex !== null ? `Atualizar` : ` Cadastrar`}
                            {editingIndex !== null ? <X /> : <PlusIcon />}
                        </button>
                    </div>
                </div>

                
            </form >
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Filtros</h2>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filtrar por Fornecedor</label>
                        <select
                            value={selectedFornecedor || ''}
                            onChange={(e) => setSelectedFornecedor(e.target.value || null)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Todos os Fornecedores</option>
                            {fornecedores.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Filtrar por Categoria</label>
                        <select
                            value={selectedCategoria || ''}
                            onChange={(e) => setSelectedCategoria(e.target.value || null)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Todas as Categorias</option>
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {filteredProdutos.map((produto, filteredIndex) => {
                    const originalIndex = produtos.findIndex(p => p === produto);
                    return (
                        <div key={originalIndex} className="border border-gray-300 rounded-md">
                            <div className='border-b border-gray-300'>
                                {produto.imagens?.[0] && (
                                    <img src={produto.imagens[0]} alt={produto.nome} className="w-full h-60 object-contain rounded p-4" />
                                )}

                            </div>
                            <h3 className="text-lg font-semibold mt-4 text-center">{produto.nome} {produto.tamanho} {produto.decorado}</h3>
                            <div className="text-sm text-gray-600 flex flex-col justify-between w-full gap-1 p-4">
                                <p className="text-sm text-gray-600 flex justify-between w-full gap-1 border-b"><span><strong>Código:</strong></span> <span>{produto.codigo}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between w-full gap-1 border-b"><span><strong>EAN:</strong></span> <span>{produto.ean}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between w-full gap-1 border-b"><span><strong>NCM:</strong></span> <span>{produto.ncm}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between w-full gap-1 border-b"><span><strong>Categoria:</strong> </span> <span>{produto.categoria}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between w-full gap-1 border-b"><span><strong>Fornecedor:</strong></span> <span>{produto.fornecedor}</span></p>
                                <div className="flex flex-col text-sm text-gray-600 w-full gap-1">
                                    <strong>Cores Disponíveis</strong>
                                    <div className='grid grid-cols-4 text-center gap-3'>
                                        {produto.cores?.map((cor, index) => (
                                            <div key={index} className='bg-green-500 py-1 px-2 text-white rounded-md'>
                                                {cor}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                            
                            <div className='mb-4 border-b border-gray-300'></div>
                            
                            <div className="flex gap-2 justify-between font-bold px-4 mb-4">
                                <button
                                    onClick={() => handleEdit(originalIndex)}
                                    className="flex gap-2 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                                >
                                    <Edit size={18} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(originalIndex)}
                                    className="flex gap-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                                >
                                    <Trash2 size={18} /> Excluir
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
        </div>
    );
}