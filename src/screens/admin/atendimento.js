import React, { Component } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuAdmin from "../../componets/menuAdmin";

// Dados do EmailJS
const EMAILJS_SERVICE_ID = "service_z4k1d0m";
const EMAILJS_TEMPLATE_ID = "template_0zdsxiw";
const EMAILJS_USER_ID = "TtE0io7wrvJ8m5Wqq";
const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

class ReclamacaoDetalhes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacao: null,
            userData: null,
            isLoadingData: true,
            isLoadingAuth: true,
            error: null,
            comentarios: [],
            situacao: "",
            novoComentario: "",
            fileToUpload: null,
            uploadedFileName: "",
            isAuthorized: false,
            emailStatus: "",
            emailStatusType: "",
            // Novos estados para controlar o modal
            showModal: false,
            modalFile: null,
        };
        this.navigate = props.navigate;
    }

    componentDidMount() {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.email) {
                if (user.email === "admin@cmsga.ce.gov.br") {
                    this.setState({ isAuthorized: true, isLoadingAuth: false });
                    this.fetchReclamacao();
                } else {
                    this.setState({
                        isAuthorized: false,
                        isLoadingAuth: false,
                        isLoadingData: false,
                    });
                    this.navigate("/registrar-reclamacao");
                }
            } else {
                this.setState({
                    isAuthorized: false,
                    isLoadingAuth: false,
                    isLoadingData: false,
                });
                this.navigate("/login");
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
        this.setState({ isLoadingData: true });
        try {
            const reclamacaoId = localStorage.getItem("reclamacaoId");
            if (!reclamacaoId) {
                console.error("ID da reclamação não encontrado no localStorage.");
                this.setState({ isLoadingData: false });
                return;
            }
            const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);
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
                    isLoadingData: false,
                    comentarios: formattedComentarios,
                    situacao: reclamacaoData.situacao || "EM ANALISE",
                }, () => {
                    this.fetchUserData(reclamacaoData);
                });
            } else {
                console.error("Reclamação não encontrada.");
                this.setState({ isLoadingData: false });
            }
        } catch (error) {
            console.error("Erro ao buscar reclamação:", error);
            this.setState({ isLoadingData: false });
        }
    }

    async fetchUserData(reclamacaoData) {
        this.setState({ error: null });
        try {
            if (reclamacaoData.userDataAtTimeOfComplaint) {
                this.setState({ userData: reclamacaoData.userDataAtTimeOfComplaint });
                return;
            }

            const userEmail = reclamacaoData.userEmail;
            console.log("Buscando dados do usuário com email:", reclamacaoData);
            if (userEmail) {
                const usersCollection = collection(db, "users");
                const q = query(usersCollection, where("email", "==", userEmail));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    this.setState({ userData: userDoc.data() });
                } else {
                    this.setState({ error: "Dados do usuário não encontrados para este e-mail." });
                }
                return;
            }

            const userId = reclamacaoData.userId;
            if (userId) {
                const usersCollection = collection(db, "users");
                const q = query(usersCollection, where("uid", "==", userId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    this.setState({ userData: userDoc.data() });
                } else {
                    this.setState({ error: "Dados do usuário não encontrados para este UID." });
                }
            } else {
                this.setState({ error: "Nenhum identificador de usuário (email ou UID) encontrado na reclamação." });
            }
        } catch (err) {
            this.setState({ error: "Erro ao buscar dados do usuário. Tente novamente." });
            console.error("Erro ao buscar dados do usuário:", err);
        }
    }

    handleSituacaoChange = (event) => {
        this.setState({ situacao: event.target.value });
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({ fileToUpload: file, uploadedFileName: file.name });
        } else {
            this.setState({ fileToUpload: null, uploadedFileName: "" });
        }
    };

    salvarAtualizacoes = async () => {
        try {
            const reclamacaoId = localStorage.getItem("reclamacaoId");
            const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);
            await updateDoc(reclamacaoRef, {
                situacao: this.state.situacao,
            });
            console.log("Atualizações salvas com sucesso!");
            this.setState({ emailStatus: "Situação salva com sucesso!", emailStatusType: "success" });
            setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
        } catch (error) {
            console.error("Erro ao salvar atualizações:", error);
            this.setState({ emailStatus: "Erro ao salvar situação.", emailStatusType: "error" });
            setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
        }
    };

    async sendEmailWithEmailJS(recipientEmail, message, protocolo, nomeConsumidor, fileAttachmentName = null) {
        if (!recipientEmail) {
            return { success: false, error: "E-mail do destinatário não informado." };
        }
        if (!message && !fileAttachmentName) {
            return { success: false, error: "Mensagem ou arquivo não informado para envio de e-mail." };
        }

        let emailMessage = message;
        if (fileAttachmentName) {
            emailMessage += `\n\nFoi anexado um arquivo: ${fileAttachmentName}`;
        }

        try {
            const response = await axios.post(EMAILJS_SEND_URL, {
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_USER_ID,
                template_params: {
                    to_email: recipientEmail,
                    subject: `Atualização da sua Reclamação PROCON CMSGA - Protocolo: ${protocolo}`,
                    protocolo: protocolo,
                    mensagem: emailMessage,
                    nomeConsumidor: nomeConsumidor || "Consumidor",
                },
            });
            if (response.status === 200) {
                return { success: true };
            } else {
                return { success: false, error: response.statusText };
            }
        } catch (error) {
            let errorMsg = "Erro ao enviar e-mail.";
            if (error.response && error.response.data) {
                errorMsg = error.response.data;
            } else if (error.message) {
                errorMsg = error.message;
            }
            return { success: false, error: errorMsg };
        }
    }

    adicionarComentario = async () => {
        const { novoComentario, fileToUpload, comentarios, reclamacao, userData } = this.state;
        const reclamacaoId = localStorage.getItem("reclamacaoId");
        const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);

        if (!novoComentario && !fileToUpload) {
            this.setState({ emailStatus: "Por favor, digite uma mensagem ou selecione um arquivo.", emailStatusType: "error" });
            setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 3000);
            return;
        }

        let newComentarios = [...comentarios];
        const currentTimestamp = new Date().toISOString();
        const authorEmail = auth.currentUser ? auth.currentUser.email : 'admin@cmsga.ce.gov.br';
        const authorType = 'admin';

        let messageForEmail = novoComentario;
        let fileAttachmentNameForEmail = null;

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
                            author: authorEmail,
                            authorType: authorType,
                        });
                        fileAttachmentNameForEmail = fileToUpload.name;
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
                    author: authorEmail,
                    authorType: authorType,
                });
            }

            await updateDoc(reclamacaoRef, {
                comentarios: newComentarios,
            });

            this.setState({
                comentarios: newComentarios,
                novoComentario: "",
                fileToUpload: null,
                uploadedFileName: "",
            });
            console.log("Comentário(s) e/ou arquivo(s) adicionados com sucesso!");

            const recipientEmail = reclamacao.userEmail || userData?.email;
            console.log("E-mail do destinatário:", recipientEmail);

            if (recipientEmail && reclamacao) {
                const resultado = await this.sendEmailWithEmailJS(
                    recipientEmail,
                    messageForEmail,
                    reclamacao.protocolo,
                    userData?.nome || reclamacao.userDataAtTimeOfComplaint?.nome || "Consumidor",
                    fileAttachmentNameForEmail
                );

                if (resultado.success) {
                    this.setState({ emailStatus: "Mensagem e/ou arquivo enviados e e-mail enviado com sucesso!", emailStatusType: "success" });
                } else {
                    this.setState({ emailStatus: `Erro ao enviar e-mail: ${resultado.error}`, emailStatusType: "error" });
                }
                setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
            } else {
                this.setState({ emailStatus: "Erro: E-mail do requerente não disponível para envio.", emailStatusType: "error" });
                setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
            }

        } catch (error) {
            console.error("Erro ao adicionar comentário e/ou arquivo:", error);
            this.setState({ emailStatus: "Erro ao adicionar comentário/arquivo e/ou enviar e-mail.", emailStatusType: "error" });
            setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
        }
    };

    // Função para abrir o modal com o arquivo clicado
    handleFileClick = (file) => {
        this.setState({
            showModal: true,
            modalFile: file,
        });
    };

    // Função para fechar o modal
    handleCloseModal = () => {
        this.setState({
            showModal: false,
            modalFile: null,
        });
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
            return "";
        }
        const data = new Date(dataString);
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = data.getFullYear();
        return `${dia}-${mes}-${ano}`;
    };

    render() {
        const { reclamacao, isLoadingData, situacao, isAuthorized, isLoadingAuth, emailStatus, emailStatusType, uploadedFileName, userData, showModal, modalFile } = this.state;
        const emailStatusClass = emailStatusType === "success" ? "email-status-success" :
            emailStatusType === "error" ? "email-status-error" : "";

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
                        <button onClick={() => this.navigate("/login")} className="go-to-login-button">Ir para Login</button>
                    </div>
                </div>
            );
        }

        if (isLoadingData) {
            return (
                <div className="App-header">
                    <div className="loading-message">
                        <h1>Carregando dados da reclamação...</h1>
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

        const arquivos = reclamacao.arquivos || [];

        return (
            <div className="App-header">
                <MenuAdmin />
                <div className="favoritos agendarConsulta">
                    <div className="infosGeral">
                        <div className="atualizeData">

                            <h3>Atualize o Requerente</h3>
                            {/* Início da Seção de Chat */}
                            <div className="chat-container">
                                {Array.isArray(this.state.comentarios) && this.state.comentarios.map((comentario, index) => (
                                    <div
                                        key={index}
                                        className={`chat-message ${comentario.author === 'admin@cmsga.ce.gov.br'
                                            ? 'admin-message mensage-admin-chat'
                                            : 'user-message'
                                            }`}
                                    >
                                        {(comentario.author) && (
                                            <p className={`chat-message-meta ${comentario.author === 'admin@cmsga.ce.gov.br' ? 'admin-message-meta' : 'user-message-meta'}`}>
                                                {comentario.author && <span>{comentario.author}</span>}
                                            </p>
                                        )}
                                        {comentario.type === 'text' && <p>{comentario.text}</p>}
                                        {comentario.type === 'file' && (
                                            <div>
                                                <p><strong>Arquivo anexado:</strong> <a href={comentario.content} target="_blank" rel="noopener noreferrer">{comentario.fileName}</a></p>
                                            </div>
                                        )}

                                        {(comentario.timestamp) && (
                                            <p className={`chat-message-meta ${comentario.author === 'admin@cmsga.ce.gov.br' ? 'admin-message-meta' : 'user-message-meta'}`}>
                                                {this.formatarDataHoraChat(comentario.timestamp)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Fim da Seção de Chat */}

                            {/* Área de Input do Chat, incluindo o anexo */}
                            <div className="chat-input-area">
                                <div className="chat-input-situacao">
                                    <label htmlFor="situacao">Situação:</label><br />
                                    <select id="situacao" value={situacao} onChange={this.handleSituacaoChange}>
                                        <option value="">{reclamacao.situacao}</option>
                                        <option value="Em Análise">Em Análise</option>
                                        <option value="Em Negociação">Em Negociação</option>
                                        <option value="Finalizada">Finalizada</option>
                                        <option value="Pendente">Pendente</option>
                                    </select><br />
                                    <button className="buttonLogin btnComentario btnSend" onClick={this.salvarAtualizacoes}>Salvar Atualização</button>
                                </div>
                                <div className="chat-input-comentario-textarea">
                                    <textarea
                                        id="novoComentario"
                                        value={this.state.novoComentario || ""}
                                        onChange={(event) => this.setState({ novoComentario: event.target.value })}
                                        placeholder="Escreva uma mensagem ao requerente..."
                                        className="chat-textarea"
                                    /><br />
                                    {emailStatus && <p className={`email-status-message ${emailStatusClass}`}>{emailStatus}</p>}

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

                        {/* Seção de Botões de Arquivos Anexados */}
                        {arquivos && arquivos.length > 0 && (
                            <div className="file-buttons-container">
                                <h3>Arquivos Anexados</h3>
                                <div className="file-buttons-list">
                                    {arquivos.map((file, index) => (
                                        <button
                                            key={index}
                                            onClick={() => this.handleFileClick(file)}
                                            className="file-link-button"
                                        >
                                            {file.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {userData && (
                            <div className="userData">
                                <h2>Dados do requerente</h2>
                                <p><strong>Nome:</strong> {userData.nome}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>CPF:</strong> {userData.cpf}</p>
                                <p><strong>Telefone:</strong> {userData.telefone}</p>
                                <p><strong>CEP:</strong> {userData.cep}</p>
                                <p><strong>Endereço:</strong> {userData.endereco}</p>
                                <p><strong>Número:</strong> {userData.numero}</p>
                                <p><strong>Complemento:</strong> {userData.complemento}</p>
                                <p><strong>Bairro:</strong> {userData.bairro}</p>
                                <p><strong>Cidade:</strong> {userData.municipio || userData.cidade}</p>
                                <p><strong>UF:</strong> {userData.ufEmissor}</p>
                            </div>
                        )}

                        <div className="infoData">
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
                            <p><strong>Situacao</strong> {reclamacao.situacao}</p>
                        </div>
                    </div>
                </div>

                {/* Modal para visualização de arquivos */}
                {showModal && modalFile && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close-button" onClick={this.handleCloseModal}>&times;</button>
                            <h4>{modalFile.name}</h4>
                            <div className="modal-body">
                                {modalFile.type.startsWith('image/') ? (
                                    <img src={modalFile.data} alt={modalFile.name} className="modal-image" />
                                ) : modalFile.type === 'application/pdf' ? (
                                    <iframe src={modalFile.data} title={modalFile.name} className="modal-pdf-iframe" />
                                ) : (
                                    <div className="modal-unsupported">
                                        <p>Tipo de arquivo não suportado para visualização.</p>
                                        <a href={modalFile.data} download={modalFile.name} className="download-link">Baixar {modalFile.name}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReclamacaoDetalhes {...props} navigate={navigate} />;
}

export default WithNavigate;
