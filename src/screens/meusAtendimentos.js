import React, { Component } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MenuDashboard from '../componets/menuDashboard';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate, useLocation } from 'react-router-dom';

class LoginDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacoes: [],
            loading: true,
        };
        this.navigate = this.props.navigate;
        this.location = this.props.location;
    }

    componentDidMount() {
        this.checkAuthAndFetch();
    }

    async checkAuthAndFetch() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            localStorage.setItem('paginaAnterior', this.location.pathname);
            this.navigate('/login');
            return;
        }
        this.fetchReclamacoes();
    }

    async fetchReclamacoes() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('Usuário não autenticado.');
                this.setState({ loading: false });
                return;
            }

            const reclamacoesRef = collection(db, 'reclamacoes');
            const q = query(reclamacoesRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);

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

    handleProtocoloClick = (reclamacaoId) => {
        localStorage.setItem('reclamacaoId', reclamacaoId);
        this.navigate('/reclamacao-detalhes');
    };

    render() {
        const { reclamacoes, loading } = this.state;

        if (loading) {
            return <div>Carregando...</div>;
        }

        return (
            <div className="App-header">
                <MenuDashboard />
                <a href='/registrar-reclamacao' className='buttonLogin btnNewReclam'>Nova Reclamação</a>
                <TableContainer component={Paper} className="tabela-design">
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead className="tabela-header">
                            <TableRow>
                                <TableCell align="center">Protocolo</TableCell>
                                <TableCell align="center">Tipo Reclamação</TableCell>
                                <TableCell align="center">Classificação</TableCell>
                                <TableCell align="center">Assunto Denúncia</TableCell>
                                <TableCell align="center">Procurou Fornecedor</TableCell>
                                <TableCell align="center">Forma Aquisição</TableCell>
                                <TableCell align="center">Tipo Contratação</TableCell>
                                <TableCell align="center">Data Contratação</TableCell>
                                <TableCell align="center">Nome Serviço</TableCell>
                                <TableCell align="center">Tipo Documento</TableCell>
                                <TableCell align="center">Número Documento</TableCell>
                                <TableCell align="center">Data Ocorrência</TableCell>
                                <TableCell align="center">Data Negativa</TableCell>
                                <TableCell align="center">Forma Pagamento</TableCell>
                                <TableCell align="center">Valor Compra</TableCell>
                                <TableCell align="center">Situação</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reclamacoes.map((reclamacao) => (
                                <TableRow
                                    key={reclamacao.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell
                                        align="center"
                                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                        onClick={() => this.handleProtocoloClick(reclamacao.id)}
                                    >
                                        {reclamacao.protocolo}
                                    </TableCell>
                                    <TableCell align="center">{reclamacao.tipoReclamacao}</TableCell>
                                    <TableCell align="center">{reclamacao.classificacao}</TableCell>
                                    <TableCell align="center">{reclamacao.assuntoDenuncia}</TableCell>
                                    <TableCell align="center">{reclamacao.procurouFornecedor}</TableCell>
                                    <TableCell align="center">{reclamacao.formaAquisicao}</TableCell>
                                    <TableCell align="center">{reclamacao.tipoContratacao}</TableCell>
                                    <TableCell align="center">{reclamacao.dataContratacao}</TableCell>
                                    <TableCell align="center">{reclamacao.nomeServico}</TableCell>
                                    <TableCell align="center">{reclamacao.tipoDocumento}</TableCell>
                                    <TableCell align="center">{reclamacao.numeroDoc}</TableCell>
                                    <TableCell align="center">{reclamacao.dataOcorrencia}</TableCell>
                                    <TableCell align="center">{reclamacao.dataNegativa}</TableCell>
                                    <TableCell align="center">{reclamacao.formaPagamento}</TableCell>
                                    <TableCell align="center">R$ {reclamacao.valorCompra},00</TableCell>
                                    <TableCell align="center">{reclamacao.situacao}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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