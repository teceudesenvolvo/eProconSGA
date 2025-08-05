import '../src/App.css'; // Caminho corrigido para App.css
import { Routes, Route } from 'react-router-dom';

// Navigate Components
import TopBar from '../src/componets/topBarSearch'; // Caminho e nome da pasta corrigidos
import Menu from '../src/componets/menu'; // Caminho e nome da pasta corrigidos
import MenuDesktop from '../src/componets/menuDesktop'; // Caminho e nome da pasta corrigidos
import Footer from '../src/componets/footer'; // Caminho e nome da pasta corrigidos

// Páginas Principais
import HomeDashboard from './screens/homePage'; // Caminho corrigido
import Cdc from './screens/CodigoDefesaConsumidor'; // Caminho corrigido

// Controle de Acesso
import Register from '../src/screens/register'; // Caminho corrigido
import Login from '../src/screens/login'; // Caminho corrigido

// Controle Admin
import Atendimentos from '../src/screens/admin/atendimentosTodos'; // Caminho corrigido
import Atendimento from '../src/screens/admin/atendimento'; // Caminho corrigido
import CriarChamado from '../src/screens/admin/createChamadoAdmin'; // Caminho corrigido
import Painel from '../src/screens/admin/dashboard'; // Caminho corrigido

// Usuário Logado
import MeusAgendamentos from '../src/screens/client/meusAtendimentos'; // Caminho corrigido
import ReclamacaoDetalhes from '../src/screens/client/reclamacaoDetalhes'; // Caminho corrigido
import Perfil from '../src/screens/client/Perfil'; // Caminho corrigido
import RealizarReclamacao from '../src/screens/client/realizarReclamacao'; // Caminho corrigido


function App() {

  // Array de rotas onde o rodapé não deve ser exibido (exemplo, ajuste conforme necessário)
  // const noFooterPaths = ['/login', '/register', '/testePage'];
  // const shouldShowFooter = !noFooterPaths.includes(location.pathname);

  return (
    <div className="App flex flex-col min-h-screen"> {/* Adiciona flexbox para layout */}
      <TopBar />
     
      <main className="flex-grow"> {/* Permite que o conteúdo principal ocupe o espaço restante */}
        <Routes>
          {/* Página Principal */}
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/codigo-de-defesa-do-consumidor" element={<Cdc />} />

          {/* Controle de Acesso */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Controle Admin */}
          <Route path="/atendimentos-sga-hyo6d27" element={<Atendimentos />} />
          <Route path="/atendimento-sga-ppi6g59" element={<Atendimento />} />
          <Route path="/criar-chamado" element={<CriarChamado />} />
          <Route path="/painel" element={<Painel />} />

          {/* Páginas Usuário Logado */}
          <Route path="/meus-atendimentos" element={<MeusAgendamentos />} />
          <Route path="/registrar-reclamacao" element={<RealizarReclamacao />} />
          <Route path="/reclamacao-detalhes" element={<ReclamacaoDetalhes />} />
          <Route path="/perfil" element={<Perfil />} />

          
        </Routes>
      </main> {/* Fim do conteúdo principal */}
     
      <Menu />
      <MenuDesktop />
      <Footer />
    </div>
  );
}

export default App;
