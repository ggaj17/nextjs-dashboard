import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { RevenueChartSkeleton,
         LatestInvoicesSkeleton,
         CardsSkeleton
 } from '@/app/ui/skeletons';
 
export default async function Page() {


  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
         <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* como essa stream foi feita separadamente para não bloquear os outros itens, foi necessário retirar o fetch dela do arquivo data e inserir diretamente no RevenueChart. É uma boa pratica fazer dessa forma, levar o fetch separadamente para daca componente e envolver os mesmos em um Suspense com seu respectivo Skeleton, porém não é errado querer fazer o stream da pagina toda através da pasta de wrap igual o (overview) */}
        <Suspense fallback={<RevenueChartSkeleton />}>
         <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}