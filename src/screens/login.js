import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import logo from '../assets/logo-SGA-procon.png';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import imgHeader from '../assets/plenario.png';
import { useLoading } from '../componets/LoadingContext'; // Caminho corrigido

const LoginClient = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [resetPasswordMessage, setResetPasswordMessage] = useState(null);
    const { isLoading, setIsLoading } = useLoading(); // Mantemos o controle do isLoading global
    const navigate = useNavigate();

    console.log('LoginClient renderizado. isLoading:', isLoading); // Log de renderização

    const validateEmail = (email) => {
        if (!email || typeof email !== 'string') {
            return false;
        }
        if (!email.includes('@') || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
            return false;
        }
        if (!email.includes('.') || email.indexOf('.') === 0 || email.indexOf('.') === email.length - 1) {
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setResetPasswordMessage(null);

        console.log('handleLogin iniciado.');

        if (!email || !validateEmail(email)) {
            setError('Digite um email válido.');
            console.log('handleLogin: Validação de email falhou.');
            return;
        }

        if (!password || password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            console.log('handleLogin: Validação de senha falhou.');
            return;
        }

        setIsLoading(true); // Ativa o preloader global
        console.log('handleLogin: setIsLoading(true) chamado.');

        try {
            console.log('handleLogin: Tentando signInWithEmailAndPassword...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('handleLogin: Login bem-sucedido. UID:', user.uid);
            localStorage.setItem('userId', user.uid);

            console.log('handleLogin: Buscando CPF no Firestore...');
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                const cpf = userDoc.cpf;
                localStorage.setItem('cpf', cpf);
                console.log('handleLogin: CPF encontrado e salvo:', cpf);
            } else {
                console.log('handleLogin: CPF não encontrado para o UID.');
            }

            if (email === 'admin@cmsga.ce.gov.br') {
                console.log('handleLogin: Redirecionando para /painel');
                navigate('/painel');
            } else {
                console.log('handleLogin: Redirecionando para /meus-atendimentos');
                navigate('/meus-atendimentos');
            }
        } catch (err) {
            setError('Email ou senha incorretos.');
            console.error('handleLogin: Erro de login:', err.code, err.message);
        } finally {
            setIsLoading(false); // Desativa o preloader global no final, sempre
            console.log('handleLogin: setIsLoading(false) chamado (finally block).');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setResetPasswordMessage(null);

        console.log('handleForgotPassword iniciado.');

        if (!email) {
            setResetPasswordMessage('Por favor, digite seu email no campo acima para redefinir a senha.');
            console.log('handleForgotPassword: Email não fornecido.');
            return;
        }

        setIsLoading(true); // Ativa o preloader global
        console.log('handleForgotPassword: setIsLoading(true) chamado.');

        try {
            console.log('handleForgotPassword: Tentando sendPasswordResetEmail...');
            await sendPasswordResetEmail(auth, email);
            setResetPasswordMessage('Um link de redefinição de senha foi enviado para o seu email.');
            console.log('handleForgotPassword: Email de redefinição enviado com sucesso.');
        } catch (error) {
            console.error("handleForgotPassword: Erro ao enviar email de redefinição de senha:", error.code, error.message);
            setResetPasswordMessage('Erro ao enviar o email. Verifique se o email está correto ou tente novamente mais tarde.');
        } finally {
            setIsLoading(false); // Desativa o preloader global no final, sempre
            console.log('handleForgotPassword: setIsLoading(false) chamado (finally block).');
        }
    };

    return (
        <div className="App-header loginPage">
            {/* O preloader local foi removido daqui. O preloader global (Preloader.js) cuidará disso. */}
            <div className="header-image-container image-background-login">
                <img src={imgHeader} alt="Plenário" className="header-image image-background-login rounded-lg" />
            </div>
            <div className="Container bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                <img src={logo} alt="logo" className="logo logoLogin mx-auto mb-6 rounded-lg" />
                <form className="formLogin space-y-4" onSubmit={handleLogin}>
                    <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 text-center mb-6">Entre com sua conta:</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        className="inputLogin w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading} 
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="inputLogin w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}    
                    />
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="linkLogin forgotPasswordLink text-blue-500 hover:underline text-sm text-right block w-full"
                        disabled={isLoading}
                    >
                        Esqueceu a senha?
                    </button>
                    <input
                        type="submit"
                        className="buttonLogin btnLogin w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        value="Entrar"
                        disabled={isLoading}
                    />
                    {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
                    {resetPasswordMessage && <p className="text-green-500 text-center text-sm mt-2">{resetPasswordMessage}</p>}
                </form>
                <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
                    Não tem uma conta?{' '}
                    <a href="/register" className="linkLogin text-blue-500 hover:underline">
                        Crie uma
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginClient;
