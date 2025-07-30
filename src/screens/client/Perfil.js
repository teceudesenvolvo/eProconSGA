import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import MenuDashboard from '../../componets/menuDashboard';
import { useNavigate } from 'react-router-dom';
import MenuAdmin from '../../componets/menuAdmin';

const Perfil = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [userFirestoreDocId, setUserFirestoreDocId] = useState(null); // NOVO ESTADO: Para o ID do documento no Firestore
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            setLoading(true);
            setError(null);

            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user && user.email) {
                    if (user.email === 'admin@cmsga.ce.gov.br') {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }

                    try {
                        // O userId do localStorage é o UID do Firebase Auth
                        const authUid = localStorage.getItem('userId');
                        if (authUid) {
                            const usersCollection = collection(db, 'users');
                            // Busca o documento no Firestore onde o campo 'uid' é igual ao authUid
                            const q = query(usersCollection, where('uid', '==', authUid));
                            const querySnapshot = await getDocs(q);

                            if (!querySnapshot.empty) {
                                const userDoc = querySnapshot.docs[0];
                                const data = userDoc.data();
                                setUserData(data);
                                setEditedData(data);
                                setUserFirestoreDocId(userDoc.id); // SALVA O ID DO DOCUMENTO DO FIRESTORE
                            } else {
                                setError('Dados do usuário não encontrados no Firestore para este UID.');
                            }
                        } else {
                            setError('Usuário não autenticado. Faça login novamente.');
                            navigate('/login');
                        }
                    } catch (err) {
                        setError('Erro ao buscar dados do usuário. Tente novamente.');
                        console.error('Erro ao buscar dados do usuário:', err);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setIsAdmin(false);
                    setLoading(false);
                    setError('Usuário não autenticado. Faça login novamente.');
                    navigate('/login');
                }
            });

            return () => unsubscribe();
        };

        checkAuthAndFetchUserData();
    }, [navigate]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditedData(userData);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // USA O ID DO DOCUMENTO DO FIRESTORE SALVO NO ESTADO
            if (!userFirestoreDocId) {
                setError('ID do documento do usuário não disponível para salvar.');
                setLoading(false);
                return;
            }

            const userDocRef = doc(db, 'users', userFirestoreDocId); // Usa userFirestoreDocId aqui
            const { email, ...dataToUpdate } = editedData; // Garante que o email não seja alterado

            await updateDoc(userDocRef, dataToUpdate);
            setUserData(editedData); // Atualiza os dados exibidos
            setIsEditing(false); // Sai do modo de edição
            setLoading(false);
            alert('Perfil atualizado com sucesso!');
        } catch (err) {
            setError('Erro ao salvar perfil. Tente novamente.');
            console.error('Erro ao salvar perfil:', err);
            setLoading(false);
            alert('Erro ao salvar perfil.');
        }
    };

    const handleLogout = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('userId');
            navigate('/');
        } else {
            setError('LocalStorage não suportado.');
        }
    };

    if (loading) {
        return <div className="loading-message"><h1>Carregando dados...</h1><p>Por favor, aguarde.</p></div>;
    }

    if (error) {
        return <div className="error-message"><h1>Erro:</h1><p>{error}</p></div>;
    }

    if (!userData) {
        return <div className="not-found-message"><h1>Dados do usuário não disponíveis.</h1><p>Não foi possível carregar seu perfil.</p></div>;
    }

    return (
        <div className="App-header">
            {isAdmin ? <MenuAdmin /> : <MenuDashboard />}
            <div className="profile-container">
                {/* Cabeçalho do Perfil */}
                <div className="profile-header-card">
                    <div className="profile-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div className="profile-info-main">
                        <h1 className="profile-name">{userData.nome || 'Nome não informado'}</h1>
                        <p className="profile-email">{userData.email}</p>
                    </div>
                    <button className="edit-profile-button" onClick={handleEditToggle}>
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                </div>

                {/* Cards de Dados Pessoais e Endereço */}
                <div className="profile-cards-grid">
                    {/* Card de Dados Pessoais */}
                    <div className="profile-card">
                        <h2 className="card-section-title">Dados Pessoais</h2>
                        {isEditing ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="nome">Nome:</label>
                                    <input type="text" id="nome" name="nome" value={editedData.nome || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefone">Telefone:</label>
                                    <input type="text" id="telefone" name="telefone" value={editedData.telefone || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cpf">CPF:</label>
                                    <input type="text" id="cpf" name="cpf" value={editedData.cpf || ''} onChange={handleInputChange} className="profile-input" disabled /> {/* CPF não editável */}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="estadoCivil">Estado Civil:</label>
                                    <select id="estadoCivil" name="estadoCivil" value={editedData.estadoCivil || ''} onChange={handleInputChange} className="profile-input" >
                                        <option value="">Selecione o Estado Civil</option>
                                        <option value="solteiro">Solteiro</option>
                                        <option value="casado">Casado</option>
                                        <option value="divorciado">Divorciado</option>
                                        <option value="viuvo">Viúvo</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sexo">Sexo:</label>
                                    <select name="sexo" id="sexo" value={editedData.sexo || ''} onChange={handleInputChange} className="profile-input">
                                        <option value="">Selecione o sexo</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outros">Outros</option>
                                    </select>




                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>Nome:</strong> {userData.nome}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>Telefone:</strong> {userData.telefone}</p>
                                <p><strong>CPF:</strong> {userData.cpf}</p>
                                <p><strong>Estado Civil:</strong> {userData.estadoCivil}</p>
                                <p><strong>Sexo:</strong> {userData.sexo}</p>
                            </>
                        )}
                    </div>

                    {/* Card de Endereço */}
                    <div className="profile-card">
                        <h2 className="card-section-title">Endereço</h2>
                        {isEditing ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cep">CEP:</label>
                                    <input type="text" id="cep" name="cep" value={editedData.cep || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endereco">Endereço:</label>
                                    <input type="text" id="endereco" name="endereco" value={editedData.endereco || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numero">Número:</label>
                                    <input type="text" id="numero" name="numero" value={editedData.numero || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="complemento">Complemento:</label>
                                    <input type="text" id="complemento" name="complemento" value={editedData.complemento || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bairro">Bairro:</label>
                                    <input type="text" id="bairro" name="bairro" value={editedData.bairro || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="municipio">Cidade:</label>
                                    <input type="text" id="municipio" name="municipio" value={editedData.municipio || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ufEmissor">UF:</label>
                                    <input type="text" id="ufEmissor" name="ufEmissor" value={editedData.ufEmissor || ''} onChange={handleInputChange} className="profile-input" />
                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>CEP:</strong> {userData.cep}</p>
                                <p><strong>Endereço:</strong> {userData.endereco}</p>
                                <p><strong>Número:</strong> {userData.numero}</p>
                                <p><strong>Complemento:</strong> {userData.complemento}</p>
                                <p><strong>Bairro:</strong> {userData.bairro}</p>
                                <p><strong>Cidade:</strong> {userData.municipio}</p>
                                <p><strong>UF:</strong> {userData.ufEmissor}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="profile-actions-container">
                    {isEditing && (
                        <button className="save-profile-button" onClick={handleSaveProfile}>Salvar Alterações</button>
                    )}
                    <button className="logout-button" onClick={handleLogout}>Sair da conta</button>
                </div>
            </div>
        </div>
    );
};

export default Perfil;