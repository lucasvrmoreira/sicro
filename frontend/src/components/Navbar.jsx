import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// O seu componente de Link Colorido (fica aqui dentro mesmo, pois só a Navbar usa ele)
function NavLink({ to, children, colorClass, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const baseStyle = `font-medium rounded-lg text-sm px-4 py-2 border transition-all duration-200 focus:outline-none flex items-center justify-center`;
  
  const colors = {
    gray:   isActive ? 'bg-gray-700 border-gray-700 text-white' : 'border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-gray-200',
    blue:   isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/50' : 'border-blue-900/30 text-blue-500 hover:bg-blue-900/20',
    green:  isActive ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-900/50' : 'border-green-900/30 text-green-500 hover:bg-green-900/20',
    red:    isActive ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/50' : 'border-red-900/30 text-red-500 hover:bg-red-900/20',
    purple: isActive ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/50' : 'border-purple-900/30 text-purple-500 hover:bg-purple-900/20',
    teal:   isActive ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-900/50' : 'border-teal-900/30 text-teal-500 hover:bg-teal-900/20',
  };

  const activeClass = colors[colorClass] || colors.gray;

  return (
    <Link to={to} onClick={onClick} className={`${baseStyle} ${activeClass}`}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/home')}>
          <span className="text-blue-500">Sicro</span>
          <span className="text-gray-500 text-sm font-normal hidden sm:block">| Bem vindo </span>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <button 
          className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>

        {/* Menu Desktop */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-2 m-0 p-0 list-none">
            <li><NavLink to="/home" colorClass="gray">Home</NavLink></li>
            <li><NavLink to="/saldo" colorClass="blue">Saldo</NavLink></li>
            <li><NavLink to="/entrada" colorClass="green">Entrada</NavLink></li>
            <li><NavLink to="/saida" colorClass="red">Saída</NavLink></li>
            <li><NavLink to="/historico" colorClass="purple">Histórico</NavLink></li>
            <li><NavLink to="/planejamento" colorClass="teal">Planejamento</NavLink></li>
          </ul>
        </nav>

        {/* Botão Sair Desktop */}
        <div className="hidden md:block">
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm font-medium transition flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-800">
            Sair
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full bg-gray-900 border-b border-gray-800 shadow-2xl animate-slideDown z-50">
          <ul className="flex flex-col p-4 space-y-3 list-none m-0">
            <li><NavLink to="/home" colorClass="gray" onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/saldo" colorClass="blue" onClick={() => setIsMenuOpen(false)}>Saldo</NavLink></li>
            <li><NavLink to="/entrada" colorClass="green" onClick={() => setIsMenuOpen(false)}>Entrada</NavLink></li>
            <li><NavLink to="/saida" colorClass="red" onClick={() => setIsMenuOpen(false)}>Saída</NavLink></li>
            <li><NavLink to="/historico" colorClass="purple" onClick={() => setIsMenuOpen(false)}>Histórico</NavLink></li>
            <li><NavLink to="/planejamento" colorClass="teal" onClick={() => setIsMenuOpen(false)}>Planejamento</NavLink></li>
            <li className="border-t border-gray-800 pt-3 mt-2">
              <button onClick={handleLogout} className="w-full text-center text-red-400 hover:bg-red-900/20 py-3 rounded-lg font-medium transition flex justify-center items-center gap-2">
                Sair do Sistema
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}