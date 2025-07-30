import React, { Component } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Importe 'auth' para pegar o userId do usuário logado
import { useNavigate, useLocation } from 'react-router-dom';

// Componente
import MenuDashboard from '../../componets/menuDashboard';

class LoginDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            loading: true,
            userData: null, // Para armazenar os dados do usuário logado
        };
        this.navigate = this.props.navigate;
        this.location = this.props.location;
    }

    componentDidMount() {
        this.checkAuthAndFetch();
    }

    async checkAuthAndFetch() {
        // Usa onAuthStateChanged para obter o userId de forma reativa e segura
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Se o usuário está logado, armazena seus dados e busca as reclamações
                this.setState({ userData: user, loading: true }); // Define loading como true novamente para a busca de reclamações
                // Passa o UID e o email do usuário logado
                this.fetchReclamacoes(user.uid, user.email); 
            } else {
                // Se não há usuário logado, redireciona para o login
                localStorage.setItem('paginaAnterior', this.location.pathname);
                this.navigate('/login');
                this.setState({ loading: false }); // Garante que o loading seja false
            }
        });
        // Armazena a função de unsubscribe para limpar no componentWillUnmount
        this.unsubscribeAuth = unsubscribe;
    }

    componentWillUnmount() {
        // Limpa o listener de autenticação ao desmontar o componente
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }

    async fetchReclamacoes(userId, userEmail) { // Recebe userId E userEmail como parâmetros
        try {
            if (!userId && !userEmail) {
                console.error('Nenhum identificador de usuário (UID ou Email) disponível.');
                this.setState({ loading: false });
                return;
            }

            const reclamacoesRef = collection(db, 'reclamacoes');
            let reclamacoesData = [];

            // 1. Tenta buscar por userEmail (prioridade para novas reclamações)
            if (userEmail) {
                const qByEmail = query(reclamacoesRef, where('userEmail', '==', userEmail));
                const querySnapshotByEmail = await getDocs(qByEmail);
                reclamacoesData = querySnapshotByEmail.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            }

            // 2. Se não encontrou por e-mail, ou se a reclamação não tem o campo userEmail (para compatibilidade),
            // tenta buscar por userId (UID do Firebase Auth)
            if (reclamacoesData.length === 0 && userId) {
                const qByUserId = query(reclamacoesRef, where('userId', '==', userId));
                const querySnapshotByUserId = await getDocs(qByUserId);
                // Adiciona as reclamações encontradas por userId, evitando duplicatas se já houver por email
                querySnapshotByUserId.docs.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    if (!reclamacoesData.some(item => item.id === data.id)) {
                        reclamacoesData.push(data);
                    }
                });
            }

            this.setState({ reclamacoes: reclamacoesData, loading: false });
        } catch (error) {
            console.error('Erro ao buscar reclamações:', error);
            this.setState({ loading: false });
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

    handleProtocoloClick = (reclamacaoId) => {
        localStorage.setItem('reclamacaoId', reclamacaoId);
        this.navigate('/reclamacao-detalhes'); // URL da página de detalhes do usuário
    };

    handleCreateNewCall = () => {
        this.navigate('/registrar-reclamacao'); // URL para a página de criação de nova reclamação
    };

    render() {
        const { reclamacoes, loading } = this.state;

        if (loading) {
            return (
                <div className="App-header">
                    <div className="loading-message">
                        <h1>Carregando suas reclamações...</h1>
                        <p>Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="App-header">
                <MenuDashboard />
                {/* Container dos Cards */}
                <div className="cards-grid-container">
                    {/* Card para Criar Nova Reclamação */}
                    <div className="card create-new-card" onClick={this.handleCreateNewCall}>
                        <div className="card-icon-large">
                            {/* Ícone de mais ou similar */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        </div>
                        <h2 className="card-title">Nova Reclamação</h2>
                        <p className="card-description">Registre uma nova reclamação ou solicitação.</p>
                    </div>

                    {/* Mapeia as reclamações do usuário para renderizar os cards */}
                    {reclamacoes.length > 0 ? (
                        reclamacoes.map((reclamacao) => (
                            <div key={reclamacao.id} className="card complaint-card" onClick={() => this.handleProtocoloClick(reclamacao.id)}>
                                <div className="card-header">
                                    <h2 className="card-title">Protocolo: {reclamacao.protocolo}</h2>
                                    <span className="card-status">{reclamacao.situacao || 'N/A'}</span>
                                </div>
                                <div className="card-body">
                                    <p className="card-detail"><strong>Classificação:</strong> {reclamacao.classificacao}</p>
                                    <p className="card-detail"><strong>Assunto:</strong> {reclamacao.assuntoDenuncia}</p>
                                    <p className="card-detail"><strong>Serviço:</strong> {reclamacao.nomeServico}</p>
                                    <p className="card-detail"><strong>Data Contratação:</strong> {this.formatarData(reclamacao.dataContratacao)}</p>
                                    <p className="card-detail"><strong>Valor Compra:</strong> R$ {reclamacao.valorCompra},00</p>
                                </div>
                                <div className="card-footer">
                                    <span className="card-footer-text">Clique para ver detalhes e chat</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-reclamations-message">
                            <p>Você ainda não tem reclamações registradas.</p>
                            <p>Clique em "Nova Reclamação" para começar!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    let location = useLocation();
    return <LoginDashboard {...props} navigate={navigate} location={location} />
}

export default WithNavigate;