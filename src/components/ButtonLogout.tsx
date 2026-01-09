'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  icon?: React.ReactNode;
  texto?: string;
}

export function LogoutButton({ icon, texto }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <>
    {icon ? ( 
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded "
        >
          <div className='flex p-1 rounded-full text-red-600 hover:bg-red-600 hover:text-white cursor-pointer'>
            {icon}{texto}
          </div>
        </button> 
      ) : (
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
        >
          Sair
        </button> 
      )  }
    </>
)}
