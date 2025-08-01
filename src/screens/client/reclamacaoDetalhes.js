import React, { Component } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Componente
import MenuDashboard from '../../componets/menuDashboard'

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
            situacao: '',
            novoAnexo: null,
            anexoError: null, // Novo estado para exibir erro de tamanho do arquivo
        };
    }

    componentDidMount() {
        this.fetchReclamacao();
    }

    async fetchReclamacao() {
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
                this.setState({
                    reclamacao: reclamacaoSnap.data(),
                    loading: false,
                    comentarios: reclamacaoSnap.data().comentarios || [],
                    situacao: reclamacaoSnap.data().situacao || 'EM ANALISE',
                }, () => {
                    this.fetchUserData(reclamacaoSnap.data().userId);
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

    handleSituacaoChange = (event) => {
        this.setState({ situacao: event.target.value });
    };

    handleAnexoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                this.setState({ anexoError: `O arquivo é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE / (1024 * 1024)}MB.` });
                // Limpa o input de arquivo para o usuário selecionar outro
                event.target.value = null;
                this.setState({ novoAnexo: null });
                return;
            }
            this.setState({ novoAnexo: file, anexoError: null });
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
                comentarios: this.state.comentarios,
                situacao: this.state.situacao,
            });

            console.log('Atualizações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar atualizações:', error);
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
        const { reclamacao, loading, comentarios, userData, anexoError } = this.state;

        if (loading) {
            return <div>Carregando...</div>;
        }

        if (!reclamacao) {
            return <div>Reclamação não encontrada.</div>;
        }

        return (
            <div className="App-header">
                <MenuDashboard />
                <div className="favoritos agendarConsulta">
                    <div className='infosGeral'>
                        <div className='atualizeData'>
                            <h3>Atualizações sobre a reclamação</h3>
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
                            <p><strong>Detalhes Reclamação:</strong> {reclamacao.detalhesReclamacao}</p>
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





