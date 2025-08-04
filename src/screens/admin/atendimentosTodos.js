import React, { Component } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore'; // Importe 'orderBy'
import { db, auth } from '../../firebase';
import { useNavigate, useLocation } from 'react-router-dom';

// Componentes
import MenuAdmin from '../../componets/menuAdmin';

class Notificacoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            isLoadingData: true,
            isLoadingAuth: true,
            isAuthorized: false,
            filtroProtocolo: '',
            filtroTipoReclamacao: '',
            filtroClassificacao: '',
            filtroAssuntoDenuncia: '',
            filtroProcurouFornecedor: '',
            filtroFormaAquisicao: '',
            filtroTipoContratacao: '',
            filtroDataContratacao: '',
            filtroNomeServico: '',
            filtroDetalheServico: '',
            filtroTipoDocumento: '',
            filtroNumeroDocumento: '',
            filtroDataOcorrencia: '',
            filtroDataNegativa: '',
            filtroFormaPagamento: '',
            filtroValorCompra: '',
            filtroDetalhesReclamacao: '',
            filtroPedidoConsumidor: '',
            filtroCPF: '',
        };
        this.navigate = this.props.navigate;
    }

    componentDidMount() {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.email) {
                if (user.email === 'admin@cmsga.ce.gov.br') {
                    this.setState({ isAuthorized: true, isLoadingAuth: false });
                    this.fetchReclamacoes();
                } else {
                    this.setState({
                        isAuthorized: false,
                        isLoadingAuth: false,
                        isLoadingData: false
                    });
                    this.navigate('/registrar-reclamacao');
                }
            } else {
                this.setState({
                    isAuthorized: false,
                    isLoadingAuth: false,
                    isLoadingData: false
                });
                this.navigate('/login');
            }
        });

        this.unsubscribeAuth = unsubscribe;
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }

    async fetchReclamacoes() {
        this.setState({ isLoadingData: true });
        try {
            const reclamacoesRef = collection(db, 'reclamacoes');
            // AQUI: A consulta é ordenada pelo campo 'timestamp' em ordem decrescente (do último para o primeiro)
            const q = query(reclamacoesRef, orderBy('timestamp', 'desc')); 
            const querySnapshot = await getDocs(q);

            const reclamacoesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                
            }));
            console.log(reclamacoesData);
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
        this.navigate('/atendimento-sga-ppi6g59');
    };

    handleCreateNewCall = () => {
        this.navigate('/criar-chamado');
    };

    render() {
        const { reclamacoes, isLoadingData, isAuthorized, isLoadingAuth, filtroProtocolo, filtroAssuntoDenuncia, filtroNomeServico } = this.state;

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
                reclamacao.nomeServico.toLowerCase().includes(filtroNomeServico.toLowerCase()) 
            );
        });

        return (
            <div className="App-header">
                <MenuAdmin />
                <div className="favoritos agendarConsulta">
                    <div className="filters-container">
                        <input type="text" placeholder="Protocolo" value={filtroProtocolo} onChange={(e) => this.setState({ filtroProtocolo: e.target.value })} className="filter-input" />
                        <input type="text" placeholder="Assunto Denúncia" value={filtroAssuntoDenuncia} onChange={(e) => this.setState({ filtroAssuntoDenuncia: e.target.value })} className="filter-input" />
                        <input type="text" placeholder="Nome Serviço" value={filtroNomeServico} onChange={(e) => this.setState({ filtroNomeServico: e.target.value })} className="filter-input" />
                    </div>

                    <div className="cards-grid-container">
                        <div className="card create-new-card" onClick={this.handleCreateNewCall}>
                            <div className="card-icon-large">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </div>
                            <h2 className="card-title">Criar Novo Chamado</h2>
                            <p className="card-description">Inicie um novo processo de reclamação ou solicitação.</p>
                        </div>

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
                                    {reclamacao.timestamp && (
                                        <p className="card-detail"><strong>Registrado em:</strong> {this.formatarData(reclamacao.timestamp)}</p>
                                    )}
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