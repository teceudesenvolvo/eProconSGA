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
            pdfBase64: null,
            novoComentario: "",
            isAuthorized: false,
            emailStatus: "O requerente será informado por email.",
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
                this.setState({
                    reclamacao: reclamacaoSnap.data(),
                    isLoadingData: false,
                    comentarios: reclamacaoSnap.data().comentarios || [],
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

    handleComentariosChange = (event) => {
        this.setState({
            comentarios: [...this.state.comentarios, event.target.value],
        });
    };

    handleSituacaoChange = (event) => {
        this.setState({ situacao: event.target.value });
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                this.setState({ pdfBase64: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    salvarAtualizacoes = async () => {
        try {
            const reclamacaoId = localStorage.getItem("reclamacaoId");
            const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);
            await updateDoc(reclamacaoRef, {
                comentarios: this.state.comentarios,
                situacao: this.state.situacao,
                pdfBase64: this.state.pdfBase64,
            });
            console.log("Atualizações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar atualizações:", error);
        }
    };

    // Função para enviar e-mail usando axios e EmailJS
    async sendEmailWithEmailJS(recipientEmail, message, protocolo, nomeConsumidor) {
        if (!recipientEmail) {
            return { success: false, error: "E-mail do destinatário não informado." };
        }
        if (!message) {
            return { success: false, error: "Mensagem não informada." };
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
                    mensagem: message,
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
        if (this.state.novoComentario) {
            const novoComentario = this.state.novoComentario;
            const reclamacaoId = localStorage.getItem("reclamacaoId");
            const reclamacaoRef = doc(db, "reclamacoes", reclamacaoId);
            try {
                await updateDoc(reclamacaoRef, {
                    comentarios: [...this.state.comentarios, novoComentario],
                });
                this.setState((prevState) => ({
                    comentarios: [...prevState.comentarios, novoComentario],
                    novoComentario: "",
                }));
                console.log("Comentário adicionado com sucesso!");
                // Envia o e-mail após adicionar o comentário
                if (this.state.userData && this.state.userData.email) {
                    const resultado = await this.sendEmailWithEmailJS(
                        this.state.userData.email,
                        novoComentario,
                        this.state.reclamacao.protocolo,
                        this.state.userData.nome
                    );
                    if (resultado.success) {
                        this.setState({ emailStatus: "E-mail enviado com sucesso!", emailStatusType: "success" });
                    } else {
                        this.setState({ emailStatus: `Erro ao enviar e-mail: ${resultado.error}`, emailStatusType: "error" });
                    }
                    setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
                } else {
                    this.setState({ emailStatus: "Erro: E-mail do requerente não disponível para envio.", emailStatusType: "error" });
                    setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
                }
            } catch (error) {
                console.error("Erro ao adicionar comentário:", error);
                this.setState({ emailStatus: "Erro ao adicionar comentário e/ou enviar e-mail.", emailStatusType: "error" });
                setTimeout(() => this.setState({ emailStatus: "", emailStatusType: "" }), 5000);
            }
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
        const { reclamacao, isLoadingData, situacao, isAuthorized, isLoadingAuth, emailStatus, emailStatusType } = this.state;
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
                            <label htmlFor="comentarios">Atualizações:</label><br />
                            {Array.isArray(this.state.comentarios) && (
                                <ol>
                                    {this.state.comentarios.map((comentario, index) => (
                                        <li className="comentarioChat" key={index}>{comentario}</li>
                                    ))}
                                </ol>
                            )}

                            <label htmlFor="comentarios">Enviar Mensagem</label><br />
                            <textarea
                                id="comentarios"
                                value={this.state.novoComentario || ""}
                                onChange={(event) => this.setState({ novoComentario: event.target.value })}
                                placeholder="Escreva uma mensagem ao requerente..."
                            /><br />
                            <button onClick={this.adicionarComentario} className="buttonLogin btnComentario">Enviar</button><br />
                            {emailStatus && <p className={`email-status-message ${emailStatusClass}`}>{emailStatus}</p>}
                        </div>
                        <div className="atualizeData">
                            <label htmlFor="situacao">Situação:</label><br />
                            <select id="situacao" value={situacao} onChange={this.handleSituacaoChange}>
                                <option value="">{reclamacao.situacao}</option>
                                <option value="Em Analise">Em Análise</option>
                                <option value="Em Negociação com a empresa">Em Negociação</option>
                                <option value="Finalizada">Finalizada</option>
                            </select><br />
                            <label htmlFor="situacao">Envie um arquivo</label><br />
                            <input className="buttonLogin btnUpload" type="file" accept="application/pdf" onChange={this.handleFileChange} /><br />
                            <button className="buttonLogin btnComentario btnSend" onClick={this.salvarAtualizacoes}>Salvar Atualizações</button>
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
                            <p><strong>Situação</strong> {reclamacao.situacao}</p>
                        </div>
                    </div>
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