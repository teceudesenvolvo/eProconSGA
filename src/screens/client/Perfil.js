import React, { useState, useEffect } from 'react';
import {
    signInWithCustomToken,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    signOut
} from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Importa os componentes de menu (assumindo que estão corretos)
import MenuAdmin from '../../componets/menuAdmin';
import MenuDashboard from '../../componets/menuDashboard';

// Importa as instâncias de auth e db do seu arquivo de configuração do Firebase
import { auth, db } from '../../firebase';

// Importar apenas o hook useLoading do caminho correto
import { useLoading } from '../../componets/LoadingContext';

const Perfil = () => {
    // Estados do componente
    const [userData, setUserData] = useState(null);
    // Usa o hook useLoading para acessar e controlar o estado de carregamento
    const { isLoading, setIsLoading } = useLoading();
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [userFirestoreDocId, setUserFirestoreDocId] = useState(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    // Efeito para autenticar e carregar os dados do utilizador
    useEffect(() => {
        setIsLoading(true); // Inicia o estado de carregamento
        // eslint-disable-next-line no-undef
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        let isCancelled = false;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (isCancelled) return;

            // Se o token personalizado estiver disponível, tenta usá-lo para autenticar
            // Esta lógica só deve ser executada se não houver um usuário já autenticado
            if (initialAuthToken && !user) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                    // O onAuthStateChanged será chamado novamente com o usuário autenticado
                } catch (err) {
                    console.error("Falha na autenticação com token personalizado:", err.code, err.message);
                    if (!isCancelled) {
                        setError(`Erro de autenticação: ${err.message}. Verifique o token ou a configuração do Firebase.`);
                        setIsLoading(false); // Para o carregamento em caso de erro
                    }
                }
                return; // Aguarda a próxima chamada do onAuthStateChanged com o utilizador logado
            }

            if (user && user.email) {
                setIsAdmin(user.email === 'admin@cmsga.ce.gov.br');

                try {
                    const authUid = user.uid;
                    const usersCollection = collection(db, 'users');
                    const q = query(usersCollection, where('uid', '==', authUid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const data = userDoc.data();
                        setUserData(data);
                        setEditedData(data);
                        setUserFirestoreDocId(userDoc.id);
                    } else {
                        setError('Dados do utilizador não encontrados no Firestore.');
                    }
                } catch (err) {
                    setError('Erro ao buscar dados do utilizador. Tente novamente.');
                    console.error('Erro ao buscar dados do utilizador:', err);
                } finally {
                    setIsLoading(false); // Para o carregamento após a busca de dados
                }
            } else {
                if (!isCancelled) {
                    setIsAdmin(false);
                    setIsLoading(false); // Para o carregamento se não houver utilizador
                    // Redireciona para login apenas se não houver erro pré-existente
                    // A linha abaixo usa 'error' e é a razão da advertência do ESLint.
                    // Desativamos a regra para evitar o loop.
                    if (!error) {
                        setError('Utilizador não autenticado. Faça login novamente.');
                        navigate('/login'); // Redireciona para login se não autenticado
                    }
                }
            }
        });

        return () => {
            isCancelled = true;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, setIsLoading]); // REMOVIDO 'error' das dependências para evitar loop, e adicionado eslint-disable-next-line

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditedData(userData);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsLoading(true); // Inicia o carregamento ao salvar
        setError(null);
        try {
            if (!userFirestoreDocId) {
                setError('ID do documento do utilizador não disponível para salvar.');
                setIsLoading(false); // Para o carregamento em caso de erro
                return;
            }
            const userDocRef = doc(db, 'users', userFirestoreDocId);
            const { email, ...dataToUpdate } = editedData;
            await updateDoc(userDocRef, dataToUpdate);
            setUserData(editedData);
            setIsEditing(false);
            setIsLoading(false); // Para o carregamento após salvar
        } catch (err) {
            setError('Erro ao salvar perfil. Tente novamente.');
            console.error('Erro ao salvar perfil:', err);
            setIsLoading(false); // Para o carregamento em caso de erro
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
            return;
        }

        if (!auth.currentUser) {
            setPasswordMessage({ type: 'error', text: 'Utilizador não autenticado.' });
            return;
        }

        setIsLoading(true); // Inicia o carregamento ao mudar a senha
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordChange(false);
        } catch (err) {
            console.error("Erro ao mudar a senha:", err);
            let errorMessage = 'Erro ao alterar a senha. Verifique a senha atual e tente novamente.';
            if (err.code === 'auth/wrong-password') {
                errorMessage = 'A senha atual está incorreta.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'A nova senha é muito fraca. Escolha uma senha mais forte.';
            } else if (err.code === 'auth/requires-recent-login') {
                errorMessage = 'Sua sessão expirou. Por favor, saia e entre novamente para alterar a senha.';
            }
            setPasswordMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false); // Para o carregamento após a tentativa de mudança de senha
        }
    };

    const handleLogout = () => {
        setIsLoading(true); // Inicia o carregamento ao fazer logout
        signOut(auth).then(() => {
            localStorage.removeItem('userId'); // Limpa o userId do localStorage
            navigate('/'); // Redireciona para a página inicial
        }).catch((err) => {
            console.error('Erro ao fazer logout:', err);
            setError('Erro ao fazer logout. Tente novamente.');
        }).finally(() => {
            setIsLoading(false); // Para o carregamento após a tentativa de logout
        });
    };

    // Renderiza o preloader se isLoading for verdadeiro (do contexto global)
    // O Preloader global em App.js já deve estar a lidar com isto.
    // Este bloco é mais um fallback visual caso o Preloader global não esteja visível por algum motivo.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">A carregar dados...</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Por favor, aguarde.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h1 className="text-2xl font-semibold text-red-500">Erro:</h1>
                    <p className="text-red-400 mt-2">{error}</p>
                    <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Voltar ao Login</button>
                </div>
            </div>
        );
    }

    if (!userData) {
        // Se não há userData e não está mais carregando, significa que não foi possível carregar os dados.
        // Isso pode acontecer se o usuário não estiver autenticado ou se os dados não existirem.
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">Dados do utilizador não disponíveis.</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Não foi possível carregar seu perfil.
                        {/* CORREÇÃO: Usando um botão em vez de <a> para acessibilidade */}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-blue-500 cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ml-1"
                        >
                            Clique aqui para ir para a página de login.
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {isAdmin ? <MenuAdmin /> : <MenuDashboard />}
            <div className="main-content">
                <div className="profile-header">
                    <div className="header-info">
                        <div className="profile-icon-container">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="profile-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                        <div className="user-text">
                            <h1 className="user-name">{userData?.nome || 'Nome não informado'}</h1> {/* Use optional chaining */}
                            <p className="user-email">{userData?.email}</p>
                        </div>
                    </div>
                    <div className="profile-actions-btns">

                        {isEditing && (
                            <button className="action-button save-button" onClick={handleSaveProfile}>Salvar</button>
                        )}
                        <button className="edit-button" onClick={handleEditToggle}>
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </button>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h2 className="info-title">Dados Pessoais</h2>
                        {isEditing ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="nome" className="form-label">Nome:</label>
                                    <input type="text" id="nome" name="nome" value={editedData.nome || ''} onChange={handleInputChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefone" className="form-label">Telefone:</label>
                                    <input type="text" id="telefone" name="telefone" value={editedData.telefone || ''} onChange={handleInputChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cpf" className="form-label">CPF:</label>
                                    <input type="text" id="cpf" name="cpf" value={editedData.cpf || ''} disabled className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="estadoCivil" className="form-label">Estado Civil:</label>
                                    <select id="estadoCivil" name="estadoCivil" value={editedData.estadoCivil || ''} onChange={handleInputChange} className="form-select">
                                        <option value="">Selecione...</option>
                                        <option value="solteiro">Solteiro</option>
                                        <option value="casado">Casado</option>
                                        <option value="divorciado">Divorciado</option>
                                        <option value="viuvo">Viúvo</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sexo" className="form-label">Sexo:</label>
                                    <select name="sexo" id="sexo" value={editedData.sexo || ''} onChange={handleInputChange} className="form-select">
                                        <option value="">Selecione...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="info-text"><strong>Nome:</strong> {userData?.nome}</p>
                                <p className="info-text"><strong>Email:</strong> {userData?.email}</p>
                                <p className="info-text"><strong>Telefone:</strong> {userData?.telefone}</p>
                                <p className="info-text"><strong>CPF:</strong> {userData?.cpf}</p>
                                <p className="info-text"><strong>Estado Civil:</strong> {userData?.estadoCivil}</p>
                                <p className="info-text"><strong>Sexo:</strong> {userData?.sexo}</p>
                            </>
                        )}
                    </div>

                    <div className="info-card">
                        <h2 className="info-title">Endereço</h2>
                        {isEditing ? (
                            <>
                                <div className="form-group"><label htmlFor="cep" className="form-label">CEP:</label><input type="text" id="cep" name="cep" value={editedData.cep || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="endereco" className="form-label">Endereço:</label><input type="text" id="endereco" name="endereco" value={editedData.endereco || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="numero" className="form-label">Número:</label><input type="text" id="numero" name="numero" value={editedData.numero || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="complemento" className="form-label">Complemento:</label><input type="text" id="complemento" name="complemento" value={editedData.complemento || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="bairro" className="form-label">Bairro:</label><input type="text" id="bairro" name="bairro" value={editedData.bairro || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="municipio" className="form-label">Cidade:</label><input type="text" id="municipio" name="municipio" value={editedData.municipio || ''} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label htmlFor="ufEmissor" className="form-label">UF:</label><input type="text" id="ufEmissor" name="ufEmissor" value={editedData.ufEmissor || ''} onChange={handleInputChange} className="form-input" /></div>
                            </>
                        ) : (
                            <>
                                <p className="info-text"><strong>CEP:</strong> {userData?.cep}</p>
                                <p className="info-text"><strong>Endereço:</strong> {userData?.endereco}</p>
                                <p className="info-text"><strong>Número:</strong> {userData?.numero}</p>
                                <p className="info-text"><strong>Complemento:</strong> {userData?.complemento}</p>
                                <p className="info-text"><strong>Bairro:</strong> {userData?.bairro}</p>
                                <p className="info-text"><strong>Cidade:</strong> {userData?.municipio}</p>
                                <p className="info-text"><strong>UF:</strong> {userData?.ufEmissor}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="button-group">

                    <button className="action-button change-password-button" onClick={() => setShowPasswordChange(!showPasswordChange)}>{showPasswordChange ? 'Ocultar Alterar Senha' : 'Alterar Senha'}</button>
                    <button className="action-button logout-button" onClick={handleLogout}>Sair da conta</button>
                </div>

                {showPasswordChange && (
                    <div className="password-change-section">
                        <h2 className="password-change-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="password-change-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.02-1.742.365a6.004 6.004 0 0 0-3.766 6.002c.033.45.053.901.065 1.352m12.336-15.655a2.25 2.25 0 0 1 2.25 2.25V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V8.25a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m6.75-2.25V6a2.25 2.25 0 0 0-4.5 0v3.75" />
                            </svg>
                            Alterar Senha
                        </h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group"><label htmlFor="oldPassword" className="form-label">Senha Atual:</label><input type="password" id="oldPassword" name="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="form-input" /></div>
                            <div className="form-group"><label htmlFor="newPassword" className="form-label">Nova Senha:</label><input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="form-input" /></div>
                            <div className="form-group"><label htmlFor="confirmNewPassword" className="form-label">Confirmar Nova Senha:</label><input type="password" id="confirmNewPassword" name="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className="form-input" /></div>
                            {passwordMessage.text && (
                                <div className={`password-message ${passwordMessage.type}`}>
                                    {passwordMessage.type === 'error' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="message-icon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.021 3.375 1.766 3.375h14.597c1.745 0 2.632-1.875 1.766-3.375l-7.293-12.75a1.5 1.5 0 0 0-1.28-1.077h-1.55a1.5 1.5 0 0 0-1.28 1.077l-7.293 12.75Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="message-icon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    )}
                                    {passwordMessage.text}
                                </div>
                            )}
                            <button type="submit" className="confirm-button">Confirmar Alteração</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Perfil;
