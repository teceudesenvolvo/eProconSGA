import React, { useEffect } from 'react';
import { GoBook, GoCircleSlash, GoCalendar, GoFile  } from 'react-icons/go';
import SlideFeacures from '../componets/slideFeactures';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Imagens
import imgHeader from '../assets/banner-header.png'


function HomeDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (localStorage.getItem('userId')) {
                if (localStorage.getItem('userId') === 'wwFXcDCrlVNcQ1yjR4GFR9CbmAL2') {
                    navigate('/atendimentos-sga-hyo6d27');
                } else {
                    navigate('/perfil');
                }
                }
            else {

            }
        });

        // Limpar o listener quando o componente for desmontado
        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className='App-header'>
            <div className='Home-Dach'>
                <img src={imgHeader} className='imgHeader' alt='banner imagem inicio' />
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
                    <a href='https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm' className='btnLargeHome'>
                        <GoFile  className="iconHomeBtn" /><br />Codigo Defesa do Consumidor
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