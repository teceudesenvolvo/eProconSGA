import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Componentes 
import MenuAdmin from '../../componets/menuAdmin'; 

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJ4vo0OSw5Ewx9PITOzeuLcMqSXItIKg4",
  authDomain: "procon-cmsga.firebaseapp.com",
  projectId: "procon-cmsga",
  storageBucket: "procon-cmsga.firebasestorage.app",
  messagingSenderId: "1039808313384",
  appId: "1:1039808313384:web:f6cd1b997361ca2515dd1d",
  measurementId: "G-7H275ND9YK"
};

// Variável para simular o token de autenticação, já que o ambiente
// não injeta mais essa variável.
const initialAuthToken = null;

// Usamos o projectId da sua configuração como o appId para os caminhos do Firestore.
const appId = firebaseConfig.projectId;

// Função auxiliar para gerar dados de exemplo se a coleção estiver vazia
const generateMockData = async (db, collectionName, userId) => {
  const collectionRef = collection(db, collectionName);
  
  if (collectionName.includes('reclamacoes')) {
    const statuses = ['Em Analise', 'Em Negociação', 'Pendente', 'Finalizada'];
    for (let i = 0; i < 50; i++) {
      const dateOffset = Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000;
      await setDoc(doc(collectionRef), {
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - dateOffset),
        userId: userId,
      });
    }
  } else if (collectionName.includes('usuarios')) {
    for (let i = 0; i < 100; i++) {
      const dateOffset = Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000;
      await setDoc(doc(collectionRef), {
        email: `user_${Math.floor(Math.random() * 10000)}@example.com`,
        createdAt: new Date(Date.now() - dateOffset),
        userId: userId,
      });
    }
  }
};

function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  console.log(auth)
  const [userId, setUserId] = useState(null);
  const [reclamacoes, setReclamacoes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuariosTab, setUsuariosTab] = useState('diario');
  const [mainTab, setMainTab] = useState('reclamacoes');
  // Novo estado para o filtro de status das reclamações
  const [selectedStatus, setSelectedStatus] = useState('Todas');

  // Processamento de dados para o gráfico de Reclamações com filtro
  const getReclamacoesChartData = useCallback(() => {
    const allPossibleStatuses = ['Em Analise', 'Pendente', 'Finalizada', 'Em Negociação'];
    
    // Inicializa a contagem de todos os status como zero
    const statusCounts = {};
    allPossibleStatuses.forEach(status => statusCounts[status] = 0);

    // Se 'Todas' for selecionado, conta todas as reclamações por status
    if (selectedStatus === 'Todas') {
      reclamacoes.forEach(r => {
        const status = r.status || 'Sem Status';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
    } else {
      // Se um status específico for selecionado, conta apenas esse status e mantém os outros zerados
      reclamacoes.forEach(r => {
        if (r.status === selectedStatus) {
          statusCounts[selectedStatus]++;
        }
      });
    }

    // Formata os dados para o gráfico
    return Object.keys(statusCounts).map(status => ({
      name: status,
      count: statusCounts[status]
    }));
  }, [reclamacoes, selectedStatus]);

  // Processamento de dados para os gráficos de Usuários
  const processUsersData = useCallback(() => {
    const dailyCounts = {};
    const monthlyCounts = {};
    const yearlyCounts = {};

    users.forEach(user => {
      if (user.createdAt && user.createdAt.toDate) {
        const date = user.createdAt.toDate();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const dailyKey = `${year}-${month}-${day}`;
        dailyCounts[dailyKey] = (dailyCounts[dailyKey] || 0) + 1;

        const monthlyKey = `${year}-${month}`;
        monthlyCounts[monthlyKey] = (monthlyCounts[monthlyKey] || 0) + 1;

        const yearlyKey = `${year}`;
        yearlyCounts[yearlyKey] = (yearlyCounts[yearlyKey] || 0) + 1;
      }
    });

    const dailyData = Object.keys(dailyCounts).map(key => ({ date: key, count: dailyCounts[key] })).sort((a,b) => new Date(a.date) - new Date(b.date));
    const monthlyData = Object.keys(monthlyCounts).map(key => ({ date: key, count: monthlyCounts[key] })).sort((a,b) => new Date(a.date) - new Date(b.date));
    const yearlyData = Object.keys(yearlyCounts).map(key => ({ date: key, count: yearlyCounts[key] })).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    return { dailyData, monthlyData, yearlyData };
  }, [users]);
  
  // Inicializa o Firebase e a autenticação
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(firestore);
      setAuth(authInstance);

      // Listener para o estado de autenticação.
      const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          if (!initialAuthToken) {
            try {
              await signInAnonymously(authInstance);
            } catch (error) {
              console.error("Erro ao fazer login anônimo:", error);
            }
          }
        }
        setLoading(false);
      });

      if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken).catch((error) => {
          console.error("Erro na autenticação com token:", error);
        });
      }

      return () => unsubscribeAuth();
      
    } catch (e) {
      console.error("Erro ao inicializar Firebase:", e);
      setLoading(false);
    }
  }, []);

  // Busca de dados em tempo real para 'reclamacoes'
  useEffect(() => {
    if (!db || !userId) return;

    const reclamacoesColRef = collection(db, `artifacts/${appId}/users/${userId}/reclamacoes`);
    const unsubscribe = onSnapshot(reclamacoesColRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReclamacoes(data);
      if (snapshot.empty) {
        console.log("Nenhuma reclamação encontrada. Gerando dados de exemplo...");
        generateMockData(db, `artifacts/${appId}/users/${userId}/reclamacoes`, userId);
      }
    }, (error) => {
      console.error("Erro ao buscar reclamações:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  // Busca de dados em tempo real para 'usuarios'
  useEffect(() => {
    if (!db || !userId) return;

    const usersColRef = collection(db, `artifacts/${appId}/users/${userId}/usuarios`);
    const unsubscribe = onSnapshot(usersColRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      if (snapshot.empty) {
        console.log("Nenhum usuário encontrado. Gerando dados de exemplo...");
        generateMockData(db, `artifacts/${appId}/users/${userId}/usuarios`, userId);
      }
    }, (error) => {
      console.error("Erro ao buscar usuários:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);
  
  const { dailyData, monthlyData, yearlyData } = processUsersData();
  const reclamacoesChartData = getReclamacoesChartData();
  const usersChartData = {
    'diario': dailyData,
    'mensal': monthlyData,
    'anual': yearlyData,
  }[usuariosTab];

  // Lista de status para os botões de filtro
  const statusFilters = ['Todas', 'Em Analise', 'Pendente', 'Finalizada', 'Em Negociação'];
  
  if (loading || !userId) {
    return (
      <div className="loading-container">
        <div className="loading-text">A iniciar o dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <MenuAdmin/>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="space-y-1">
            <h1 className="header-title">Atividades</h1>
            <p className="header-subtitle">Visão geral das reclamações e do crescimento de usuários.</p>
          </div>
        </header>

        {/* Tabs principais */}
        <div className="main-tabs-container">
          <div className="main-tabs-header">
            <button
              onClick={() => setMainTab('reclamacoes')}
              className={`main-tab-button ${mainTab === 'reclamacoes' ? 'active' : ''}`}
            >
              Reclamações
            </button>
            <button
              onClick={() => setMainTab('usuarios')}
              className={`main-tab-button ${mainTab === 'usuarios' ? 'active' : ''}`}
            >
              Usuários
            </button>
          </div>
          
          <div className="tab-content">
            {mainTab === 'reclamacoes' && (
              <>
                {/* Botões de filtro de status */}
                <div className="sub-tabs-container">
                  {statusFilters.map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`sub-tab-button ${selectedStatus === status ? 'active' : ''}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Conteúdo do gráfico de Reclamações */}
                <div className="chart-card">
                  <h2 className="chart-title">
                    Reclamações por Status ({selectedStatus})
                  </h2>
                  <p className="chart-subtitle">
                    Visualização do total de reclamações por status.
                  </p>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reclamacoesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#006aff" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {mainTab === 'usuarios' && (
              <>
                {/* Sub-abas de Usuários */}
                <div className="sub-tabs-container">
                  {['diario', 'mensal', 'anual'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setUsuariosTab(tab)}
                      className={`sub-tab-button ${usuariosTab === tab ? 'active' : ''}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Conteúdo do gráfico de Usuários */}
                <div className="chart-card">
                  <h2 className="chart-title">
                    Crescimento de Usuários ({usuariosTab.charAt(0).toUpperCase() + usuariosTab.slice(1)})
                  </h2>
                  <p className="chart-subtitle">
                    Visualização do crescimento de novos usuários por período.
                  </p>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usersChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#006aff" strokeWidth={2} dot={{ fill: '#006aff', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
