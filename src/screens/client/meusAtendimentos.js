import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Assumindo que estas são instâncias corretamente inicializadas
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../../componets/LoadingContext'; // Importa useLoading para acessar e controlar o estado de carregamento

import MenuDashboard from '../../componets/menuDashboard';

function MeusAgendamentos() {
    const [reclamacoes, setReclamacoes] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Obtém isLoading e setIsLoading do useLoading para controlar o estado global de carregamento
    const { isLoading, setIsLoading } = useLoading();

    // Use uma ref para armazenar a função de desinscrição do auth listener
    const unsubscribeAuthRef = useRef(null);

    // Envolve fetchReclamacoes com useCallback para estabilidade
    const fetchReclamacoes = useCallback(async (userId, userEmail) => {
        try {
            console.log('fetchReclamacoes: Iniciando busca...');
            if (!db) {
                console.error('Firestore DB não inicializado.');
                setError('Erro: O banco de dados não está inicializado.');
                return;
            }
            if (!userId && !userEmail) {
                console.error('Nenhum identificador de usuário (UID ou Email) disponível.');
                setError('Nenhum identificador de usuário disponível.');
                return;
            }

            const reclamacoesRef = collection(db, 'reclamacoes');
            let reclamacoesData = [];

            if (userEmail) {
                const qByEmail = query(reclamacoesRef, where('userEmail', '==', userEmail));
                const querySnapshotByEmail = await getDocs(qByEmail);
                reclamacoesData = querySnapshotByEmail.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            }

            // Se não encontrou por email e userId está disponível, tenta buscar por userId
            if (reclamacoesData.length === 0 && userId) {
                const qByUserId = query(reclamacoesRef, where('userId', '==', userId));
                const querySnapshotByUserId = await getDocs(qByUserId);
                querySnapshotByUserId.docs.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    // Adiciona apenas se ainda não estiver presente (para evitar duplicatas se ambos userId e email existirem)
                    if (!reclamacoesData.some(item => item.id === data.id)) {
                        reclamacoesData.push(data);
                    }
                });
            }

            setReclamacoes(reclamacoesData);
            console.log('fetchReclamacoes: Busca concluída.');
        } catch (err) {
            console.error('Erro ao buscar reclamações:', err);
            setError('Erro ao buscar reclamações.');
        }
    }, []); // 'db' removido das dependências, pois é uma instância global e estável

    useEffect(() => {
        console.log('useEffect: Iniciando lógica de carregamento de MeusAgendamentos.');
        setIsLoading(true); // Inicia o carregamento global

        if (!auth || !db) {
            console.error('Firebase Auth ou DB não inicializado na montagem do componente. Parando carregamento.');
            setError('Erro: Os serviços de autenticação ou banco de dados não estão inicializados. Verifique a configuração do Firebase.');
            setIsLoading(false); // Para o carregamento
            return;
        }

        // Configura o listener de autenticação
        unsubscribeAuthRef.current = auth.onAuthStateChanged(async (user) => {
            console.log('onAuthStateChanged: Processando estado inicial de autenticação...');
            try {
                if (user) {
                    console.log('onAuthStateChanged: Usuário autenticado:', user.email);
                    if (user.email === 'admin@cmsga.ce.gov.br') {
                        console.log('onAuthStateChanged: Usuário é admin, redirecionando...');
                        navigate('/atendimentos-sga-hyo6d27');
                    } else {
                        console.log('onAuthStateChanged: Buscando reclamações para usuário normal...');
                        await fetchReclamacoes(user.uid, user.email);
                    }
                } else {
                    console.log('onAuthStateChanged: Usuário não autenticado, redirecionando para login...');
                    localStorage.setItem('paginaAnterior', location.pathname);
                    navigate('/login');
                }
            } catch (err) {
                console.error("Erro no onAuthStateChanged:", err);
                setError("Erro ao verificar autenticação.");
            } finally {
                console.log('onAuthStateChanged: Finalizando carregamento.');
                setIsLoading(false); // Garante que o carregamento é parado
            }
        });

        // Função de limpeza para desinscrever o listener quando o componente é desmontado
        return () => {
            if (unsubscribeAuthRef.current) {
                console.log('useEffect cleanup: Desinscrevendo do onAuthStateChanged.');
                unsubscribeAuthRef.current();
            }
        };
    }, [navigate, location, setIsLoading, fetchReclamacoes]); // Adiciona setIsLoading às dependências

    const formatarData = (dataString) => {
        if (!dataString) {
            return '';
        }
        const data = new Date(dataString);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}-${mes}-${ano}`;
    };

    const handleProtocoloClick = (reclamacaoId) => {
        localStorage.setItem('reclamacaoId', reclamacaoId);
        navigate('/reclamacao-detalhes');
    };

    const handleCreateNewCall = () => {
        navigate('/registrar-reclamacao');
    };

    // Renderiza o preloader se isLoading for verdadeiro
    if (isLoading) {
        // O componente Preloader deve ser renderizado em um nível superior (ex: App.js)
        // para cobrir toda a aplicação enquanto carrega.
        // Este bloco aqui é apenas para evitar a renderização do conteúdo da página
        // enquanto isLoading é verdadeiro, se o Preloader global não estiver visível.
        // Se o Preloader global estiver funcionando, este return pode ser simplificado ou removido.
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Carregando...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="App-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="error-message" style={{ textAlign: 'center' }}>
                    <h1>Erro ao carregar dados.</h1>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="buttonLogin">Ir para Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="App-header">
            <MenuDashboard />
            <div className="cards-grid-container">
                <div className="card create-new-card" onClick={handleCreateNewCall}>
                    <div className="card-icon-large">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    </div>
                    <h2 className="card-title">Nova Reclamação</h2>
                    <p className="card-description">Registe uma nova reclamação ou solicitação.</p>
                </div>

                {reclamacoes.length > 0 ? (
                    reclamacoes.map((reclamacao) => (
                        <div key={reclamacao.id} className="card complaint-card" onClick={() => handleProtocoloClick(reclamacao.id)}>
                            <div className="card-header">
                                <h2 className="card-title">Protocolo: {reclamacao.protocolo}</h2>
                                <span className="card-status">{reclamacao.situacao || 'N/A'}</span>
                            </div>
                            <div className="card-body">
                                <p className="card-detail"><strong>Classificação:</strong> {reclamacao.classificacao}</p>
                                <p className="card-detail"><strong>Assunto:</strong> {reclamacao.assuntoDenuncia}</p>
                                <p className="card-detail"><strong>Serviço:</strong> {reclamacao.nomeServico}</p>
                                <p className="card-detail"><strong>Data Contratação:</strong> {formatarData(reclamacao.dataContratacao)}</p>
                                <p className="card-detail"><strong>Valor Compra:</strong> R$ {reclamacao.valorCompra},00</p>
                            </div>
                            <div className="card-footer">
                                <span className="card-footer-text">Clique para ver detalhes e chat</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-reclamations-message">
                        <p>Você ainda não tem reclamações registadas.</p>
                        <p>Clique em "Nova Reclamação" para começar!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeusAgendamentos;
