//Nome padrão para arquivos de loading estáticos que vão carregar os skelettons, dentro de uma pasta com parenteses, encapsula a rota para evitar que o skelleton rode nos filhos (customers e invoice). Boa forma de separar sua aplicação em modulos diferentes.
import DashboardSkeleton from '@/app/ui/skeletons';
 
export default function Loading() {
  return <DashboardSkeleton />;
}