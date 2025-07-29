// functions/index.js
const functions = require("firebase-functions");
const fetch = require("node-fetch");

// --- CONFIGURAÇÕES CHAVE DO EMAILJS ---
// Você DEVE configurar estas chaves de API usando o Firebase CLI
// no seu terminal (na raiz do projeto Firebase):
// firebase functions:config:set emailjs.service_id="service_z4k1d0m" \
//   emailjs.template_id="template_0zdsxiw" \
//   emailjs.user_id="TtE0io7wrvJ8m5Wqq"
const EMAILJS_SERVICE_ID = functions.config().emailjs.service_id;
const EMAILJS_TEMPLATE_ID = functions.config().emailjs.template_id;
const EMAILJS_USER_ID = functions.config().emailjs.user_id;

// Endpoint da API do EmailJS
const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "https://procon.cmsga.ce.gov.br/");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Responde às requisições OPTIONS (preflight requests)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Garante que a requisição é um POST
  if (req.method !== "POST") {
    return res.status(405).send({message: "Método não permitido."});
  }

  // Garante que o corpo da requisição é JSON
  if (req.headers["content-type"] !== "application/json") {
    return res.status(400).send(
        {message: "Content-Type deve ser application/json."},
    );
  }

  // Recebe os dados do frontend
  // O "to" (email do destinatário) e "subject" (assunto) ainda são relevantes.
  // "protocolo", "mensagem", "nomeConsumidor" serão os template_params.
  const {to, subject, protocolo, mensagem, nomeConsumidor} = req.body;

  // Validação básica dos parâmetros
  if (!to || !subject || !protocolo || !mensagem) {
    return res.status(400).send({
      message: "Parâmetros \"to\", \"subject\", \"protocolo\" e \"mensagem\" " +
               "são obrigatórios.",
    });
  }

  // Verifica se as credenciais do EmailJS estão configuradas
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
    console.error("Credenciais do EmailJS não configuradas nas variáveis " +
                  "de ambiente do Firebase Functions.");
    return res.status(500).send(
        {message: "Falha na configuração do serviço de e-mail."},
    );
  }

  try {
    // Os dados abaixo serão passados como `template_params` para o EmailJS.
    const templateParams = {
      to_email: to,
      subject: subject,
      protocolo: protocolo,
      mensagem: mensagem,
      nomeConsumidor: nomeConsumidor,
    };

    const emailjsPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_USER_ID,
      template_params: templateParams,
    };

    const response = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailjsPayload),
    });

    if (response.ok) {
      console.log("E-mail enviado com sucesso via EmailJS para:", to);
      return res.status(200).send({message: "E-mail enviado com sucesso!"});
    } else {
      const errorData = await response.json();
      console.error("Erro na resposta da API do EmailJS:", errorData);
      return res.status(response.status).send({
        message: `Falha ao enviar e-mail: ${errorData.text ||
                  response.statusText}`,
        error: errorData,
      });
    }
  } catch (error) {
    console.error("Erro ao chamar a API do EmailJS:", error);
    return res.status(500).send({
      message: "Falha ao enviar e-mail. Verifique a conexão ou as " +
               "credenciais do EmailJS.",
      error: error.message,
    });
  }
});
