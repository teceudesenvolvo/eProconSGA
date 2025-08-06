import React, { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // Importar onAuthStateChanged
import { auth } from './firebase'; // Certifique-se de que o seu firebase.js exporta 'auth'

// Componentes de Navegação
import TopBar from './componets/topBarSearch';
import Menu from './componets/menu';
import MenuDesktop from './componets/menuDesktop';
import Footer from './componets/footer';

// Páginas Principais
import HomeDashboard from './screens/homePage';
import Cdc from './screens/CodigoDefesaConsumidor';

// Controle de Acesso
import Register from './screens/register';
import Login from './screens/login';

// Controle Admin
import Atendimentos from './screens/admin/atendimentosTodos';
import Atendimento from './screens/admin/atendimento';
import CriarChamado from './screens/admin/createChamadoAdmin';
import Painel from './screens/admin/dashboard';

// Usuário Logado
import MeusAgendamentos from './screens/client/meusAtendimentos';
import ReclamacaoDetalhes from './screens/client/reclamacaoDetalhes';
import Perfil from './screens/client/Perfil';
import RealizarReclamacao from './screens/client/realizarReclamacao';

// Componente PrivateRoute para proteger rotas que exigem autenticação
const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Usamos um estado de carregamento LOCAL para a verificação de autenticação
    // Isso evita que o preloader GLOBAL fique preso durante a inicialização do Firebase.
    const [loadingAuthCheck, setLoadingAuthCheck] = useState(true);

    useEffect(() => {
        // Ouve as mudanças no estado de autenticação do Firebase
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // Define se o usuário está autenticado
            setLoadingAuthCheck(false); // A verificação de autenticação terminou
        });
        return () => unsubscribe(); // Limpa o listener quando o componente é desmontado
    }, []);

    if (loadingAuthCheck) {
        // Mostra um carregador simples e rápido ENQUANTO a autenticação está a ser verificada.
        // Este é um carregador local, não o preloader global.
        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                <div className="text-white text-xl p-4 bg-blue-600 rounded-lg shadow-lg">A verificar autenticação...</div>
            </div>
        );
    }

    // Se a verificação terminou e o usuário não está autenticado, redireciona para a página de login
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <div className="App flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-grow">
          <Routes>
            {/* Página Principal (geralmente pública) */}
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/codigo-de-defesa-do-consumidor" element={<Cdc />} />

            {/* Controle de Acesso (Login e Registro são sempre públicos) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas Protegidas: Envolva os componentes com PrivateRoute */}
            <Route path="/atendimentos-sga-hyo6d27" element={<PrivateRoute><Atendimentos /></PrivateRoute>} />
            <Route path="/atendimento-sga-ppi6g59" element={<PrivateRoute><Atendimento /></PrivateRoute>} />
            <Route path="/criar-chamado" element={<PrivateRoute><CriarChamado /></PrivateRoute>} />
            <Route path="/painel" element={<PrivateRoute><Painel /></PrivateRoute>} />
            <Route path="/meus-atendimentos" element={<PrivateRoute><MeusAgendamentos /></PrivateRoute>} />
            <Route path="/registrar-reclamacao" element={<PrivateRoute><RealizarReclamacao /></PrivateRoute>} />
            <Route path="/reclamacao-detalhes" element={<PrivateRoute><ReclamacaoDetalhes /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

            {/* Você pode adicionar um redirecionamento padrão para rotas não encontradas ou a raiz */}
            {/* Exemplo: <Route path="*" element={<Navigate to="/" />} /> */}
          </Routes>
        </main>
        <Menu />
        <MenuDesktop />
        <Footer />
      </div>
  );
}

export default App;
