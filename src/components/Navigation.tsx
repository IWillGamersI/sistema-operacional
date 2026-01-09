'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { href: '/produtos', label: 'Produtos' },
        { href: '/precos', label: 'Preços' },
        { href: '/clientes', label: 'Clientes' },
        { href: '/fornecedores', label: 'Fornecedores' },
        
    ];

    return (
        <nav className="bg-gray-800 text-white p-4 mb-4 rounded-md">
            <div className="container mx-auto flex justify-between items-center ">
                <Link href="/" className="text-xl font-bold">
                    Painel de Cadastro
                </Link>
                <div className="flex space-x-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}