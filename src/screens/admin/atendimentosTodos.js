import React, { Component } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Importe 'auth'
import { useNavigate, useLocation } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


// Componentes
import MenuAdmin from '../../componets/menuAdmin'

class Notificacoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            isLoadingData: true, // Renomeado de 'loading' para ser mais específico sobre o carregamento de dados
            isLoadingAuth: true, // NOVO ESTADO: Para indicar se a verificação de autenticação está em andamento
            isAuthorized: false, // Novo estado para controlar a autorização
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

    async fetchUserData() {
            // Este método não precisa gerenciar o isLoadingData, pois fetchReclamacoes já o faz.
            // Ele apenas lida com o estado de erro específico para os dados do usuário, se houver.
            this.setState({ error: null });
    
            try {
                const userId = this.state.reclamacao.userId; // Cuidado: 'reclamacao' não está no estado de Notificacoes
                console.log('UserID da reclamação:', userId);
    
                if (userId) {
                    const usersCollection = collection(db, 'users');
                    const q = query(usersCollection, where('uid', '==', userId));
                    const querySnapshot = await getDocs(q);
    
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        console.log('Dados do Firestore:', userDoc.data());
                        this.setState({ userData: userDoc.data() });
                    } else {
                        this.setState({ error: 'Dados do usuário não encontrados.' });
                    }
                } else {
                    this.setState({ error: 'userId não encontrado na reclamação.' });
                }
            } catch (err) {
                this.setState({ error: 'Erro ao buscar dados do usuário. Tente novamente.' });
                console.error('Erro ao buscar dados do usuário:', err);
                console.error('Código do erro:', err.code);
                console.error('Mensagem do erro:', err.message);
            }
        }

    render() {
        const { reclamacoes, isLoadingData, isAuthorized, isLoadingAuth, filtroProtocolo, filtroTipoReclamacao, filtroClassificacao, filtroAssuntoDenuncia, filtroProcurouFornecedor, filtroFormaAquisicao, filtroTipoContratacao, filtroDataContratacao, filtroNomeServico, filtroDetalheServico, filtroTipoDocumento, filtroNumeroDocumento, filtroDataOcorrencia, filtroDataNegativa, filtroFormaPagamento, filtroValorCompra, filtroDetalhesReclamacao, filtroPedidoConsumidor, filtroCPF } = this.state;

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
                        <p>Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        const reclamacoesFiltradas = reclamacoes.filter((reclamacao) => {
            return (
                reclamacao.protocolo.toLowerCase().includes(filtroProtocolo.toLowerCase()) &&
                reclamacao.tipoReclamacao.toLowerCase().includes(filtroTipoReclamacao.toLowerCase()) &&
                reclamacao.classificacao.toLowerCase().includes(filtroClassificacao.toLowerCase()) &&
                reclamacao.assuntoDenuncia.toLowerCase().includes(filtroAssuntoDenuncia.toLowerCase()) &&
                reclamacao.procurouFornecedor.toLowerCase().includes(filtroProcurouFornecedor.toLowerCase()) &&
                reclamacao.formaAquisicao.toLowerCase().includes(filtroFormaAquisicao.toLowerCase()) &&
                reclamacao.tipoContratacao.toLowerCase().includes(filtroTipoContratacao.toLowerCase()) &&
                reclamacao.dataContratacao.toLowerCase().includes(filtroDataContratacao.toLowerCase()) &&
                reclamacao.nomeServico.toLowerCase().includes(filtroNomeServico.toLowerCase()) &&
                reclamacao.detalheServico.toLowerCase().includes(filtroDetalheServico.toLowerCase()) &&
                reclamacao.tipoDocumento.toLowerCase().includes(filtroTipoDocumento.toLowerCase()) &&
                reclamacao.numeroDoc.toLowerCase().includes(filtroNumeroDocumento.toLowerCase()) &&
                reclamacao.dataOcorrencia.toLowerCase().includes(filtroDataOcorrencia.toLowerCase()) &&
                reclamacao.dataNegativa.toLowerCase().includes(filtroDataNegativa.toLowerCase()) &&
                reclamacao.formaPagamento.toLowerCase().includes(filtroFormaPagamento.toLowerCase()) &&
                reclamacao.valorCompra.toLowerCase().includes(filtroValorCompra.toLowerCase()) &&
                reclamacao.detalhesReclamacao.toLowerCase().includes(filtroDetalhesReclamacao.toLowerCase()) &&
                reclamacao.pedidoConsumidor.toLowerCase().includes(filtroPedidoConsumidor.toLowerCase()) &&
                reclamacao.cpf.toLowerCase().includes(filtroCPF.toLowerCase())
            );
        });

        return (
            <div className="App-header">
                <MenuAdmin />
                <div className="favoritos agendarConsulta">
                    <TableContainer component={Paper} className="tabela-design">
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead className="tabela-header">
                                <TableRow>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Protocolo" value={filtroProtocolo} onChange={(e) => this.setState({ filtroProtocolo: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="CPF" value={filtroCPF} onChange={(e) => this.setState({ filtroCPF: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Tipo Reclamação" value={filtroTipoReclamacao} onChange={(e) => this.setState({ filtroTipoReclamacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Classificação" value={filtroClassificacao} onChange={(e) => this.setState({ filtroClassificacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Assunto Denúncia" value={filtroAssuntoDenuncia} onChange={(e) => this.setState({ filtroAssuntoDenuncia: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Procurou Fornecedor" value={filtroProcurouFornecedor} onChange={(e) => this.setState({ filtroProcurouFornecedor: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Forma Aquisição" value={filtroFormaAquisicao} onChange={(e) => this.setState({ filtroFormaAquisicao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Tipo Contratação" value={filtroTipoContratacao} onChange={(e) => this.setState({ filtroTipoContratacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <input type="text" placeholder="Nome Serviço" value={filtroNomeServico} onChange={(e) => this.setState({ filtroNomeServico: e.target.value })} />
                                    </TableCell>
                                    
                                   
                                    
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reclamacoesFiltradas.map((reclamacao) => (
                                    <TableRow key={reclamacao.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell align="center">
                                            <a href="/" onClick={(event) => this.handleProtocolClick(event, reclamacao.id)} className="btnMateria">
                                                {reclamacao.protocolo}
                                            </a>
                                        </TableCell>
                                        <TableCell align="center">{reclamacao.cpf}</TableCell>
                                        <TableCell align="center">{reclamacao.tipoReclamacao}</TableCell>
                                        <TableCell align="center">{reclamacao.classificacao}</TableCell>
                                        <TableCell align="center">{reclamacao.assuntoDenuncia}</TableCell>
                                        <TableCell align="center">{reclamacao.procurouFornecedor}</TableCell>
                                        <TableCell align="center">{reclamacao.formaAquisicao}</TableCell>
                                        <TableCell align="center">{reclamacao.tipoContratacao}</TableCell>
                                        <TableCell align="center">{reclamacao.nomeServico}</TableCell>
                                        
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
