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
            comentarios: [], // Comentários agora podem ser objetos { text: string, type: 'text' | 'file', content: string (base64 if file), fileName?: string }
            situacao: "",
            // pdfBase64: null, // Não precisamos mais disso como estado separado, ele vai para os comentários
            novoComentario: "",
            fileToUpload: null, // Guarda o arquivo selecionado temporariamente
            uploadedFileName: "", // Guarda o nome do arquivo para exibição
            isAuthorized: false,
            emailStatus: "O usuário será notificado por email.", // Removido texto inicial para ser mais dinâmico
            emailStatusType: "",
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
                // Ao carregar, verifique se os comentários são strings antigas ou objetos novos
                const comentariosData = reclamacaoSnap.data().comentarios || [];
                const formattedComentarios = comentariosData.map(comentario => {
                    if (typeof comentario === 'string') {
                        return { text: comentario, type: 'text' };
                    }
                    return comentario; // Já é um objeto, use como está
                });

                this.setState({
                    reclamacao: reclamacaoSnap.data(),
                    isLoadingData: false,
                    comentarios: formattedComentarios,
                    situacao: reclamacaoSnap.data().situacao || "EM ANALISE",
                }, () => {
                    this.fetchUserData();
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

    async fetchUserData() {
        this.setState({ error: null });
        try {
            const userId = this.state.reclamacao.userId;
            if (userId) {
                const usersCollection = collection(db, "users");
                const q = query(usersCollection, where("uid", "==", userId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    this.setState({ userData: userDoc.data() });
                } else {
                    this.setState({ error: "Dados do usuário não encontrados." });
                }
            } else {
                this.setState({ error: "userId não encontrado na reclamação." });
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
            // Guardar o arquivo completo e o nome para exibir
            this.setState({ fileToUpload: file, uploadedFileName: file.name });
        } else {
            this.setState({ fileToUpload: null, uploadedFileName: "" });
        }
    };

    salvarAtualizacoes = async () => {
        try {
            const reclamacaoId = localStorage.getItem("reclamacaoId");
            const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);
            // Salva apenas a situação, os comentários e arquivos são tratados em adicionarComentario
            await updateDoc(reclamacaoRef, {
                situacao: this.state.situacao,
                // Não precisa mais de pdfBase64 aqui, pois ele vai dentro dos comentários agora
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

    // Função para enviar e-mail usando axios e EmailJS
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
                    mensagem: emailMessage, // Passa a mensagem que pode incluir o nome do arquivo
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
        let messageForEmail = novoComentario;
        let fileAttachmentNameForEmail = null;

        try {
            // Lidar com o arquivo primeiro, se houver
            if (fileToUpload) {
                const reader = new FileReader();
                reader.readAsDataURL(fileToUpload);
                await new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        const base64Content = e.target.result;
                        newComentarios.push({
                            text: `Arquivo anexado: ${fileToUpload.name}`,
                            type: 'file',
                            content: base64Content, // Salva o base64 no Firebase
                            fileName: fileToUpload.name,
                        });
                        fileAttachmentNameForEmail = fileToUpload.name;
                        resolve();
                    };
                    reader.onerror = error => reject(error);
                });
            }

            // Adicionar o comentário de texto, se houver
            if (novoComentario) {
                newComentarios.push({
                    text: novoComentario,
                    type: 'text',
                });
            }

            // Atualizar no Firebase
            await updateDoc(reclamacaoRef, {
                comentarios: newComentarios,
            });

            // Atualizar o estado local
            this.setState({
                comentarios: newComentarios,
                novoComentario: "",
                fileToUpload: null,
                uploadedFileName: "",
            });
            console.log("Comentário(s) e/ou arquivo(s) adicionados com sucesso!");

            // Enviar e-mail, se o usuário e a reclamação existirem
            if (userData && userData.email && reclamacao) {
                const resultado = await this.sendEmailWithEmailJS(
                    userData.email,
                    messageForEmail, // Mensagem de texto
                    reclamacao.protocolo,
                    userData.nome,
                    fileAttachmentNameForEmail // Nome do arquivo para menção no e-mail
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
        const { reclamacao, isLoadingData, situacao, isAuthorized, isLoadingAuth, emailStatus, emailStatusType, uploadedFileName } = this.state;
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
                                    <div key={index} className="chat-message admin-message">
                                        {comentario.type === 'text' && <p>{comentario.text}</p>}
                                        {comentario.type === 'file' && (
                                            <div>
                                                <p><strong>Arquivo anexado:</strong> <a href={comentario.content} target="_blank" rel="noopener noreferrer">{comentario.fileName}</a></p>
                                                {/* Opcional: Miniatura ou ícone para PDF */}
                                            </div>
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
                                        <option value="Em Analise">Em Análise</option>
                                        <option value="Em Negociação com a empresa">Em Negociação</option>
                                        <option value="Finalizada">Finalizada</option>
                                        <option value="Pendente">Pendente</option>
                                    </select><br />
                                    <button className="buttonLogin btnComentario btnSend" onClick={this.salvarAtualizacoes}>Salvar Atualização</button>
                                </div>
                                <div className="chat-input-comentario-textarea">
                                    {/* <label htmlFor="novoComentario" className="chat-input-label">Enviar Mensagem</label><br /> */}
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
                                        className="btnUploadFileChat" // Removida a estilização inline, use CSS
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



                        {this.state.userData && (
                            <div className="userData">
                                <h2>Dados do requerente</h2>
                                <p><strong>Nome:</strong> {this.state.userData.nome}</p>
                                <p><strong>Email:</strong> {this.state.userData.email}</p>
                                <p><strong>CPF:</strong> {this.state.userData.cpf}</p>
                                <p><strong>Telefone:</strong> {this.state.userData.telefone}</p>
                                <p><strong>CEP:</strong> {this.state.userData.cep}</p>
                                <p><strong>Endereço:</strong> {this.state.userData.endereco}</p>
                                <p><strong>Número:</strong> {this.state.userData.numero}</p>
                                <p><strong>Complemento:</strong> {this.state.userData.complemento}</p>
                                <p><strong>Bairro:</strong> {this.state.userData.bairro}</p>
                                <p><strong>Cidade:</strong> {this.state.userData.cidade}</p>
                                <p><strong>UF:</strong> {this.state.userData.ufEmissor}</p>
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
                            <p><strong>Data Ocorrência:</strong> {this.formatarData(reclamacao.dataOcorrência)}</p>
                            <p><strong>Data Negativa:</strong> {this.formatarData(reclamacao.dataNegativa)}</p>
                            <p><strong>Forma Pagamento:</strong> {reclamacao.formaPagamento}</p>
                            <p><strong>Valor Compra:</strong> {reclamacao.valorCompra}</p>
                            <p><strong>Detalhes Reclamacao:</strong> {reclamacao.detalhesReclamacao}</p>
                            <p><strong>Pedido Consumidor:</strong> {reclamacao.pedidoConsumidor}</p>
                            <p><strong>Situacao</strong> {reclamacao.situacao}</p>
                        </div>
                    </div>
                    {/* O iframe agora exibe o PDF se ele estiver no estado (vindo do Firebase, se for um arquivo antigo) */}
                    {/* Para exibir PDFs enviados via chat, você precisará iterar sobre os comentários do tipo 'file' */}
                    {/* Ou, se a lógica for exibir o último PDF anexado, pode ajustar isso. */}
                    {/* Por enquanto, ele apenas mostra o que for atribuído diretamente a this.state.pdfBase64 */}
                    {this.state.pdfBase64 && (
                        <iframe src={this.state.pdfBase64} width="100%" height="500px" title="Visualização do PDF" />
                    )}
                </div>
            </div>
        );
    }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReclamacaoDetalhes {...props} navigate={navigate} />;
}

export default WithNavigate;