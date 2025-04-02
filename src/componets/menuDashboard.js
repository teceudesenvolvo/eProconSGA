import React, { Component } from 'react';


//Imagens
import Logo from '../assets/logoLaranga.png';

// Icones
import {
    FaAddressBook ,
    FaPlusCircle ,
    FaRegUser,
    // FaBook
} from "react-icons/fa";


// Components

//mudança de páginas

class menuDashboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            linkMenu: 'aDesktop',
            linkMenu1: 'aDesktop',
            linkMenu2: 'aDesktop',
            linkMenu3: 'aDesktop',
            window: window.location.pathname,
        }
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
        const loadPage = () => {
            this.btnHome()
        }

        loadPage()
    }


    render() {
        return (
            <nav className='menuDashboard'>

                <a href="/meus-atendimentos" className={this.state.linkMenu}>
                    <FaAddressBook className='fas fa-home'></FaAddressBook>
                    <span className='nav-item'>Meus Atendimentos</span>
                </a>

                {/* <a href="/agendar-atendimento" className={this.state.linkMenu1}>
                    <FaBook className='fas fa-home'></FaBook>
                    <span className='nav-item'>Agendar</span>
                </a> */}

             
                <a href="/registrar-reclamacao" className={this.state.linkMenu2}>
                    <FaPlusCircle  className='fas fa-Notificacoes'></FaPlusCircle >
                    <span className='nav-item'>Nova Reclamação</span>
                </a>
                
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

export default menuDashboard;