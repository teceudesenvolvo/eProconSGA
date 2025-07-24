import React, { useEffect } from 'react';
import { GoBook, GoCircleSlash, GoCalendar, GoFile } from 'react-icons/go';
import SlideFeacures from '../componets/slideFeactures';
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
                {/* Novo Header baseado na imagem */}
                <div className="header-content">
                    <div className="header-text">
                        <h1>Acessar o PROCON agora é online e fácil de usar!</h1>
                        <p>Seja atendido fácilemente por nosso portal online.</p>
                        {/* Botões de Login/Cadastro (mantidos) */}
                        <div className='btnsHome'>
                            <a href='/login' className='btnHome'>Login</a>
                            <a href='/register' className='btnHome'>Cadastrar</a>
                        </div>
                    </div>
                    <div className="header-image-container">
                        {/*  */}
                        <img src={imgHeader} alt="Médico sorrindo" className="header-image" />
                    </div>
                </div>

                {/* Seção de botões de ação (mantida, mas com margem ajustada) */}
                <div className='btnsHome'>
                    <div className='btnLargeHome'>
                        <a href='/registrar-reclamacao' >
                            <GoCircleSlash className="iconHomeBtn" /><br />Realizar Reclamação
                        </a>
                    </div>

                    <div className='btnLargeHome'>
                        <a href='/meus-atendimentos'>
                            <GoCalendar className="iconHomeBtn" /><br />Agendar Atendimento
                        </a>
                    </div>

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
