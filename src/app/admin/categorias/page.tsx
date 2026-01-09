
'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from "firebase/auth";
import { ArrowBigDown, ArrowBigUp, CheckCircle, CircleX, Disc, Edit, Plus, Save, Trash2 } from 'lucide-react';



interface Categoria {
  id?: string; // ID do Firestore
  nome: string;
  managierId?: string; // ID do usuário que criou a categoria
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cepValido, setCepValido] = useState({ endereco: false, enderecoEntrega: false });
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [clienteAberto, setClienteAberto] = useState<string | null>(null);
  const [form, setForm] = useState<Categoria>({
    nome: '',
  });
  
    const loadCategorias = async () => {
        try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;


        // Para admins, filtra apenas clientes que ele gerencia
        const snap = await getDocs(collection(db, 'categorias'));

        const data = snap.docs.map(doc => {
            const d = doc.data();
            return {
            id: doc.id,
            nome: d.nome || '',
            };
        });

        setCategorias(data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

  // 🔹 Load categorias do Firestore
    useEffect(() => {
        loadCategorias();
    }, []);
  

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            console.error("Usuário não autenticado!");
            return;
        }

        // Adiciona managerId antes de salvar
        const categoriaToSave = {
            ...form,
            managerId: currentUser.uid, // 🔹 ESSENCIAL PARA AS REGRAS
        };

        try {
            if (editingIndex !== null) {
            // Atualiza
            const categoria = categorias[editingIndex];
            if (!categoria.id) throw new Error("Categoria sem ID!");
            await setDoc(doc(db, 'categorias', categoria.id), categoriaToSave);
            const updatedCategorias = [...categorias];
            updatedCategorias[editingIndex] = { ...categoriaToSave, id: categoria.id };
            setCategorias(updatedCategorias);
            setEditingIndex(null);
            } else {
            // Cria nova categoria
            const newDocRef = doc(collection(db, 'categorias'));
            await setDoc(newDocRef, categoriaToSave);
            setCategorias([...categorias, { ...categoriaToSave, id: newDocRef.id }]);
            }
            resetForm();
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
        }
    };


  const handleEdit = (index: number) => {
    const categoria = categorias[index];
    setForm(categoria);
    setEditingIndex(index);
    setShowForm(true);
    loadCategorias();
  };

  const handleDelete = async (index: number) => {
    const categoria = categorias[index];
    if (!categoria.id) return;
    await deleteDoc(doc(db, 'categorias', categoria.id));
    setCategorias(categorias.filter((_, i) => i !== index));
    loadCategorias();
  };

  const resetForm = () => {
    setForm({
      nome: '',
    });
        setShowForm(false);
        setEditingIndex(null);
    };

  // Formata CEP: 12345678 → 12345-678
    const formatarCep = (value: string) => {
    const cep = value.replace(/\D/g, '');
    if (cep.length <= 5) return cep;
        return cep.slice(0, 5) + '-' + cep.slice(5, 8);
    };

    // Formata telefone fixo/celular
    const formatarTelefone = (value: string) => {
    const telefone = value.replace(/\D/g, '');
        if (telefone.length <= 10) {
            // fixo (XX) XXXX-XXXX
            if (telefone.length <= 2) return telefone;
            if (telefone.length <= 6) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
            return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
        } else {
            // celular (XX) XXXXX-XXXX
            if (telefone.length <= 2) return telefone;
            if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
            return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
        }
    };

 return (
        <div className="container mx-auto p-4 text-gray-800 bg-white w-6xl">
            <h1 className="text-3xl font-bold mb-4 text-center">Cadastro de Categoria</h1>

            <button
                onClick={() => setShowForm(true)}
                className="flex gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 cursor-pointer"
            >
                Adicionar Categoria <Plus/> 
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-300 rounded">
                    <h2 className="text-2xl font-bold mb-4">{editingIndex !== null ? 'Editar Categoria' : 'Nova Categoria'}</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input
                                type="text"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                    </div>
                    <div className="flex gap-2 mt-4 justify-between">
                        <button
                            type="submit"
                            className="flex gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                        >
                            {
                                editingIndex !== null ?(
                                    <>
                                        <p>Atualizar</p>
                                        <p><CheckCircle /></p>
                                    </>
                                ):(
                                    <div className='flex gap-2'>
                                        <span>Salvar</span>
                                        <span><Save /></span>
                                    </div>
                                
                                )
                            }

                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                        >
                            <p>Cancelar</p>
                            <p><CircleX /></p>
                        </button>
                    </div>
                </form>
            )}

            <div className="flex gap-4 border-t-2">
                {categorias.map((categoria, index) => {                                

                return(

                    <div key={index} className="mt-2 ">
                                    
                        <div className='flex justify-between items-center  border text-center border-gray-300 p-2 rounded-md'>
                            <p>{categoria.nome}</p>
                            <div className="p-2 flex gap-2 justify-between">
                                <button
                                    onClick={() => handleEdit(index)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                                >
                                <Edit/>
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                                >
                                <Trash2 />
                                </button>
                            </div>
                        </div>                                            
                                   
                          
                    </div>
                )})}
            </div>
        </div>
    );
}
