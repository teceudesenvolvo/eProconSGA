import React, { Component } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Componente
import MenuDashboard from '../../componets/menuDashboard'

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
            pdfBase64: null,
            novoComentario: '', // Adiciona o estado para o novo comentário
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
                    comentarios: reclamacaoSnap.data().comentarios || [], // Garante que é um array
                    situacao: reclamacaoSnap.data().situacao || 'EM ANALISE',
                }, () => {
                    this.fetchUserData(); // Chama fetchUsuario após carregar a reclamação
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
                pdfBase64: this.state.pdfBase64, // Adiciona o Base64 do PDF ao documento
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
                // Atualiza o array de comentários no Firestore
                await updateDoc(reclamacaoRef, {
                    comentarios: [...this.state.comentarios, novoComentario],
                });

                // Atualiza o estado local
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
        const { reclamacao, loading } = this.state;

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
                            <label htmlFor="comentarios">Atualizações:</label><br/>
                            {Array.isArray(this.state.comentarios) && ( // Verifica se é um array
                                <ol>
                                    {this.state.comentarios.map((comentario, index) => (
                                        <li className='comentarioChat' key={index}>{comentario}</li>
                                    ))}
                                </ol>
                            )}

                            {/* <label htmlFor="comentarios">Enviar Mensagem</label><br/>
                            <textarea
                                id="comentarios"
                                value={this.state.novoComentario || ''} // Usar um estado temporário para o novo comentário
                                onChange={(event) => this.setState({ novoComentario: event.target.value })}
                                placeholder='Escreva uma mensagem ao requerente...'
                            /><br/>
                            <button onClick={this.adicionarComentario} className='buttonLogin btnComentario'>Enviar</button><br/> */}
                            </div>
                            <div className='atualizeData'>
                            <label  htmlFor="situacao">Envie um arquivo</label><br/>
                            <input className='buttonLogin btnUpload' type="file" accept="application/pdf" onChange={this.handleFileChange} /><br/>
                        <button className='buttonLogin btnComentario btnSend' onClick={this.salvarAtualizacoes}>Enviar Anexo</button>
                        </div>

                        {this.state.userData && (
                            <div className='userData'>
                                <h2>Dados do Fornecedor</h2>
                                <p><strong>Nome:</strong> {this.state.userData.nome}</p>
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
                            <p><strong>Situação</strong> {reclamacao.situacao}</p>
                        </div>



                    </div>

                    {/* {this.state.pdfBase64 && (
                        <iframe src={this.state.pdfBase64} width="100%" height="500px" title="Visualização do PDF" />
                    )} */}

                </div>
            </div>
        );
    }
}

export default ReclamacaoDetalhes;