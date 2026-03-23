//sempre que um componente for usar algo do React, é necessário declarar o use client, indicando que este componente não é Server side e sim Client Side.
'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; //biblioteca de condicionais para estilos css => usadas para cores de status, por exemplo

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        const pathname = usePathname();
        const LinkIcon = link.icon;
        return (
          //O NextJS faz um prefetch dos componentes Link, de forma que eles já ficam pré carregados para quando o cliente clicar nos mesmos. Isso acelera o carregamento da pagina. Dividir o codigo em Links significa que, se um erro proca em um Componente X, não vai interromper o Y devido a separação da aplicação por rotas
          <Link
            key={link.name}
            href={link.href}
             className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
