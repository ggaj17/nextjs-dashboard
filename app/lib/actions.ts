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
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({invalid_type_error: 'Escolha um cliente.'}),
  amount: z.coerce.number()
  .gt(0, { message: 'Escolha um valor maior que $0.' }),
  status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status.'}),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

//No React normal, o action do formulário acaba virando uma props especial, permitindo que acoes possam ser invocadas a partir disso. O next, por trás dos panos, utiliza o Server Actions para criar um endpoint POST, evitando a necessidade de criar o endpoint manualmente.
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
//dica do next => se for trabalhar com um form com muitos campos, é necessário considerar usar o entries() method do JS.

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

//   throw new Error('Falha ao Deletar o Invoice');
	
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
  //visto que a action é chamada no caminho /dashboard/invoices, não é necessário definir o redirect, o revalidate já gatilha um server request, renderizando a pg.
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}