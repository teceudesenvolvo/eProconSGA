import React, { Component } from 'react';



//Imagens

// Icones
import {
    GoBook,
    GoShield ,
    GoCalendar,
    GoStop 
} from 'react-icons/go';

// Components
import SlideFeacures from '../componets/slideFeactures';


//mudança de páginas

class homeDashboard extends Component {
    render() {
        return (

            <div className='App-header' >
                <div className='Home-Dach'>
                    
                    <div className='btnsHome'>
                        <input type='button' value={'Consumidor'} className='btnHome'/> 
                        <input type='button' value={'Empresas'} className='btnHome'/> 
                    </div>
                    <dvi className='header-Dach-div'>
                        <h1>Destaques</h1>
                    </dvi>

                    <div className='btnsHome'>
                        <a className='btnLargeHome' href='https://www.consumidor.gov.br/'><GoBook className="iconHomeBtn" /><br/>Consumidor Gov</a>
                        <a className='btnLargeHome' href='/login'><GoShield className="iconHomeBtn" /><br/>Realizar Denuncia</a>
                        <a className='btnLargeHome' href='/login'><GoCalendar className="iconHomeBtn" /><br/>Agendar Atendimento</a>
                        <a className='btnLargeHome' href='/'><GoStop className="iconHomeBtn" /><br/>Evite estes sites</a>
                    </div>
                   
                    
                    <dvi className='header-Dach-div'>
                        <h1>Nossos Vereadores</h1>
                    </dvi>

                    <div className='HomeDesktopCarrosel'>
                        <SlideFeacures />
                    </div>


                </div>


            </div>
        );
    }
}

export default homeDashboard;