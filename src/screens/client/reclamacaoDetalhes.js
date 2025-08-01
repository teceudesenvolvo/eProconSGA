import React, { Component } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

// Componente
import MenuDashboard from '../../componets/menuDashboard';

// Define o tamanho máximo do arquivo (em bytes) - Exemplo: 5MB
const MAX_FILE_SIZE = 1048576;

class ReclamacaoDetalhes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacao: null,
            userData: null,
            loading: true,
            error: null,
            comentarios: [],
<<<<<<< HEAD
            situacao: '',
            novoAnexo: null,
            anexoError: null, // Novo estado para exibir erro de tamanho do arquivo
=======
            situacao: "",
            novoComentario: "",
            fileToUpload: null,
            uploadedFileName: "",
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
        };
    }

    componentDidMount() {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ userData: user, loading: false }, () => {
                    console.log(this.state.userData);
                    this.fetchReclamacao();
                });
            } else {
                console.error("Usuário não logado.");
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
                console.error('ID da reclamação não encontrado no localStorage.');
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
<<<<<<< HEAD
                    comentarios: reclamacaoSnap.data().comentarios || [],
                    situacao: reclamacaoSnap.data().situacao || 'EM ANALISE',
                }, () => {
                    this.fetchUserData(reclamacaoSnap.data().userId);
=======
                    comentarios: formattedComentarios,
                    situacao: reclamacaoData.situacao || 'EM ANALISE',
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
                });
            } else {
                console.error('Reclamação não encontrada.');
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error('Erro ao buscar reclamação:', error);
            this.setState({ loading: false });
        }
    }

<<<<<<< HEAD

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

=======
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
    handleSituacaoChange = (event) => {
        this.setState({ situacao: event.target.value });
    };

    handleAnexoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
<<<<<<< HEAD
            if (file.size > MAX_FILE_SIZE) {
                this.setState({ anexoError: `O arquivo é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE / (1024 * 1024)}MB.` });
                // Limpa o input de arquivo para o usuário selecionar outro
                event.target.value = null;
                this.setState({ novoAnexo: null });
                return;
            }
            this.setState({ novoAnexo: file, anexoError: null });
=======
            this.setState({ fileToUpload: file, uploadedFileName: file.name });
        } else {
            this.setState({ fileToUpload: null, uploadedFileName: "" });
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
        }
    };

    adicionarAnexoComentario = async () => {
        const { novoAnexo, comentarios } = this.state;

        if (!novoAnexo) {
            alert('Por favor, selecione um arquivo para anexar.');
            return;
        }

        if (this.state.anexoError) {
            alert(this.state.anexoError);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            const nomeArquivo = novoAnexo.name;
            const novoComentario = {
                texto: `Anexo: ${nomeArquivo}`,
                anexo: {
                    nome: nomeArquivo,
                    base64: base64,
                },
            };

            const reclamacaoId = localStorage.getItem('reclamacaoId');
            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);

            try {
                await updateDoc(reclamacaoRef, {
                    comentarios: [...comentarios, novoComentario],
                });

                this.setState(prevState => ({
                    comentarios: [...prevState.comentarios, novoComentario],
                    novoAnexo: null,
                }));

                console.log('Anexo adicionado ao comentário com sucesso!');
            } catch (error) {
                console.error('Erro ao adicionar anexo ao comentário:', error);
            }
        };
        reader.readAsDataURL(novoAnexo);
    };

    salvarAtualizacoes = async () => {
        try {
            const reclamacaoId = localStorage.getItem('reclamacaoId');
            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);

            await updateDoc(reclamacaoRef, {
                situacao: this.state.situacao,
            });

            console.log('Situação da reclamação atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar situação:', error);
        }
    };

<<<<<<< HEAD
=======
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

            console.log('Comentário(s) e/ou arquivo(s) adicionados com sucesso!');

        } catch (error) {
            console.error('Erro ao adicionar comentário e/ou arquivo:', error);
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

>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
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
        } else {
            console.error('Dados do anexo inválidos para download.');
        }
    };

    render() {
<<<<<<< HEAD
        const { reclamacao, loading, comentarios, userData, anexoError } = this.state;
=======
        const { reclamacao, loading, uploadedFileName } = this.state;
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1

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
<<<<<<< HEAD
                            <label htmlFor="comentarios">Histórico de Atualizações:</label><br />
                            {Array.isArray(comentarios) && (
                                <ol>
                                    {comentarios.map((comentario, index) => (
                                        <li className='comentarioChat' key={index}>
                                            {comentario}
                                            {comentario.anexo && comentario.anexo.nome && (
                                                <p>
                                                    Anexo: <button onClick={() => this.handleDownload(comentario.anexo)}>
                                                        {comentario.anexo.nome}
                                                    </button>
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                        <div className='atualizeData'>
                            <label htmlFor="anexo">Enviar Anexo</label><br />
                            <input className='buttonLogin btnUpload' type="file" onChange={this.handleAnexoChange} /><br />
                            {anexoError && <p className="error-message">{anexoError}</p>} {/* Exibe a mensagem de erro */}
                            <button className='buttonLogin btnComentario btnSend' onClick={this.adicionarAnexoComentario} disabled={!!anexoError || !this.state.novoAnexo}>Adicionar Anexo</button>
                        </div>

                        {userData && (
                            <div className='userData'>
                                <h2>Dados do Fornecedor</h2>
                                <p><strong>Nome:</strong> {userData.nome}</p>
=======
                            {/* Início da Seção de Chat */}
                            <div className="chat-container">
                                {Array.isArray(this.state.comentarios) && this.state.comentarios.map((comentario, index) => (
                                    // Aplica classe condicional baseada no authorType E no email do autor
                                    <div
                                        key={index}
                                        className={`chat-message ${comentario.author === 'admin@cmsga.ce.gov.br'
                                            ? (comentario.author === 'admin@cmsga.ce.gov.br' ? 'admin-message mensage-admin-chat' : 'admin-message')
                                            : 'user-message'
                                            }`}
                                    >
                                        {(comentario.author) && (
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
                                        {/* Informações de data, hora e autor */}
                                        {(comentario.timestamp) && (
                                            <p className={`chat-message-meta-client`}>
                                                {comentario.timestamp && (
                                                    <span> {this.formatarDataHoraChat(comentario.timestamp)}</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Fim da Seção de Chat */}

                            {/* Área de Input do Chat, incluindo o anexo */}
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
                            {/* Fim da Área de Input do Chat */}
                        </div>

                        {/* {this.state.userData && (
                            <div className='userData'>
                                <h2>Seus Dados</h2>
                                <p><strong>Nome:</strong> {this.state.userData.displayName || this.state.userData.displayName}</p>
                                <p><strong>Email:</strong> {this.state.userData.email}</p>
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
                            </div>
                        )} */}

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
<<<<<<< HEAD
=======
                    {this.state.pdfBase64 && (
                        <iframe src={this.state.pdfBase64} width="100%" height="500px" title="Visualização do PDF" />
                    )}
>>>>>>> b65cdf3c88724a1023fd0a5450cf8b903b38e5b1
                </div>
            </div>
        );
    }
}

export default ReclamacaoDetalhes;





