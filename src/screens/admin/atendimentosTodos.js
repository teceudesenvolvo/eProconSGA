import React, { Component } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Importe 'auth'
import { useNavigate, useLocation } from 'react-router-dom';
// Removidos os imports de @mui/material/Table, etc.

// Componentes
import MenuAdmin from '../../componets/menuAdmin'

class Notificacoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            isLoadingData: true,
            isLoadingAuth: true,
            isAuthorized: false,
            filtroProtocolo: '',
            filtroAssuntoDenuncia: '',
            filtroEmail: '',
        };
        this.navigate = this.props.navigate;
    }

    componentDidMount() {
        // Verifica o estado de autenticação do usuário
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Verifica se o usuário existe e se o email existe
            if (user && user.email) {
                // Se o usuário existe e o email é o admin
                if (user.email === 'admin@cmsga.ce.gov.br') {
                    this.setState({ isAuthorized: true, isLoadingAuth: false });
                    this.fetchReclamacoes(); // Busca as reclamações apenas se autorizado
                } else {
                    // Se o usuário existe, tem um email, mas NÃO é o email do admin
                    this.setState({
                        isAuthorized: false, // Não autorizado para esta página específica
                        isLoadingAuth: false,
                        isLoadingData: false // Não há dados para carregar para esta página
                    });
                    this.navigate('/registrar-reclamacao'); // Redireciona para /registrar-reclamacao
                }
            } else {
                // Se o usuário não existe (não logado) ou não tem email
                this.setState({
                    isAuthorized: false,
                    isLoadingAuth: false,
                    isLoadingData: false
                });
                this.navigate('/login'); // Redireciona para a página de login
            }
        });

        // Limpa o listener ao desmontar o componente
        this.unsubscribeAuth = unsubscribe;
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }

    async fetchReclamacoes() {
        this.setState({ isLoadingData: true }); // Inicia o carregamento dos dados
        try {
            const reclamacoesRef = collection(db, 'reclamacoes');
            const querySnapshot = await getDocs(reclamacoesRef);

            const reclamacoesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                
            }));
            console.log(reclamacoesData); // Log dos dados da reclamação
            this.setState({ reclamacoes: reclamacoesData, isLoadingData: false });
        } catch (error) {
            console.error('Erro ao buscar reclamações:', error);
            this.setState({ isLoadingData: false });
        }
    }

    formatarData = (dataString) => {
        if (!dataString) {
            return '';
        }

        const data = new Date(dataString);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();

        return `${dia}-${mes}-${ano}`;
    };

    handleProtocolClick = (event, reclamacaoId) => {
        event.preventDefault();
        localStorage.setItem('reclamacaoId', reclamacaoId);
        this.navigate('/atendimento-sga-ppi6g59'); // URL da página de detalhes do admin
    };

    handleCreateNewCall = () => {
        this.navigate('/criar-chamado'); // URL para a página de criação de nova reclamação
    };

    render() {
        const { reclamacoes, isLoadingData, isAuthorized, isLoadingAuth, filtroProtocolo, filtroAssuntoDenuncia, filtroEmail } = this.state;

        // 1. Exibe "Carregando autenticação..." enquanto o estado de autenticação não foi verificado
        if (isLoadingAuth) {
            return (
                <div className="App-header">
                    <div className="loading-message">
                        <h1>Carregando autenticação...</h1>
                        <p>Verificando suas permissões de acesso.</p>
                    </div>
                </div>
            );
        }

        // 2. Se a autenticação foi verificada e o usuário não está autorizado
        if (!isAuthorized) {
            return (
                <div className="App-header">
                    <div className="unauthorized-message">
                        <h1>Acesso Não Autorizado</h1>
                        <p>Você não tem permissão para visualizar esta página. Por favor, faça login com uma conta de administrador.</p>
                        <button onClick={() => this.navigate('/login')} className="go-to-login-button">Ir para Login</button>
                    </div>
                </div>
            );
        }

        // 3. Se o usuário está autorizado, mas os dados da reclamação ainda estão carregando
        if (isLoadingData) {
            return (
                <div className="App-header">
                    <div className="loading-message">
                        <h1>Carregando dados das reclamações...</h1>
                        <p>Por favor, aguarde...</p>
                    </div>
                </div>
            );
        }

        const reclamacoesFiltradas = reclamacoes.filter((reclamacao) => {
            return (
                reclamacao.protocolo.toLowerCase().includes(filtroProtocolo.toLowerCase()) &&
                reclamacao.assuntoDenuncia.toLowerCase().includes(filtroAssuntoDenuncia.toLowerCase()) &&
                (reclamacao.userEmail || '').toLowerCase().includes(filtroEmail.toLowerCase())
            );
        });

        return (
            <div className="App-header">
                <MenuAdmin />
                <div className="favoritos agendarConsulta">
                    {/* Área de Filtros */}
                    <div className="filters-container">
                        <input type="text" placeholder="Protocolo" value={filtroProtocolo} onChange={(e) => this.setState({ filtroProtocolo: e.target.value })} className="filter-input" />
                        <input type="text" placeholder="Assunto Denúncia" value={filtroAssuntoDenuncia} onChange={(e) => this.setState({ filtroAssuntoDenuncia: e.target.value })} className="filter-input" />
                        <input type="text" placeholder="email-do-usuário@exemplo.com" value={filtroEmail} onChange={(e) => this.setState({ filtroEmail: e.target.value })} className="filter-input" />
                    </div>

                    {/* Container dos Cards */}
                    <div className="cards-grid-container">
                        {/* Card para Criar Novo Chamado */}
                        
                        <div className="card create-new-card" onClick={this.handleCreateNewCall}>
                            <div className="card-icon-large">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </div>
                            <h2 className="card-title">Criar Novo Chamado</h2>
                            <p className="card-description">Inicie um novo processo de reclamação ou solicitação.</p>
                        </div>

                        {/* Mapeia as reclamações filtradas para renderizar os cards */}
                        {reclamacoesFiltradas.map((reclamacao) => (
                            <div key={reclamacao.id} className="card complaint-card" onClick={(event) => this.handleProtocolClick(event, reclamacao.id)}>
                                <div className="card-header">
                                    <h2 className="card-title">Protocolo: {reclamacao.protocolo}</h2>
                                    <span className="card-status">{reclamacao.situacao || 'N/A'}</span>
                                </div>
                                <div className="card-body">
                                    <p className="card-detail"><strong>Tipo:</strong> {reclamacao.tipoReclamacao}</p>
                                    <p className="card-detail"><strong>Classificação:</strong> {reclamacao.classificacao}</p>
                                    <p className="card-detail"><strong>Assunto:</strong> {reclamacao.assuntoDenuncia}</p>
                                    <p className="card-detail"><strong>Serviço:</strong> {reclamacao.nomeServico}</p>
                                    <p className="card-detail"><strong>Data Contratação:</strong> {this.formatarData(reclamacao.dataContratacao)}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="card-footer-text">Clique para ver detalhes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    let location = useLocation();
    return <Notificacoes {...props} navigate={navigate} location={location} />
}

export default WithNavigate;