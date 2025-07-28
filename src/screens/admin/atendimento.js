import React, { Component } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Importe 'auth'
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

// Componente
import MenuAdmin from '../../componets/menuAdmin'

class ReclamacaoDetalhes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reclamacao: null,
            userData: null,
            isLoadingData: true, // Renomeado de 'loading' para ser mais específico sobre o carregamento de dados
            isLoadingAuth: true, // NOVO ESTADO: Para indicar se a verificação de autenticação está em andamento
            error: null,
            comentarios: [],
            situacao: '',
            pdfBase64: null,
            novoComentario: '',
            isAuthorized: false, // Novo estado para controlar a autorização
        };
        this.navigate = props.navigate; // Recebe navigate via props
    }

    componentDidMount() {
        // Verifica o estado de autenticação do usuário
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Verifica se o usuário existe e se o email existe
            if (user && user.email) {
                // Se o usuário existe e o email é o admin
                if (user.email === 'admin@cmsga.ce.gov.br') {
                    this.setState({ isAuthorized: true, isLoadingAuth: false });
                    this.fetchReclamacao(); // Busca a reclamação apenas se autorizado
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

    async fetchReclamacao() {
        this.setState({ isLoadingData: true }); // Inicia o carregamento dos dados
        try {
            const reclamacaoId = localStorage.getItem('reclamacaoId');

            if (!reclamacaoId) {
                console.error('ID da reclamação não encontrado no localStorage.');
                this.setState({ isLoadingData: false });
                return;
            }

            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);
            const reclamacaoSnap = await getDoc(reclamacaoRef);

            if (reclamacaoSnap.exists()) {
                this.setState({
                    reclamacao: reclamacaoSnap.data(),
                    isLoadingData: false,
                    comentarios: reclamacaoSnap.data().comentarios || [],
                    situacao: reclamacaoSnap.data().situacao || 'EM ANALISE',
                }, () => {
                    this.fetchUserData(); // Chama fetchUsuario após carregar a reclamação
                });
            } else {
                console.error('Reclamação não encontrada.');
                this.setState({ isLoadingData: false });
            }
        } catch (error) {
            console.error('Erro ao buscar reclamação:', error);
            this.setState({ isLoadingData: false });
        }
    }

    async fetchUserData() {
        // Este método não precisa gerenciar o isLoadingData, pois fetchReclamacao já o faz.
        // Ele apenas lida com o estado de erro específico para os dados do usuário, se houver.
        this.setState({ error: null });

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
        }
        // Não há 'finally' aqui para isLoadingData, pois fetchReclamacao já o gerencia.
    }

    handleComentariosChange = (event) => {
        this.setState({
            comentarios: [...this.state.comentarios, event.target.value]
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
            const reclamacaoId = localStorage.getItem('reclamacaoId');
            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);

            await updateDoc(reclamacaoRef, {
                comentarios: this.state.comentarios,
                situacao: this.state.situacao,
                pdfBase64: this.state.pdfBase64,
            });

            console.log('Atualizações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar atualizações:', error);
        }
    };

    adicionarComentario = async () => {
        if (this.state.novoComentario) {
            const novoComentario = this.state.novoComentario;
            const reclamacaoId = localStorage.getItem('reclamacaoId');
            const reclamacaoRef = doc(db, 'reclamacoes', reclamacaoId);

            try {
                await updateDoc(reclamacaoRef, {
                    comentarios: [...this.state.comentarios, novoComentario],
                });

                this.setState(prevState => ({
                    comentarios: [...prevState.comentarios, novoComentario],
                    novoComentario: '',
                }));

                console.log('Comentário adicionado com sucesso!');
            } catch (error) {
                console.error('Erro ao adicionar comentário:', error);
            }
        }
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

    render() {
        const { reclamacao, isLoadingData, situacao, isAuthorized, isLoadingAuth } = this.state;

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
                        <h1>Carregando dados da reclamação...</h1>
                        <p>Por favor, aguarde.</p>
                    </div>
                </div>
            );
        }

        // 4. Se os dados não estão carregando e a reclamação não foi encontrada (após autorizado e carregamento concluído)
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
                    <div className='infosGeral'>
                        <div className='atualizeData'>
                            <h3>Atualize o Requerente</h3>
                            <label htmlFor="comentarios">Atualizações:</label><br/>
                            {Array.isArray(this.state.comentarios) && (
                                <ol>
                                    {this.state.comentarios.map((comentario, index) => (
                                        <li className='comentarioChat' key={index}>{comentario}</li>
                                    ))}
                                </ol>
                            )}

                            <label htmlFor="comentarios">Enviar Mensagem</label><br/>
                            <textarea
                                id="comentarios"
                                value={this.state.novoComentario || ''}
                                onChange={(event) => this.setState({ novoComentario: event.target.value })}
                                placeholder='Escreva uma mensagem ao requerente...'
                            /><br/>
                            <button onClick={this.adicionarComentario} className='buttonLogin btnComentario'>Enviar</button><br/>
                            </div>
                            <div className='atualizeData'>
                            <label htmlFor="situacao">Situação:</label><br/>
                            <select id="situacao" value={situacao} onChange={this.handleSituacaoChange}>
                                <option value="">{reclamacao.situacao}</option>
                                <option value="Em Analise">Em Análise</option>
                                <option value="Em Negociação com a empresa">Em Negociação</option>
                                <option value="Finalizada">Finalizada</option>
                            </select><br/>
                            <label  htmlFor="situacao">Envie um arquivo</label><br/>
                            <input className='buttonLogin btnUpload' type="file" accept="application/pdf" onChange={this.handleFileChange} /><br/>
                        <button className='buttonLogin btnComentario btnSend' onClick={this.salvarAtualizacoes}>Salvar Atualizações</button>
                        </div>

                        {this.state.userData && (
                            <div className='userData'>
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

// Wrapper para injetar o hook useNavigate
function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReclamacaoDetalhes {...props} navigate={navigate} />
}

export default WithNavigate;
