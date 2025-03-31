import React, { Component } from 'react';



//Imagens

// Icones
import {
    GoBook,
    GoCircleSlash ,
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
                        <a type='button' href='/login' className='btnHome'>Login</a> 
                        <a type='button' href='/register' className='btnHome'>Cadastrar</a> 
                    </div>
                    <dvi className='header-Dach-div'>
                        <h1>Destaques</h1>
                    </dvi>

                    <div className='btnsHome'>
                        <a className='btnLargeHome' href='https://www.consumidor.gov.br/'><GoBook className="iconHomeBtn" /><br/>Consumidor Gov</a>
                        <a className='btnLargeHome' href='/login'><GoCircleSlash className="iconHomeBtn" /><br/>Realizar Reclamação</a>
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