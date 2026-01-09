
'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from "firebase/auth";
import { ArrowBigDown, ArrowBigUp, CheckCircle, CircleX, Disc, Edit, Plus, Save, Trash2 } from 'lucide-react';

interface Endereco {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento: string;
}

interface Cliente {
  id?: string; // ID do Firestore
  nome: string;
  endereco: Endereco;
  telefoneFixo: string;
  telefoneCelular: string;
  cnpj: string;
  inscricaoEstadual: string;
  nomeContato: string;
  nomeContatoVenda: string;
}

export default function Fornecedores() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cepValido, setCepValido] = useState({ endereco: false, enderecoEntrega: false });
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [clienteAberto, setClienteAberto] = useState<string | null>(null);
  const [form, setForm] = useState<Cliente>({
    nome: '',
    endereco: { cep:'', rua:'', bairro:'', cidade:'', estado:'', numero:'', complemento:'' },
    telefoneFixo: '',
    telefoneCelular: '',
    cnpj: '',
    inscricaoEstadual: '',
    nomeContato: '',
    nomeContatoVenda: '',
  });
  
    const loadFornecedores = async () => {
        try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;


        // Para admins, filtra apenas clientes que ele gerencia
        const snap = await getDocs(collection(db, 'fornecedores'));

        const data = snap.docs.map(doc => {
            const d = doc.data();
            return {
            id: doc.id,
            nome: d.nome || '',
            endereco: d.endereco || { cep:'', rua:'', bairro:'', cidade:'', estado:'', numero:'', complemento:'' },
            telefoneFixo: d.telefoneFixo || '',
            telefoneCelular: d.telefoneCelular || '',
            cnpj: d.cnpj || '',
            inscricaoEstadual: d.inscricaoEstadual || '',
            nomeContato: d.nomeContato || '',
            nomeContatoVenda: d.nomeContatoVenda || '',
            };
        });

        setClientes(data);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
        }
    };

  // 🔹 Load fornecedores do Firestore
    useEffect(() => {
        loadFornecedores();
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
        const fornecedorToSave = {
            ...form,
            managerId: currentUser.uid, // 🔹 ESSENCIAL PARA AS REGRAS
        };

        try {
            if (editingIndex !== null) {
            // Atualiza
            const fornecedor = clientes[editingIndex];
            if (!fornecedor.id) throw new Error("Fornecedor sem ID!");
            await setDoc(doc(db, 'fornecedores', fornecedor.id), fornecedorToSave);
            const updatedFornecedores = [...clientes];
            updatedFornecedores[editingIndex] = { ...fornecedorToSave, id: fornecedor.id };
            setClientes(updatedFornecedores);
            setEditingIndex(null);
            } else {
            // Cria novo fornecedor
            const newDocRef = doc(collection(db, 'fornecedores'));
            await setDoc(newDocRef, fornecedorToSave);
            setClientes([...clientes, { ...fornecedorToSave, id: newDocRef.id }]);
            }
            resetForm();
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
        }
    };


  const handleEdit = (index: number) => {
    const cliente = clientes[index];
    setForm(cliente);
    setEditingIndex(index);
    setShowForm(true);
    loadFornecedores();
  };

  const handleDelete = async (index: number) => {
    const cliente = clientes[index];
    if (!cliente.id) return;
    await deleteDoc(doc(db, 'fornecedores', cliente.id));
    setClientes(clientes.filter((_, i) => i !== index));
    loadFornecedores();
  };

  const resetForm = () => {
    setForm({
      nome: '',
      endereco: { cep:'', rua:'', bairro:'', cidade:'', estado:'', numero:'', complemento:'' },
      telefoneFixo: '',
      telefoneCelular: '',
      cnpj: '',
      inscricaoEstadual: '',
      nomeContato: '',
      nomeContatoVenda: '',
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

    // Buscar CEP usando ViaCEP API
    const buscarCep = async (cep: string, isEntrega: boolean, setForm: Function) => {
    const numeros = cep.replace(/\D/g, "");
        if (numeros.length === 8) {
            try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                const enderecoKey = "endereco";

                // Atualiza campos do endereço
                setForm((prev: any) => ({
                ...prev,
                [enderecoKey]: {
                    ...prev[enderecoKey],
                    rua: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    estado: data.uf
                }
                }));

                // Seta flag de CEP válido → bloqueia campos
                setCepValido(prev => ({
                ...prev,
                [enderecoKey]: true
                }));
            } else {
                // CEP inválido → libera campos
                setCepValido(prev => ({
                ...prev,
                [isEntrega ? "enderecoEntrega" : "endereco"]: false
                }));
            }
            } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            }
        } else {
            // CEP incompleto → libera campos
            setCepValido(prev => ({
            ...prev,
            [isEntrega ? "enderecoEntrega" : "endereco"]: false
            }));
        }
    };


    function formatarCpfCnpj(value: string) {
        const numeros = value.replace(/\D/g, ""); // remove tudo que não for número

        if (numeros.length <= 11) {
            // CPF
            let cpf = numeros;
            if (cpf.length > 3) cpf = cpf.slice(0,3) + '.' + cpf.slice(3);
            if (cpf.length > 7) cpf = cpf.slice(0,7) + '.' + cpf.slice(7);
            if (cpf.length > 11) cpf = cpf.slice(0,11) + '-' + cpf.slice(11);
            if (cpf.length > 14) cpf = cpf.slice(0,14);
            return cpf;
        } else {
            // CNPJ
            let cnpj = numeros;
            if (cnpj.length > 2) cnpj = cnpj.slice(0,2) + '.' + cnpj.slice(2);
            if (cnpj.length > 5) cnpj = cnpj.slice(0,6) + '.' + cnpj.slice(6);
            if (cnpj.length > 8) cnpj = cnpj.slice(0,10) + '/' + cnpj.slice(10);
            if (cnpj.length > 12) cnpj = cnpj.slice(0,15) + '-' + cnpj.slice(15,17);
            if (cnpj.length > 18) cnpj = cnpj.slice(0,18);
            return cnpj;
        }
    }



 return (
        <div className="container mx-auto p-4 text-gray-800 bg-white w-6xl">
            <h1 className="text-3xl font-bold mb-4 text-center">Cadastro de Fornecedor</h1>

            <button
                onClick={() => setShowForm(true)}
                className="flex gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 cursor-pointer"
            >
                Adicionar Fornecedor <Plus/> 
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-300 rounded">
                    <h2 className="text-2xl font-bold mb-4">{editingIndex !== null ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CNPJ - CPF</label>
                            <input
                                type="text"
                                value={form.cnpj}
                                onChange={(e) => setForm({ ...form, cnpj: formatarCpfCnpj(e.target.value) })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                
                            />

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                            <input
                                type="text"
                                value={form.inscricaoEstadual}
                                onChange={(e) => setForm({ ...form, inscricaoEstadual: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className='flex gap-4 justify-between'>
                            <div className='flex-1'>
                                <label className="block text-sm font-medium text-gray-700">Telefone Fixo</label>
                                <input
                                    type="text"
                                    value={form.telefoneFixo}
                                    onChange={(e) => setForm({ ...form, telefoneFixo: formatarTelefone(e.target.value) })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="(XX) XXXX-XXXX"
                                />
                            </div>
                            <div className='flex-1'>
                                <label className="block text-sm font-medium text-gray-700">Telefone Celular</label>
                                <input
                                    type="text"
                                    value={form.telefoneCelular}
                                    onChange={(e) => setForm({ ...form, telefoneCelular: formatarTelefone(e.target.value) })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="(XX) XXXXX-XXXX"
                                />
                            </div>

                        </div>
                        <div className="md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                                    <input
                                        type="text"
                                        value={form.endereco.cep}
                                        onChange={(e) => {
                                            const formattedCep = formatarCep(e.target.value);
                                            setForm({ ...form, endereco: { ...form.endereco, cep: formattedCep } });
                                            buscarCep(e.target.value.replace(/\D/g, ''), false, setForm); // ⚠️ aqui passa setForm
                                        }}

                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="XXXXX-XXX"
                                        maxLength={9}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Rua</label>
                                    <input
                                        type="text"
                                        value={form.endereco.rua}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, rua: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        disabled={cepValido.endereco}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Número</label>
                                    <input
                                        type="text"
                                        value={form.endereco.numero}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, numero: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                                    <input
                                        type="text"
                                        value={form.endereco.complemento}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, complemento: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                                    <input
                                        type="text"
                                        value={form.endereco.bairro}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, bairro: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        disabled={cepValido.endereco}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                                    <input
                                        type="text"
                                        value={form.endereco.cidade}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, cidade: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        disabled={cepValido.endereco}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                                    <input
                                        type="text"
                                        value={form.endereco.estado}
                                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, estado: e.target.value } })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        maxLength={2}
                                        disabled={cepValido.endereco}
                                    />
                                </div>
                            </div>
                        </div>
                        
                       

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome de Contato de Vendas</label>
                            <input
                                type="text"
                                value={form.nomeContato}
                                onChange={(e) => setForm({ ...form, nomeContato: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telefone Contato de Vendas</label>
                            <input
                                type="text"
                                value={form.nomeContatoVenda}
                                onChange={(e) => setForm({ ...form, nomeContatoVenda: formatarTelefone(e.target.value) })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="(XX) XXXXX-XXXX"
                            />
                        </div>
                       
                    </div>
                    <div className="flex gap-2 mt-4 justify-between">
                        <button
                            type="submit"
                            className="flex gap-2  bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
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

            <div className="grid grid-cols-1  gap-4">
                {clientes.map((cliente, index) => {
                    const aberto = clienteAberto === cliente.id;               
                
                return(

                    <div key={index} className="border border-gray-300 rounded-md">                 
                        <div className='flex border-b border-gray-300'>
                            <h3 className="flex-1 text-2xl font-semibold  items-center p-4">
                                {cliente.nome}
                            </h3>
                            <div className='flex  p-4 justify-center items-center '>
                                <button onClick={() => setClienteAberto(aberto ? null : cliente.id? cliente.id : null)} className="cursor-pointer p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                                   {aberto ? <ArrowBigUp /> : <ArrowBigDown />} Mais Informações
                                </button>

                            </div>
                        </div>
                        {aberto && (
                            <>
                                <div className='border-b border-gray-300 p-4'>                            
                                    <div className='grid grid-cols-4 gap-4 mb-2 '>
                                        <div className='flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>CNPJ</strong> </p>
                                            <p>{cliente.cnpj}</p>

                                        </div>
                                        <div className='flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>Inscrição Estadual</strong> </p>
                                            <p>{cliente.inscricaoEstadual}</p>
                                        </div>
                                        <div className='flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>Telefone Fixo</strong> </p>
                                            <p>{cliente.telefoneFixo}</p>
                                        </div>
                                        <div className='flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>Telefone Celular</strong> </p>
                                            <p>{cliente.telefoneCelular}</p>
                                        </div>                        
                                    </div>

                                    

                                    <div className='flex gap-2'>
                                        <div className='flex flex-1 flex-col border border-gray-300 p-2 rounded-md '>
                                            <p className='text-sm text-left'><strong>Endereço</strong> </p>
                                            <p>{cliente.endereco.rua}, {cliente.endereco.numero} - {cliente.endereco.bairro}, {cliente.endereco.cidade} - {cliente.endereco.estado}, CEP: {cliente.endereco.cep}</p>
                                        </div>
                                        <div className='w-40 flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>Contato</strong> </p>
                                            <p>{cliente.nomeContato}</p>
                                        </div>    

                                        <div className='w-40 flex flex-col border text-center border-gray-300 p-2 rounded-md'>
                                            <p className='text-sm text-left'><strong>Telefone</strong> </p>
                                            <p>{cliente.nomeContatoVenda}</p>
                                        </div>                                         

                                    </div> 



                                </div>

                                <div className="p-4 flex gap-2 justify-between">
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
                            </>
                        )}
                    </div>
                )})}
            </div>
        </div>
    );
}
