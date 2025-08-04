import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Importado sendPasswordResetEmail
import logo from '../assets/logo-SGA-procon.png';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import imgHeader from '../assets/plenario.png' // Esta imagem será usada no carrossel ou como um banner genérico


const LoginClient = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [resetPasswordMessage, setResetPasswordMessage] = useState(null); // Novo estado para a mensagem de redefinição de senha
    const navigate = useNavigate();

    // Função de validação de email
    const validateEmail = (email) => {
        if (!email || typeof email !== 'string') {
            return false;
        }
        // Valida a presença e posição do '@'
        if (!email.includes('@') || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
            return false;
        }
        // Valida a presença e posição do '.'
        if (!email.includes('.') || email.indexOf('.') === 0 || email.indexOf('.') === email.length - 1) {
            return false;
        }
        return true;
    };

    // Função para lidar com o login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setResetPasswordMessage(null); // Limpa a mensagem de redefinição de senha ao tentar fazer login

        // Validações de campos
        if (!email) {
            setError('Por favor, digite seu email.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Digite um email válido.');
            return;
        }

        if (!password) {
            setError('Por favor, digite sua senha.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            localStorage.setItem('userId', user.uid);

            // Buscar o CPF do usuário no banco de dados
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                const cpf = userDoc.cpf;
                localStorage.setItem('cpf', cpf);
            }

            // Redirecionamento condicional
            if (email === 'admin@cmsga.ce.gov.br') {
                navigate('/atendimentos-sga-hyo6d27');
            } else {
                navigate('/meus-atendimentos');
            }
        } catch (err) {
            setError('Email ou senha incorretos.');
        }
    };

    // Nova função para lidar com o "Esqueceu a senha?"
    const handleForgotPassword = async (e) => {
        e.preventDefault(); // Impede o comportamento padrão do link
        setError(null);
        setResetPasswordMessage(null); // Limpa a mensagem anterior

        if (!email) {
            setResetPasswordMessage('Por favor, digite seu email no campo acima para redefinir a senha.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetPasswordMessage('Um link de redefinição de senha foi enviado para o seu email.');
        } catch (error) {
            console.error("Erro ao enviar email de redefinição de senha:", error);
            setResetPasswordMessage('Erro ao enviar o email. Verifique se o email está correto ou tente novamente mais tarde.');
        }
    };


    return (
        <div className="App-header loginPage">
            <div className="header-image-container image-background-login">
                {/* Imagem Background */}
                <img src={imgHeader} alt="Médico sorrindo" className="header-image image-background-login" />
            </div>
            <div className="Container">
                <img src={logo} alt="logo" className="logo logoLogin" />
                <form className="formLogin" onSubmit={handleLogin}>
                    <h1>Entre com sua conta:</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        className="inputLogin"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="inputLogin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* Alteração no link para chamar a nova função */}
                    <button type="button" onClick={handleForgotPassword} className="linkLogin forgotPasswordLink">
                        Esqueceu a senha?
                    </button>
                    <input type="submit" className="buttonLogin btnLogin" value="Entrar" />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {/* Exibe a nova mensagem de redefinição de senha */}
                    {resetPasswordMessage && <p style={{ color: 'green' }}>{resetPasswordMessage}</p>}
                </form>
                <p>
                    Não tem uma conta?{' '}
                    <a href="/register" className="linkLogin">
                        Crie uma
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginClient;
