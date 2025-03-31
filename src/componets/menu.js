import React, { Component } from 'react';

//Imagens


// Icones
import {
  GoHome,
  GoCircleSlash  ,
  GoCalendar,
  GoStop,
  GoPerson 
} from 'react-icons/go';


// Components

//mudança de páginas

class menu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      linkMenu: 'linkMenu',
      linkMenu0: 'linkMenu',
      linkMenu1: 'linkMenu',
      linkMenu2: 'linkMenu',
      linkMenu3: 'linkMenu',
      linkMenu4: 'linkMenu',
      menuClass: 'menu',
      window: window.location.pathname,
    }
  }


  btnHome = () => {
    switch (this.state.window) {
      case `/`:
        return this.setState({ linkMenu: 'linkMenu link-active' })
      case `/meus-atendimentos`:
        return this.setState({ linkMenu0: 'linkMenu link-active' })
      case `/registrar-reclamacao`:
        return this.setState({ linkMenu1: 'linkMenu link-active' })
      case `/golpes`:
        return this.setState({ linkMenu2: 'linkMenu link-active' })
      case `/perfil`:
        return this.setState({ linkMenu3: 'linkMenu link-active' })
      case `/login`:
        return this.setState({ menuClass: 'menuNone' })
      case `/register`:
        return this.setState({ menuClass: 'menuNone' })
      case `/mais`:
        return this.setState({ menuClass: 'menuNone' })
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
      <nav className={this.state.menuClass}>

        <a href='/' className={this.state.linkMenu}> <GoHome /> </a>
        <a href='/meus-atendimentos' className={this.state.linkMenu0}> <GoCalendar /> </a>
        <a href='/registrar-reclamacao' className={this.state.linkMenu1}> < GoCircleSlash /> </a>
        <a href='/golpes' className={this.state.linkMenu2}> <GoStop /> </a>
        <a href='/perfil' className={this.state.linkMenu3}> <GoPerson  /> </a>

      </nav>

    );
  }
}

export default menu;