import React, { Component } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
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
            loading: true,
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
        this.fetchReclamacoes();
    }

    async fetchReclamacoes() {
        try {
            const reclamacoesRef = collection(db, 'reclamacoes');
            const querySnapshot = await getDocs(reclamacoesRef);

            const reclamacoesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

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

    handleProtocolClick = (event, reclamacaoId) => {
        event.preventDefault();
        localStorage.setItem('reclamacaoId', reclamacaoId);
        this.navigate('/atendimento-sga-ppi6g59');
    };

    async fetchUserData() {
            this.setState({ loading: true, error: null });
    
            try {
                const userId = this.state.reclamacao.userId;
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
            } finally {
                this.setState({ loading: false });
            }
        }

    render() {
        const { reclamacoes, loading, filtroProtocolo, filtroTipoReclamacao, filtroClassificacao, filtroAssuntoDenuncia, filtroProcurouFornecedor, filtroFormaAquisicao, filtroTipoContratacao, filtroDataContratacao, filtroNomeServico, filtroDetalheServico, filtroTipoDocumento, filtroNumeroDocumento, filtroDataOcorrencia, filtroDataNegativa, filtroFormaPagamento, filtroValorCompra, filtroDetalhesReclamacao, filtroPedidoConsumidor, filtroCPF } = this.state;

        if (loading) {
            return <div>Carregando...</div>;
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