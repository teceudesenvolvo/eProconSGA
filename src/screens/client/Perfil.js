import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import MenuDashboard from '../../componets/menuDashboard';

const Perfil = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (typeof localStorage !== 'undefined') {
                    const userId = localStorage.getItem('userId');
                    console.log('UserID do localStorage:', userId);
                    if (userId) {
                        const usersCollection = collection(db, 'users');
                        const q = query(usersCollection, where('uid', '==', userId));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            // Assumindo que há apenas um documento correspondente
                            const userDoc = querySnapshot.docs[0];
                            console.log('Dados do Firestore:', userDoc.data());
                            setUserData(userDoc.data());
                        } else {
                            setError('Dados do usuário não encontrados.');
                        }
                    } else {
                        setError('Usuário não autenticado. Faça login novamente.');
                    }
                } else {
                    setError('LocalStorage não suportado.');
                }
            } catch (err) {
                setError('Erro ao buscar dados do usuário. Tente novamente.');
                console.error('Erro ao buscar dados do usuário:', err);
                console.error('Código do erro:', err.code);
                console.error('Mensagem do erro:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('userId'); // Limpa o userId do localStorage
            window.location.pathname = '/'; // Redireciona para a página inicial
        } else {
            setError('LocalStorage não suportado.');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando dados...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    }

    if (!userData) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Dados do usuário não disponíveis.</div>;
    }

    return (
        <div className="App-header">
            <MenuDashboard />
            <div className="favoritos agendarConsulta profile-desc-ul">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ul className="profile-desc-ul" style={{ listStyle: 'none', padding: 0 }}>
                        <li className="profile-desc">
                            <h2>Dados Pessoais</h2>
                            <p><strong>Nome:</strong> {userData.nome}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Telefone:</strong> {userData.telefone}</p>
                            <p><strong>CPF:</strong> {userData.cpf}</p>
                            <p><strong>Estado Civil:</strong> {userData.estadoCivil}</p>
                            <p><strong>Sexo:</strong> {userData.sexo}</p>

                        </li>
                        <li className="profile-desc">
                            <h2>Endereço</h2>
                            <p><strong>CEP:</strong> {userData.cep}</p>
                            <p><strong>Endereço:</strong> {userData.endereco}</p>
                            <p><strong>Número:</strong> {userData.numero}</p>
                            <p><strong>Complemento:</strong> {userData.complemento}</p>
                            <p><strong>Bairro:</strong> {userData.bairro}</p>
                            <p><strong>Cidade:</strong> {userData.municipio}</p>
                            <p><strong>UF:</strong> {userData.ufEmissor}</p>

                        </li>

                    </ul>
                    <div className="profile-btn-div">
                        {/* <input className="btnProfile btnProfileEdit btnHomeAcess btnCadastroHome buttonLogin" type="button" value="Editar" onClick={() => { }} />
                        <input className="btnProfile btnHomeAcess btnCadastroHome buttonLogin" type="button" value="Salvar" onClick={() => { }} /> */}
                    </div>
                    <p>
                        <a href="/" className="profile-btn-exit btnProfile btnHomeAcess btnCadastroHome buttonLogin" onClick={handleLogout}>Sair da conta</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Perfil;