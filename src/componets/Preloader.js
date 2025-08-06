// Preloader.js
import React from 'react';
import { useLoading } from './LoadingContext'; // Ajuste o caminho conforme necessário

const Preloader = () => {
    const { isLoading } = useLoading();

    // Estilos para o overlay do preloader
    const preloaderOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#105394', // Fundo cinzento claro
        display: 'flex',
        flexDirection: 'row', // Para alinhar as barras horizontalmente
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Garante que esteja acima de todo o conteúdo
        transition: 'opacity 0.3s ease-in-out', // Transição suave para aparecer/desaparecer
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? 'auto' : 'none', // Permite/impede interações quando visível/invisível
    };

    // Estilos para cada barra individual
    const barStyle = {
        width: '10px', // Largura da barra
        height: '40px', // Altura da barra
        backgroundColor: 'white', // Cor preta
        margin: '0 5px', // Espaçamento entre as barras
        borderRadius: '2px', // Cantos ligeiramente arredondados
        animation: 'bar-pulse 1s infinite ease-in-out', // Animação de pulsação
    };

    // Adiciona a animação de pulsação via style tag para garantir que funcione
    React.useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = `
            @keyframes bar-pulse {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.5); } /* Reduz a altura da barra pela metade */
            }
        `;
        // Verifica se a folha de estilo já existe para evitar duplicatas
        if (!document.head.querySelector('#preloader-bar-animation')) {
            styleSheet.id = 'preloader-bar-animation'; // Adiciona um ID para fácil verificação
            document.head.appendChild(styleSheet);
        }
    }, []); // Executa apenas uma vez na montagem

    // Renderiza o preloader apenas se isLoading for true
    return (
        <div style={preloaderOverlayStyle}>
            {/* As três barras com atrasos de animação diferentes para um efeito escalonado */}
            <div style={{ ...barStyle, animationDelay: '0s' }}></div>
            <div style={{ ...barStyle, animationDelay: '0.2s' }}></div>
            <div style={{ ...barStyle, animationDelay: '0.4s' }}></div>
        </div>
    );
};

export default Preloader;
