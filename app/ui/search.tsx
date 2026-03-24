'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
//hooks do Next para fazer a navegação pela aplicação
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
//lib de debounce para otimizar as querys visto que sem a lib o search seria atualizado a cada letra digitada
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    // esse seach params é uma API web que provem métodos úteis para manipular o query params da URL, através dela fica mais fácil criar os parametros para a string que vai nela
    //dito isso, vai verificar se tem algo no input. Se tiver, busca, senão deleta pra trazer vazio.
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        //passando o valor default para garantir que o campo esteja sincronizado com a URL e seja populado qnd compartilhado.
        //No React puro, usando estados, o correto seria o value para ter um componente controlado, deixando o React manipular o estado do input. Mas, como não tem estado sendo manipulado, é de boa usar o defaultValue (o input nativo vai controlar o proprio estado)
        //Isto é viável visto que estamos salvando a query na URL ao invés do estado.
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
