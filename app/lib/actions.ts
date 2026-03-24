//utilizando 'use server', marcamos todas as funcoes exportadas aqui como Server Actions. Dessa forma, as funcoes poderão ser importadas e usadas em componentes de servidores e clientes. Qualquer funcao nao usada aqui será excluida do bundle final da aplicacao.
//Mesmo assim, ainda é possível escrever Server Actions dentro de Server components normalmente
//React Server Actions permite rodar codigo asincrono direto no servidor, eliminando a necessidade de criar endpoints para mutar os dados. Ao invés disso, basta criar funcoes asincronas que executam no servidor e possam ser invocadas nos componentes de Servidor e Cliente. 
// Ele está completamente ligado com o sistema de cache do Next, possibilitando a reavaliação do cache. Isso garante que o formulario seja submetido mesmo sem o JS carregar completamente ou der falha na pagina.
'use server';

//lib de validacao
import { z } from 'zod';
import { revalidatePath } from 'next/cache'; //vai reavaliar o cache para otimizar as rotas e melhorar a performance entre paginas.
import { redirect } from 'next/navigation'; // redireciona a pagina para o usuario.
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

//No React normal, o action do formulário acaba virando uma props especial, permitindo que acoes possam ser invocadas a partir disso. O next, por trás dos panos, utiliza o Server Actions para criar um endpoint POST, evitando a necessidade de criar o endpoint manualmente.
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // try {
	await sql`
		INSERT INTO invoices (customer_id, amount, status, date)
		VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
	`;
  // } catch (error) {
	// //deixar o console apenas para aprendizado 
  //   console.error(error);
  //   return {
  //     message: 'Database Error: Failed to Create Invoice.',
  //   };
  // }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
//dica do next => se for trabalhar com um form com muitos campos, é necessário considerar usar o entries() method do JS.

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  // try {
	await sql`
		UPDATE invoices
		SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
		WHERE id = ${id}
	`;
	// } catch (error) {
	// 	//deixar o console apenas para aprendizado 
	// 	console.error(error);
	// 	return {
	// 		message: 'Database Error: Failed to Create Invoice.',
	// 	};
	// }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

//   throw new Error('Falha ao Deletar o Invoice');
	
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
  //visto que a action é chamada no caminho /dashboard/invoices, não é necessário definir o redirect, o revalidate já gatilha um server request, renderizando a pg.
}