import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-SGA-procon.png';

const LoginClient = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

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
            await signInWithEmailAndPassword(auth, email, password);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            localStorage.setItem('userId', user.uid);
            const paginaAnterior = localStorage.getItem('paginaAnterior');
            if (paginaAnterior) {
                localStorage.removeItem('paginaAnterior');
                navigate(paginaAnterior);
            } else {
                window.location.pathname = '/perfil';
            }

            
        } catch (err) {
            setError('Email ou senha incorretos.'); // Mensagem de erro genérica para falha no login
        }
    };

    return (
        <div className="App-header loginPage">
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
                    <input type="submit" className="buttonLogin" value="Entrar" />
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