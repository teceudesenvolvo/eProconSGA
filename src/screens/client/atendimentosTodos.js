import React, { Component } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
            filtroSituacao: '',
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

    render() {
        const { reclamacoes, loading, filtroProtocolo, filtroTipoReclamacao, filtroClassificacao, filtroAssuntoDenuncia, filtroProcurouFornecedor, filtroFormaAquisicao, filtroTipoContratacao, filtroDataContratacao, filtroNomeServico, filtroDetalheServico, filtroTipoDocumento, filtroNumeroDocumento, filtroDataOcorrencia, filtroDataNegativa, filtroFormaPagamento, filtroValorCompra, filtroDetalhesReclamacao, filtroPedidoConsumidor, filtroSituacao } = this.state;

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
                "Em Análise".toLowerCase().includes(filtroSituacao.toLowerCase())
            );
        });

        return (
            <div className="App-header">
                <div className="favoritos agendarConsulta">
                    <TableContainer component={Paper} className="tabela-design">
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead className="tabela-header">
                                <TableRow>
                                    <TableCell align="center">
                                        Protocolo
                                        <input type="text" value={filtroProtocolo} onChange={(e) => this.setState({ filtroProtocolo: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Tipo Reclamação
                                        <input type="text" value={filtroTipoReclamacao} onChange={(e) => this.setState({ filtroTipoReclamacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Classificação
                                        <input type="text" value={filtroClassificacao} onChange={(e) => this.setState({ filtroClassificacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Assunto Denúncia
                                        <input type="text" value={filtroAssuntoDenuncia} onChange={(e) => this.setState({ filtroAssuntoDenuncia: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Procurou Fornecedor
                                        <input type="text" value={filtroProcurouFornecedor} onChange={(e) => this.setState({ filtroProcurouFornecedor: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Forma Aquisição
                                        <input type="text" value={filtroFormaAquisicao} onChange={(e) => this.setState({ filtroFormaAquisicao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Tipo Contratação
                                        <input type="text" value={filtroTipoContratacao} onChange={(e) => this.setState({ filtroTipoContratacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Data Contratação
                                        <input type="text" value={filtroDataContratacao} onChange={(e) => this.setState({ filtroDataContratacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Nome Serviço
                                        <input type="text" value={filtroNomeServico} onChange={(e) => this.setState({ filtroNomeServico: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Detalhe Serviço
                                        <input type="text" value={filtroDetalheServico} onChange={(e) => this.setState({ filtroDetalheServico: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Tipo Documento
                                        <input type="text" value={filtroTipoDocumento} onChange={(e) => this.setState({ filtroTipoDocumento: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Número Documento
                                        <input type="text" value={filtroNumeroDocumento} onChange={(e) => this.setState({ filtroNumeroDocumento: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Data Ocorrência
                                        <input type="text" value={filtroDataOcorrencia} onChange={(e) => this.setState({ filtroDataOcorrencia: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Data Negativa
                                        <input type="text" value={filtroDataNegativa} onChange={(e) => this.setState({ filtroDataNegativa: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Forma Pagamento
                                        <input type="text" value={filtroFormaPagamento} onChange={(e) => this.setState({ filtroFormaPagamento: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Valor Compra
                                        <input type="text" value={filtroValorCompra} onChange={(e) => this.setState({ filtroValorCompra: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Detalhes Reclamação
                                        <input type="text" value={filtroDetalhesReclamacao} onChange={(e) => this.setState({ filtroDetalhesReclamacao: e.target.value })} />
                                    </TableCell>
                                    <TableCell align="center">
                                        Pedido Consumidor
                                        <input type="text" value={filtroPedidoConsumidor} onChange={(e) => this.setState({ filtroPedidoConsumidor: e.target.value })} />
                                    </TableCell>
                                    
                                    <TableCell align="center">
                                        Situação
                                        <input type="text" value={filtroSituacao} onChange={(e) => this.setState({ filtroSituacao: e.target.value })} />
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
                                        <TableCell align="center">{reclamacao.tipoReclamacao}</TableCell>
                                        <TableCell align="center">{reclamacao.classificacao}</TableCell>
                                        <TableCell align="center">{reclamacao.assuntoDenuncia}</TableCell>
                                        <TableCell align="center">{reclamacao.procurouFornecedor}</TableCell>
                                        <TableCell align="center">{reclamacao.formaAquisicao}</TableCell>
                                        <TableCell align="center">{reclamacao.tipoContratacao}</TableCell>
                                        <TableCell align="center">{this.formatarData(reclamacao.dataContratacao)}</TableCell>
                                        <TableCell align="center">{reclamacao.nomeServico}</TableCell>
                                        <TableCell align="center">{reclamacao.detalheServico}</TableCell>
                                        <TableCell align="center">{reclamacao.tipoDocumento}</TableCell>
                                        <TableCell align="center">{reclamacao.numeroDoc}</TableCell>
                                        <TableCell align="center">{this.formatarData(reclamacao.dataOcorrencia)}</TableCell>
                                        <TableCell align="center">{this.formatarData(reclamacao.dataNegativa)}</TableCell>
                                        <TableCell align="center">{reclamacao.formaPagamento}</TableCell>
                                        <TableCell align="center">{reclamacao.valorCompra}</TableCell>
                                        <TableCell align="center">{reclamacao.detalhesReclamacao}</TableCell>
                                        <TableCell align="center">{reclamacao.pedidoConsumidor}</TableCell>
                                        <TableCell align="center">{reclamacao.situacao}</TableCell>
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