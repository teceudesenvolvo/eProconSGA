import './App.css';
import { Routes, Route } from 'react-router-dom';

// Navigate Components
import TopBar from '../src/componets/topBarSearch';
import Menu from './componets/menu';
import MenuDesktop from './componets/menuDesktop';

// Páginas Principais
import HomeDashboard from '../src/screens/homeDashboard';

// Controle de Acesso
import Register from './screens/client/register';
import Login from './screens/client/login';

// Controle Interno
import Agendamentos from './screens/client/agendamentos';
import Relatorios from './screens/client/Relatorios';

// Usuário Logado
import MeusAgendamentos from './screens/meusAgendamentos';
import Perfil from './screens/client/Perfil';
import RealizarReclamacao from './screens/realizarReclamacao';

// Páginas sem uso
import Home from '../src/screens/home';
import Sessoes from './screens/client/Sessoes';
import SessaoVirtual from './screens/client/SessaoVirtual';
import NormasJuridicas from './screens/client/NormasJuridicas';
import Comissoes from './screens/client/Comissoes';
import Mais from './screens/client/Mais';
import Servico from './screens/client/Servico';
import Produto from './screens/client/Produto';
import Carrinho from './screens/client/carrinho';
import Pagamento from './screens/client/pagamento';
import Pesquisar from './screens/client/pesquisa';
import RegisterDashboard from './screens/registerDashboard';
import RegisterEndereco from './screens/registerEndereco';
import RegisterLoja from './screens/resgisterLoja';
import JuizoMateria from './screens/juizoMateria';
import TesteGeneratePDF from './screens/testePage';

function App() {
  return (
    <div className="App">
      <TopBar />
     
        <Routes>
          {/* Página Principal */}
          <Route path="/" element={<HomeDashboard />} />

          {/* Controle de Acesso */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Controle Interno */}
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/Relatorios" element={<Relatorios />} />

          {/* Páginas Usuário Logado */}
          <Route path="/meus-atendimentos" element={<MeusAgendamentos />} />
          <Route path="/registrar-reclamacao" element={<RealizarReclamacao />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* Páginas sem uso */}
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/registerDashboard" element={<RegisterDashboard />} />
          <Route path="/registerEndereco" element={<RegisterEndereco />} />
          <Route path="/juizo-materia" element={<JuizoMateria />} />
          <Route path="/registerLoja" element={<RegisterLoja />} />
          <Route path="/testePage" element={<TesteGeneratePDF />} />
          <Route path="/novidades" element={<Home />} />
          <Route path="/Servico" element={<Servico />} />
          <Route path="/Produto" element={<Produto />} />
          <Route path="/Carrinho" element={<Carrinho />} />
          <Route path="/pesquisar" element={<Pesquisar />} />
          <Route path="/Sessoes" element={<Sessoes />} />
          <Route path="/Sessao-Virtual" element={<SessaoVirtual />} />
          <Route path="/Normas" element={<NormasJuridicas />} />
          <Route path="/Comissoes" element={<Comissoes />} />
          <Route path="/Mais" element={<Mais />} />
        </Routes>
     
      <Menu />
      <MenuDesktop />
      <footer className="footer">
        <p>Copyright &copy; 2025 - Blu Tecnologias</p>
      </footer>
    </div>
  );
}

export default App;