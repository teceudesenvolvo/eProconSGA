import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/themes/splide-default.min.css'; // Tema padrão do Splide

const ProconCarousel = () => {
  const title = "A lei do Procon é o Código de Defesa do Consumidor (CDC), Lei nº 8.078, de 11 de setembro de 1990. O CDC estabelece normas de proteção e defesa do consumidor.";

  const items = [
    "O cliente não pode ser forçado a pagar multa por perda de comanda de consumo.",
    "Tempo de garantia de um produto.",
    "Não existe valor mínimo para compra com cartão.",
    "O fornecedor deve responder por defeitos de fabricação mesmo fora do período de garantia.",
    "NOME DEVE SER LIMPO ATÉ 5 DIAS APÓS PAGAMENTO DA DÍVIDA",
    "VOCÊ PODE DESISTIR DE COMPRAS FEITAS PELA INTERNET no prazo de 07 dias corridos.",
    "PASSAGENS DE ÔNIBUS TÊM VALIDADE DE UM ANO",
    "VOCÊ PODE SUSPENDER SERVIÇOS SEM CUSTO",
    "CONSTRUTORA DEVE PAGAR INDENIZAÇÃO POR ATRASO EM OBRA.",
    "Publicidade enganosa ou abusiva."
  ];

  return (
    <div className="procon-carousel-container">
      <p className="procon-carousel-title">{title}</p>
      <a href="/codigo-de-defesa-do-consumidor" target="_blank" rel="noopener noreferrer" className="procon-carousel-link">Saiba mais sobre seus direitos</a>
      <Splide
        options={{
          type: 'loop', // Carrossel infinito
          perPage: 1, // 1 item por página
          perMove: 1, // Move 1 item por vez
          autoplay: true, // Auto-play
          interval: 3000, // Intervalo de 3 segundos
          pauseOnHover: true, // Pausa no hover
          arrows: true, // Mostrar setas de navegação
          pagination: true, // Mostrar paginação (bolinhas)
          breakpoints: {
            768: { // Para telas menores que 768px
              perPage: 1, // 1 item por página
            },
            1024: { // Para telas menores que 1024px
              perPage: 2, // 2 itens por página
            },
          },
        }}
        className="procon-splide"
      >
        {items.map((item, index) => (
          <SplideSlide key={index} className="procon-splide-slide">
            <div className="slide-content">
              <span className="slide-number">{index + 1}.</span>
              <p className="slide-text">{item}</p>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default ProconCarousel;
