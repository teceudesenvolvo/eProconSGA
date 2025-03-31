import React, { Component } from 'react';


//Imagens

// Icones
import {
    GoHome,
    GoCircleSlash  ,
    GoCalendar,
    GoStop 
  } from 'react-icons/go';

import { FaRegUser } from "react-icons/fa";

// Components

//mudança de páginas

class menuDesktop extends Component {

    constructor(props) {
        super(props)
        this.state = {
            linkMenu: 'aDesktop',
            linkMenu2: 'aDesktop',
            linkMenu3: 'aDesktop',
            linkMenu4: 'aDesktop',
            linkMenu5: 'aDesktop',
            linkMenu6: 'aDesktop',
            linkMenu7: 'aDesktop',
            linkMenu8: 'aDesktop',
            menuDesktop: 'menuDesktop',
            window: window.location.pathname,
        }
    }


    btnHome = () => {
        switch (this.state.window) {
            case `/`:
                return this.setState({ linkMenu: 'aDesktop link-desktop-active' })
            case `/registrar-reclamacao`:
                return this.setState({ linkMenu2: 'aDesktop link-desktop-active' })
            case `/agendar-atendimento`:
                return this.setState({ linkMenu3: 'aDesktop link-desktop-active' })
            case `/golpes`:
                return this.setState({ linkMenu4: 'aDesktop link-desktop-active' })
            case `/perfil`:
                return this.setState({ linkMenu5: 'aDesktop link-desktop-active' })
            case `/login`:
                return this.setState({ menuDesktop: 'menuNone' })
            case `/register`:
                return this.setState({ menuDesktop: 'menuNone' })
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
            <nav className={this.state.menuDesktop}>

                

                <a href="/" className={this.state.linkMenu}>
                    <GoHome className='fas fa-home'></GoHome>
                    <span className='nav-item'>Início</span> 
                </a>

                <a href="/registrar-reclamacao" className={this.state.linkMenu2}>
                    <GoCircleSlash  className='fas fa-favoritos'></GoCircleSlash >
                    <span className='nav-item'>Reclamação</span>
                </a>

                <a href="/agendar-atendimento" className={this.state.linkMenu3}>
                    <GoCalendar className='fas fa-Notificacoes'></GoCalendar>
                    <span className='nav-item'>Agendar</span>
                </a>
                <a href="/golpes" className={this.state.linkMenu4}>
                    <GoStop className='fas fa-Ajuda'></GoStop>
                    <span className='nav-item'>Sites/Golpes</span>
                </a>
                
                <a href="/perfil" className={this.state.linkMenu5}>
                    <FaRegUser className='fas fa-Ajuda'></FaRegUser>
                    <span className='nav-item'>Minha Conta</span>
                </a>
                
                
            </nav>

        );
    }
}

export default menuDesktop;