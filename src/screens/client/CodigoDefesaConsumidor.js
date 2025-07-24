import React, { Component } from 'react';

//Imagens

// Icones

// Components


//mudança de páginas

class Minhas_Compras extends Component {

  render() {
    return (
      <div className='App-header'>
       
        {/* Adicionando o iframe para incorporar o Código de Defesa do Consumidor */}
        <div className="cdc-embed-container">
          <iframe
            src="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
            title="Código de Defesa do Consumidor"
            className="cdc-iframe"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }
}

export default Minhas_Compras;
