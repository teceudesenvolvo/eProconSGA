import React, { Component } from 'react';
import { auth } from '../firebase'; // Importe 'auth'
import { useNavigate, useLocation } from 'react-router-dom'; // Importe useNavigate e useLocation

//Imagens
import Logo from '../assets/logoLaranga.png';

// Icones
import {
    FaAddressBook ,
    FaRegUser
    // FaPlusCircle ,
    // FaBook
} from "react-icons/fa";


// Components


//mudança de páginas

class MenuDashboard extends Component { // Renomeado para MenuDashboard para consistência
    constructor(props) {
        super(props)
        this.state = {
            linkMenu: 'aDesktop',
            linkMenu1: 'aDesktop',
            linkMenu2: 'aDesktop',
            linkMenu3: 'aDesktop',
            window: window.location.pathname,
            isLoadingAuth: true, // NOVO ESTADO: Para indicar se a verificação de autenticação está em andamento
            isAuthorized: false, // NOVO ESTADO: Para controlar a autorização
        }
        this.navigate = this.props.navigate; // Recebe navigate via props
    }


    btnHome = () => {
        switch (this.state.window) {
            case `/meus-atendimentos`:
                return this.setState({ linkMenu: 'aDesktop link-desktop-active' })
            case `/agendar-atendimento`:
                return this.setState({ linkMenu1: 'aDesktop link-desktop-active' })
            case `/registrar-reclamacao`:
                return this.setState({ linkMenu2: 'aDesktop link-desktop-active' })
            case `/perfil`:
                return this.setState({ linkMenu3: 'aDesktop link-desktop-active' })
            default:
                return null
        }
    }

    componentDidMount() {
        // Verifica o estado de autenticação do usuário
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Verifica se o usuário existe e se o email existe
            if (user && user.email) {
                // Se o usuário existe e o email é o admin
                if (user.email === 'admin@cmsga.ce.gov.br') {
                    this.setState({ isAuthorized: true, isLoadingAuth: false });
                    this.btnHome(); // Chama a função para ativar o link do menu
                } else {
                    // Se o usuário existe, tem um email, mas NÃO é o email do admin
                    this.setState({
                        isAuthorized: false, // Não autorizado para esta página específica
                        isLoadingAuth: false,
                    });
                    this.navigate('/registrar-reclamacao'); // Redireciona para /registrar-reclamacao
                }
            } else {
                // Se o usuário não existe (não logado) ou não tem email
                this.setState({
                    isAuthorized: false,
                    isLoadingAuth: false,
                });
                this.navigate('/login'); // Redireciona para a página de login
            }
        });

        // Limpa o listener ao desmontar o componente
        this.unsubscribeAuth = unsubscribe;
    }

    componentWillUnmount() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }


    render() {
        const { isLoadingAuth, isAuthorized } = this.state;

        // 1. Exibe "Carregando autenticação..." enquanto o estado de autenticação não foi verificado
        if (isLoadingAuth) {
            return (
                <nav className='menuDashboard'>
                    <div className="loading-message-menu">
                        <p>Verificando acesso...</p>
                    </div>
                </nav>
            );
        }

        // 2. Se a autenticação foi verificada e o usuário não está autorizado, não renderiza o menu
        if (!isAuthorized) {
            return null; // Não renderiza o menu se não for autorizado, o redirecionamento já acontece no componentDidMount
        }

        // Se autorizado, renderiza o menu
        return (
            <nav className='menuDashboard'>

                <a href="/atendimentos-sga-hyo6d27" className={this.state.linkMenu}>
                    <FaAddressBook className='fas fa-home'></FaAddressBook>
                    <span className='nav-item'>Atendimentos</span>
                </a>

                {/* <a href="/agendar-atendimento" className={this.state.linkMenu1}>
                    <FaBook className='fas fa-home'></FaBook>
                    <span className='nav-item'>Agendar</span>
                </a> */}

             
                {/* <a href="/atendimento-sga-ppi6g59" className={this.state.linkMenu2}>
                    <FaPlusCircle  className='fas fa-Notificacoes'></FaPlusCircle >
                    <span className='nav-item'>Nova Reclamação</span>
                </a> */}
                
                <a href="/perfil" className={this.state.linkMenu3}>
                    <FaRegUser className='fas fa-Ajuda'></FaRegUser>
                    <span className='nav-item'>Minha Conta</span>
                </a> 


                <a href='/homeDashboard' className="logoDashbord" >
                    <img src={Logo} alt="logomarca" ></img>
                    {/* <h1 className='h1-logo'>| List</h1> */}
                </a>
            </nav>

        );
    }
}

// Wrapper para injetar os hooks useNavigate e useLocation
function WithNavigateAndLocation(props) {
    let navigate = useNavigate();
    let location = useLocation(); // Não usado diretamente aqui, mas incluído para consistência
    return <MenuDashboard {...props} navigate={navigate} location={location} />
}

export default WithNavigateAndLocation;
