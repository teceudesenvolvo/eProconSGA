import React, { Component } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import MenuDashboard from '../../componets/menuDashboard';

const MAX_FILE_SIZE = 1048576; // 1MB

class ReclamacaoDetalhes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacao: null,
            userData: null,
            loading: true,
            error: null,
            comentarios: [],
            situacao: "",
            novoComentario: "",
            fileToUpload: null,
            uploadedFileName: "",
        };
    }

    componentDidMount() {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ userData: user, loading: false }, () => {
                    this.fetchReclamacao();
                });
            } else {
                this.setState({ loading: false, error: "Usuário não autenticado." });
            }
        });
        this.unsubscribeAuth = unsubscribe;
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }

    async fetchReclamacao() {
        this.setState({ loading: true });
        try {
            const reclamacaoId = localStorage.getItem('reclamacaoId');
            if (!reclamacaoId) {
                this.setState({ loading: false });
                return;
            }
            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);
            const reclamacaoSnap = await getDoc(reclamacaoRef);

            if (reclamacaoSnap.exists()) {
                const reclamacaoData = reclamacaoSnap.data();
                const comentariosData = reclamacaoData.comentarios || [];
                const formattedComentarios = comentariosData.map(comentario => {
                    if (typeof comentario === 'string') {
                        return {
                            text: comentario,
                            type: 'text',
                            timestamp: new Date().toISOString(),
                            author: 'admin@cmsga.ce.gov.br',
                            authorType: 'admin'
                        };
                    }
                    return comentario;
                });

                this.setState({
                    reclamacao: reclamacaoData,
                    loading: false,
                    comentarios: formattedComentarios,
                    situacao: reclamacaoData.situacao || 'EM ANALISE',
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            this.setState({ loading: false });
        }
    }

    handleSituacaoChange = (event) => {
        this.setState({ situacao: event.target.value });
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`O arquivo é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
                event.target.value = null;
                this.setState({ fileToUpload: null, uploadedFileName: "" });
                return;
            }
            this.setState({ fileToUpload: file, uploadedFileName: file.name });
        } else {
            this.setState({ fileToUpload: null, uploadedFileName: "" });
        }
    };

    adicionarComentario = async () => {
        const { novoComentario, fileToUpload, comentarios, userData } = this.state;
        const reclamacaoId = localStorage.getItem('reclamacaoId');
        const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);

        if (!novoComentario && !fileToUpload) {
            alert("Por favor, digite uma mensagem ou selecione um arquivo.");
            return;
        }

        let newComentarios = [...comentarios];
        const currentTimestamp = new Date().toISOString();
        const authorName = userData.displayName || userData.email || 'Usuário Desconhecido';
        const authorType = 'user';

        try {
            if (fileToUpload) {
                const reader = new FileReader();
                reader.readAsDataURL(fileToUpload);
                await new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        const base64Content = e.target.result;
                        newComentarios.push({
                            text: `Arquivo anexado: ${fileToUpload.name}`,
                            type: 'file',
                            content: base64Content,
                            fileName: fileToUpload.name,
                            timestamp: currentTimestamp,
                            author: authorName,
                            authorType: authorType,
                        });
                        resolve();
                    };
                    reader.onerror = error => reject(error);
                });
            }

            if (novoComentario) {
                newComentarios.push({
                    text: novoComentario,
                    type: 'text',
                    timestamp: currentTimestamp,
                    author: authorName,
                    authorType: authorType,
                });
            }

            await updateDoc(reclamacaoRef, {
                comentarios: newComentarios,
            });

            this.setState({
                comentarios: newComentarios,
                novoComentario: '',
                fileToUpload: null,
                uploadedFileName: '',
            });

        } catch (error) {
            alert("Erro ao adicionar comentário/arquivo.");
        }
    };

    formatarDataHoraChat = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('pt-BR', options);
    };

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

    handleDownload = (anexo) => {
        if (anexo && anexo.base64 && anexo.nome) {
            const link = document.createElement('a');
            link.href = anexo.base64;
            link.download = anexo.nome;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    render() {
        const { reclamacao, loading, comentarios, uploadedFileName } = this.state;

        if (loading) {
            return (
                <div className="App-header">
                    <div className="loading-message">
                        <h1>Carregando...</h1>
                        <p>Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        if (!reclamacao) {
            return (
                <div className="App-header">
                    <div className="not-found-message">
                        <h1>Reclamação não encontrada.</h1>
                        <p>Não foi possível carregar os detalhes da reclamação.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="App-header">
                <MenuDashboard />
                <div className="favoritos agendarConsulta">
                    <div className='infosGeral'>
                        <div className='atualizeData'>
                            <h3>Atualizações sobre a reclamação</h3>
                            <div className="chat-container">
                                {Array.isArray(comentarios) && comentarios.map((comentario, index) => (
                                    <div
                                        key={index}
                                        className={`chat-message ${comentario.author === 'admin@cmsga.ce.gov.br'
                                            ? 'admin-message mensage-admin-chat'
                                            : 'user-message'
                                            }`}
                                    >
                                        {comentario.author && (
                                            <p className={`chat-message-meta-client`}>
                                                {comentario.author}
                                            </p>
                                        )}
                                        {comentario.type === 'text' && <p>{comentario.text}</p>}
                                        {comentario.type === 'file' && (
                                            <div>
                                                <p><strong>Arquivo anexado:</strong> <a href={comentario.content} target="_blank" rel="noopener noreferrer">{comentario.fileName}</a></p>
                                            </div>
                                        )}
                                        {comentario.timestamp && (
                                            <p className={`chat-message-meta-client`}>
                                                <span> {this.formatarDataHoraChat(comentario.timestamp)}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-area">
                                <div className="chat-input-comentario-textarea-client">
                                    <textarea
                                        id="novoComentario"
                                        value={this.state.novoComentario || ''}
                                        onChange={(event) => this.setState({ novoComentario: event.target.value })}
                                        placeholder='Escreva uma mensagem...'
                                        className="chat-textarea"
                                    /><br />
                                </div>
                                <div className="chat-input-file-upload-send">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={this.handleFileChange}
                                    /><br />
                                    {uploadedFileName && (
                                        <p className="file-attached-message">Arquivo selecionado: {uploadedFileName}</p>
                                    )}
                                </div>
                                <button onClick={this.adicionarComentario} className="buttonLogin btnComentario">Enviar</button><br />
                            </div>
                        </div>
                        <div className='infoData'>
                            <h2>Dados da Reclamação</h2>
                            <p><strong>Protocolo:</strong> {reclamacao.protocolo}</p>
                            <p><strong>Tipo Reclamação:</strong> {reclamacao.tipoReclamacao}</p>
                            <p><strong>Classificação:</strong> {reclamacao.classificacao}</p>
                            <p><strong>Assunto Denúncia:</strong> {reclamacao.assuntoDenuncia}</p>
                            <p><strong>Procurou Fornecedor:</strong> {reclamacao.procurouFornecedor}</p>
                            <p><strong>Forma Aquisição:</strong> {reclamacao.formaAquisicao}</p>
                            <p><strong>Tipo Contratação:</strong> {reclamacao.tipoContratacao}</p>
                            <p><strong>Data Contratação:</strong> {this.formatarData(reclamacao.dataContratacao)}</p>
                            <p><strong>Nome Serviço:</strong> {reclamacao.nomeServico}</p>
                            <p><strong>Detalhe Serviço:</strong> {reclamacao.detalheServico}</p>
                            <p><strong>Tipo Documento:</strong> {reclamacao.tipoDocumento}</p>
                            <p><strong>Número Documento:</strong> {reclamacao.numeroDoc}</p>
                            <p><strong>Data Ocorrência:</strong> {this.formatarData(reclamacao.dataOcorrencia)}</p>
                            <p><strong>Data Negativa:</strong> {this.formatarData(reclamacao.dataNegativa)}</p>
                            <p><strong>Forma Pagamento:</strong> {reclamacao.formaPagamento}</p>
                            <p><strong>Valor Compra:</strong> {reclamacao.valorCompra}</p>
                            <p><strong>Detalhes Reclamacao:</strong> {reclamacao.detalhesReclamacao}</p>
                            <p><strong>Pedido Consumidor:</strong> {reclamacao.pedidoConsumidor}</p>
                            <p><strong>Situação:</strong> {reclamacao.situacao}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ReclamacaoDetalhes;





