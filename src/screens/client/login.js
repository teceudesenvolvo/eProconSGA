import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import logo from '../../assets/logo-SGA-procon.png';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import imgHeader from '../../assets/plenario.png' // Esta imagem será usada no carrossel ou como um banner genérico


const LoginClient = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
                    <a href="/consultas" className="linkLogin">
                        Esqueceu a senha?
                    </a>
                    <input type="submit" className="buttonLogin btnLogin" value="Entrar" />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
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