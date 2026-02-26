import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      {/* Aqui nós inserimos a barra de navegação pronta */}
      <Navbar />

      {/* Aqui é onde as páginas (Home, Saldo, Entrada...) vão aparecer */}
      <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto animate-fadeIn pb-12">
        {children}
      </main>
    </div>
  );
}