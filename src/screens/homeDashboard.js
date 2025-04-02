import React from 'react';
import { GoBook, GoCircleSlash, GoCalendar, GoStop } from 'react-icons/go';
import SlideFeacures from '../componets/slideFeactures';

function HomeDashboard() {
  return (
    <div className='App-header'>
      <div className='Home-Dach'>
        <div className='btnsHome'>
          <a href='/login' className='btnHome'>Login</a>
          <a href='/register' className='btnHome'>Cadastrar</a>
        </div>
        <div className='header-Dach-div'>
          <h1>Destaques</h1>
        </div>
        <div className='btnsHome'>
          <a href='/registrar-reclamacao' className='btnLargeHome'>
            <GoCircleSlash className="iconHomeBtn" /><br />Realizar Reclamação
          </a>
          <a href='/meus-atendimentos' className='btnLargeHome'>
            <GoCalendar className="iconHomeBtn" /><br />Agendar Atendimento
          </a>
          <a href='/' className='btnLargeHome'>
            <GoStop className="iconHomeBtn" /><br />Evite estes sites
          </a>
          <a className='btnLargeHome' href='https://www.consumidor.gov.br/' target="_blank" rel="noopener noreferrer">
            <GoBook className="iconHomeBtn" /><br />Consumidor Gov
          </a>
        </div>
        <div className='header-Dach-div'>
          <h1>Nossos Vereadores</h1>
        </div>
        <div className='HomeDesktopCarrosel'>
          <SlideFeacures />
        </div>
      </div>
    </div>
  );
}

export default HomeDashboard;