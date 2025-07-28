import '../src/App.css'; // Caminho corrigido para App.css
import { Routes, Route } from 'react-router-dom';

// Navigate Components
import TopBar from '../src/componets/topBarSearch'; // Caminho e nome da pasta corrigidos
import Menu from '../src/componets/menu'; // Caminho e nome da pasta corrigidos
import MenuDesktop from '../src/componets/menuDesktop'; // Caminho e nome da pasta corrigidos

// Páginas Principais
import HomeDashboard from './screens/homePage'; // Caminho corrigido
import Cdc from './screens/client/CodigoDefesaConsumidor'; // Caminho corrigido

// Controle de Acesso
import Register from '../src/screens/client/register'; // Caminho corrigido
import Login from '../src/screens/client/login'; // Caminho corrigido

// Controle Interno
import Atendimentos from '../src/screens/client/atendimentosTodos'; // Caminho corrigido
import Relatorios from '../src/screens/client/Relatorios'; // Caminho corrigido
import Atendimento from '../src/screens/client/atendimento'; // Caminho corrigido

// Usuário Logado
import MeusAgendamentos from '../src/screens/meusAtendimentos'; // Caminho corrigido
import ReclamacaoDetalhes from '../src/screens/client/reclamacaoDetalhes'; // Caminho corrigido
import Perfil from '../src/screens/client/Perfil'; // Caminho corrigido
import RealizarReclamacao from '../src/screens/realizarReclamacao'; // Caminho corrigido


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

          {/* Controle Interno */}
          <Route path="/atendimentos-sga-hyo6d27" element={<Atendimentos />} />
          <Route path="/Relatorios" element={<Relatorios />} />
          <Route path="/atendimento-sga-ppi6g59" element={<Atendimento />} />

          {/* Páginas Usuário Logado */}
          <Route path="/meus-atendimentos" element={<MeusAgendamentos />} />
          <Route path="/registrar-reclamacao" element={<RealizarReclamacao />} />
          <Route path="/reclamacao-detalhes" element={<ReclamacaoDetalhes />} />
          <Route path="/perfil" element={<Perfil />} />

          
        </Routes>
      </main> {/* Fim do conteúdo principal */}
     
      <Menu />
      <MenuDesktop />

      {/* Rodapé Detalhado com classes CSS tradicionais */}
      <footer className="footer">
        <div className="footer-container">
          {/* Seção 1: Título e Descrição */}
          <div className="footer-column">
            <h3>Procon CMSGA</h3>
            <p>
              Câmara Municipal de São Gonçalo do Amarante – Ceará.
              Órgão de defesa e proteção dos direitos do consumidor.
            </p>
          </div>

          {/* Seção 2: Nossos Serviços e Informações Úteis */}
          <div className="footer-column">
            <h4>Nossos Serviços</h4>
            <ul>
              <li>
                <a href="/registrar-reclamacao">
                  Registrar Reclamação
                </a>
              </li>
              <li>
                <a href="/login">
                  Entrar na sua conta
                </a>
              </li>
              <li>
                <a href="/register">
                  Criar uma conta
                </a>
              </li>
            </ul>

            <h4>Informações Úteis</h4>
            <ul>
              <li>
                <a href="/codigo-de-defesa-do-consumidor">
                  Código de Defesa do Consumação
                </a>
              </li>
              <li>
                <a href="https://www.consumidor.gov.br/" target="_blank" rel="noopener noreferrer">
                  Plataforma Consumidor.gov
                </a>
              </li>
            </ul>
          </div>

          {/* Seção 3: Contato */}
          <div className="footer-column">
            <h4>Contato</h4>
            <p>
              Endereço: Avenida Prefeito Mauricio Brasileiro, Av. Cel. Neco Martins - Liberdade, São Gonçalo do Amarante - CE, 62670-000
            </p>
            <p>
              Telefone: <a href="tel:08533154482">085 3315-4482</a>
            </p>
            <p>
              Email: <a href="mailto:procon@cmsga.ce.gov.br">procon@cmsga.ce.gov.br</a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>Copyright &copy; 2025 Procon CMSGA. Todos os direitos reservados. <br/>Desenvolvido por Blu Tecnologias</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
