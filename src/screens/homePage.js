import React, { useEffect } from 'react';
import {
    GoBook,
    GoCircleSlash,
    // GoCalendar,
    GoFile
} from 'react-icons/go';
import SlideFeacures from '../componets/slideFeactures';
import SlideDicas from '../componets/slideDicas'
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Imagens
import imgHeader from '../assets/plenario.png' // Esta imagem será usada no carrossel ou como um banner genérico

function HomeDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (localStorage.getItem('userId')) {
                if (localStorage.getItem('userId') === 'wwFXcDCrlVNcQ1yjR4GFR9CbmAL2') {
                    navigate('/painel');
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
                {/* Novo Header baseado na imagem */}
                <div className="header-content">
                    <div className="header-image-container">
                        {/*  */}
                        <img src={imgHeader} alt="Médico sorrindo" className="header-image" />
                    </div>
                    <div className="header-text">
                        <h1>Câmara Municipal de São Gonçalo do Amarante - CE</h1>
                        <h2>Bem vindo ao PROCON</h2>
                        <p>Seja atendido fácilemente no portal online.</p>
                        {/* Botões de Login/Cadastro (mantidos) */}
                        <div className='btnsHome'>
                            <a href='/login' className='btnHome'>Login</a>
                            <a href='/register' className='btnHome'>Cadastrar</a>
                        </div>
                    </div>

                </div>
                {/* Seção "Dicas do Procon" e Carrossel */}
                <div className='ProconCarrosel'>
                    <SlideDicas />
                </div>
                {/* Seção de botões de ação (mantida, mas com margem ajustada) */}
                <div className='btnsHome'>
                    <div className='btnLargeHome'>
                        <a href='/registrar-reclamacao' >
                            <GoCircleSlash className="iconHomeBtn" /><br />Realizar Reclamação
                        </a>
                    </div>

                    {/* <div className='btnLargeHome'>
                        <a href='/meus-atendimentos'>
                            <GoCalendar className="iconHomeBtn" /><br />Agendar Atendimento
                        </a>
                    </div> */}

                    <div className='btnLargeHome'>
                        <a href='/codigo-de-defesa-do-consumidor'>
                            <GoFile className="iconHomeBtn" /><br />Código Defesa do Consumidor
                        </a>
                    </div>

                    <div className='btnLargeHome'>
                        <a href='https://www.consumidor.gov.br/' target="_blank" rel="noopener noreferrer">
                            <GoBook className="iconHomeBtn" /><br />Consumidor Gov
                        </a>
                    </div>
                </div>


                
                {/* Seção "Nossos Vereadores" e Carrossel (mantidos) */}
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
