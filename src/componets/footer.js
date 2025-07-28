import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Seção 1: Título e Descrição */}
        <div className="footer-column">
          <h3>Procon CMSGA</h3>
          <p>
            Câmara Municipal de São Gonçalo do Amarante – Ceará.
            Órgão de defesa e proteção dos direitos do consumidor.
          </p>
        </div>

        {/* Seção 2: Nossos Serviços e Informações Úteis */}
        <div className="footer-column">
          <h4>Nossos Serviços</h4>
          <ul>
            <li>
              <a href="/registrar-reclamacao">
                Registrar Reclamação
              </a>
            </li>
            <li>
              <a href="/login">
                Entrar na sua conta
              </a>
            </li>
            <li>
              <a href="/register">
                Criar uma conta
              </a>
            </li>
          </ul>

          <h4>Informações Úteis</h4>
          <ul>
            <li>
              <a href="/codigo-de-defesa-do-consumidor">
                Código de Defesa do Consumação
              </a>
            </li>
            <li>
              <a href="https://www.consumidor.gov.br/" target="_blank" rel="noopener noreferrer">
                Plataforma Consumidor.gov
              </a>
            </li>
          </ul>
        </div>

        {/* Seção 3: Contato */}
        <div className="footer-column">
          <h4>Contato</h4>
          <p>
            Endereço: Avenida Prefeito Mauricio Brasileiro, Av. Cel. Neco Martins - Liberdade, São Gonçalo do Amarante - CE, 62670-000
          </p>
          <p>
            Telefone: <a href="tel:08533154482">085 3315-4482</a>
          </p>
          <p>
            Email: <a href="mailto:procon@cmsga.ce.gov.br">procon@cmsga.ce.gov.br</a>
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <p>Copyright &copy; 2025 Procon CMSGA. Todos os direitos reservados. <br/>Desenvolvido por Blu Tecnologias</p>
      </div>
    </footer>
  );
};

export default Footer;
