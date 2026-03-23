//o layout vai ser o o ninho para todas as outras paginas presentes na pasta.
import SideNav from '@/app/ui/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children} </div>
      {/* o children é a página que foi selecionada no sidebar */}
    </div>
  );
}