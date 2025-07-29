import { Html, Head, Body, Container, Text, Hr, Link, Preview, Section } from '@react-email/components';
import * as React from 'react';

// Este é o componente de template de e-mail que será renderizado pelo react.email
// Ele recebe props para tornar o conteúdo dinâmico.
export const ReclamacaoAtualizadaEmail = ({
  protocolo = 'N/A', // Protocolo da reclamação
  mensagem = 'Sua reclamação foi atualizada.', // Mensagem enviada pelo PROCON
  nomeConsumidor = 'Consumidor', // Nome do consumidor (opcional)
}) => (
  // O componente Preview é usado para definir o texto que aparece na caixa de entrada antes de abrir o e-mail.
  
  // O componente Html é o wrapper principal para o conteúdo do e-mail.
  <Html lang="pt-BR">
    <Preview>Atualização da sua Reclamação PROCON CMSGA - Protocolo: {protocolo}</Preview>
    {/* O componente Head é para metadados do e-mail, como título e estilos globais. */}
    <Head>
      <title>Atualização de Reclamação PROCON CMSGA</title>
      {/* Você pode adicionar estilos CSS inline ou links para folhas de estilo aqui se necessário,
          mas o react-email já otimiza muito do CSS. */}
      <style>
        {`
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #333333;
          }
          .container {
            border: 1px solid #eeeeee;
            border-radius: 8px;
            padding: 30px;
            margin: 20px auto;
            max-width: 600px;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          }
          .message-box {
            background-color: #f0f8ff;
            border-left: 4px solid #0d5193;
            padding: 15px;
            margin-top: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .footer-text {
            font-size: 12px;
            color: #777777;
            text-align: center;
            margin-top: 30px;
          }
        `}
      </style>
    </Head>

    {/* O componente Body é o corpo visível do e-mail. */}
    <Body style={{ backgroundColor: '#f6f9fc', margin: 0, padding: '20px 0' }}>
      {/* O componente Container centraliza o conteúdo do e-mail. */}
      <Container className="container">
        {/* Seção de cabeçalho */}
        <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5193' }}>PROCON</Text>
                    <Text style={{ fontSize: '12px', fontWeight: 'bold', color: '#0d5193' }}>Câmara Municipal de São Gonçalo do Amarante - Ceará</Text>

        </Section>

        {/* Mensagem principal */}
        <Text style={{ fontSize: '16px', color: '#333' }}>
          Prezado(a) {nomeConsumidor},
        </Text>
        <Text style={{ fontSize: '16px', color: '#333' }}>
          Sua reclamação com protocolo <strong>{protocolo}</strong> foi atualizada.
        </Text>

        {/* Caixa de mensagem do PROCON */}
        <Section className="message-box">
          <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d5193', marginBottom: '10px' }}>
            Mensagem do PROCON:
          </Text>
          <Text style={{ fontSize: '16px', color: '#333' }}>
            {mensagem}
          </Text>
        </Section>

        {/* Linha divisória */}
        <Hr style={{ borderColor: '#eeeeee', margin: '30px 0' }} />

        {/* Links úteis */}
        <Text style={{ fontSize: '14px', color: '#555', textAlign: 'center' }}>
          Para mais detalhes ou para acompanhar sua reclamação, acesse:
        </Text>
        <Section style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link
            href="https://procon.cmsga.ce.gov.br/meus-atendimentos" // Substitua pela URL real da sua página de atendimentos
            style={{
              backgroundColor: '#0d5193',
              color: '#ffffff',
              padding: '12px 25px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Acompanhar Reclamação
          </Link>
        </Section>

        {/* Rodapé do e-mail */}
        <Text style={{ fontSize: '14px', color: '#555', marginTop: '30px' }}>
          Atenciosamente,
        </Text>
        <Text style={{ fontSize: '14px', color: '#555' }}>
          Equipe PROCON
        </Text>
        <Text style={{ fontSize: '14px', color: '#555', marginTop: '-20px' }}>
          Câmara Municipal de São Gonçalo do Amarante - Ceará
        </Text>

        <Text className="footer-text" style={{ marginTop: '50px' }}>
          Este é um e-mail automático, por favor, não responda.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReclamacaoAtualizadaEmail;
