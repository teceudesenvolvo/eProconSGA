import React, { Component } from 'react';
import '../App.css'

//Imagens

import Logo from '../assets/e-camara-16.png'

// Icones

// Components

//mudança de páginas

class topBar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            window: window.location.pathname,
            headerHome: 'header-home'
        }
    }

    componentDidMount() {
        if (this.state.name) {
            this.setState({ helloText: `Olá, ${this.state.name}` })
        } else {
            this.setState({ helloText: `Seja bem vindo.` })
        }
        this.btnHome()
    }

    btnHome = () => {
        switch (this.state.window) {
            case `/login`:
                return this.setState({ headerHome: 'menuNone' })
            default:
                return null
        }
    }


    render() {
        return (
            <>
            <nav className={this.state.headerHome}>
                <div className='header-home'>
                    <p className='titleHeader'><img src={Logo} alt='Logomarca' onClick={()=> {window.location.href = "/"}}/></p>
                    {/* <input type="text" placeholder={`Pesquisar`} className='inputPesquisar' /> */}
                    {/* <FaSistrix className='PesquisarLogo' /> */}
                </div>
            </nav>
            </>
        );
    }
}

export default topBar;