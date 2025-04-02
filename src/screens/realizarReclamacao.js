import React, { useState } from 'react';
import MenuDashboard from '../componets/menuDashboard';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddProducts = () => {
  const [formData, setFormData] = useState({
    tipoReclamacao: '',
    classificacao: '',
    assuntoDenuncia: '',
    procurouFornecedor: '',
    formaAquisicao: '',
    tipoContratacao: '',
    dataContratacao: '',
    nomeServico: '',
    detalheServico: '',
    tipoDocumento: '',
    numeroDoc: '',
    dataOcorrencia: '',
    dataNegativa: '',
    formaPagamento: '',
    valorCompra: '',
    detalhesReclamacao: '',
    pedidoConsumidor: '',
    numeroMateriaExt: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarReclamacaoParaFirebase = async (data) => {
    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        console.error('Usuário não autenticado.');
        return;
      }

      // Remover campos undefined
      const reclamacaoData = {};
      for (const key in data) {
        if (data[key] !== undefined) {
          reclamacaoData[key] = data[key];
        }
      }

      reclamacaoData.userId = userId;
      reclamacaoData.timestamp = new Date();

      const docRef = await addDoc(collection(db, 'reclamacoes'), reclamacaoData);

      console.log('Reclamação enviada com sucesso! ID do documento:', docRef.id);
    } catch (error) {
      console.error('Erro ao enviar reclamação para o Firebase:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await enviarReclamacaoParaFirebase(formData); // Enviar formData diretamente
    console.log(formData);
  };

  return (
    <div className="App-header">
      <MenuDashboard />
      <div className="conteinar-Add-Products">
        <div>
          <form onSubmit={handleSubmit}>
            {/* Seus inputs e selects aqui */}
            <select
              name="tipoMateria"
              className="conteinar-Add-Products-select"
              value={formData.tipoReclamacao}
              onChange={handleChange}
            >
              <option value="">Tipo de Reclamação</option>
              <option value="Jogos e Apostas">Jogos e Apostas</option>
              <option value="Outra Compra/Contratação">Outra Compra/Contratação</option>
            </select>
            <select
              name="classificacao"
              className="conteinar-Add-Products-select"
              value={formData.classificacao}
              onChange={handleChange}
            >
              <option value="">Área de Atuação</option>
              <option value="Agua">Água, Energia e Gás</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Educacao">Educação</option>
              <option value="Habitacao">Habitação</option>
              <option value="Produtos Automotivos">Produtos Automotivos</option>
              <option value="Produtos de Telefonia e Informática">Produtos de Telefonia e Informática</option>
              <option value="Produtos Eletrodomésticos e Eletrônicos">Produtos Eletrodomésticos e Eletrônicos</option>
              <option value="Saude">Saúde</option>
              <option value="Servicos Financeiros">Serviços Financeiros</option>
              <option value="Telecomunicacoes">Telecomunicações</option>
              <option value="Transportes">Transportes</option>
              <option value="Turismo/Viagens">Turismo/Viagens</option>
              <option value="Demais Produtos">Demais Produtos</option>
              <option value="Demais Serviços">Demais Serviços</option>
            </select>
            <input
              type="text"
              name="assuntoDenuncia"
              placeholder="Assunto da Denuncia"
              value={formData.assuntoDenuncia}
              onChange={handleChange}
            />
            <br />
            <label className="labelform-materia">Detalhes da Reclamação</label>
            <br />
            <select
              name="procurouFornecedor"
              className="conteinar-Add-Products-select"
              value={formData.procurouFornecedor}
              onChange={handleChange}
            >
              <option value="">Procurei o fornecedor para resolver?</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
            <select
              name="formaAquisicao"
              className="conteinar-Add-Products-select"
              value={formData.formaAquisicao}
              onChange={handleChange}
            >
              <option value="">Forma de Aquisição</option>
              <option value="Catalogo">Catalogo</option>
              <option value="Loja Física">Loja Física</option>
              <option value="Loja Virtual ou Internet">Loja Virtual ou Internet</option>
              <option value="Não comprei ou não contratei">Não comprei ou não contratei</option>
              <option value="Presente">Presente</option>
              <option value="Stand, feira ou eventos">Stand, feira ou eventos</option>
              <option value="Telefone">Telefone</option>
              <option value="Venda em domicílio">Venda em domicílio</option>
            </select>
            <select
              name="tipoContratacao"
              className="conteinar-Add-Products-select"
              value={formData.tipoContratacao}
              onChange={handleChange}
            >
              <option value="">Tipo de Contratação</option>
              <option value="Produto">Produto</option>
              <option value="Serviço">Serviço</option>
            </select>
            <input
              type="date"
              name="dataContratacao"
              placeholder="Data da Compra"
              value={formData.dataContratacao}
              onChange={handleChange}
            />
            <input
              type="text"
              name="nomeServico"
              placeholder="Nome do Serviço ou Plano"
              value={formData.nomeServico}
              onChange={handleChange}
            />
            <textarea
              name="detalheServico"
              placeholder="Detalhes do Serviço ou Plano"
              value={formData.detalheServico}
              onChange={handleChange}
            />
            <select
              name="tipoDocumento"
              className="conteinar-Add-Products-select"
              value={formData.tipoDocumento}
              onChange={handleChange}
            >
              <option value="">Tipo de Documento</option>
              <option value="NF">Nota Fiscal</option>
              <option value="Contrato">Contrato</option>
              <option value="Ordem de Serviço">Ordem de Serviço</option>
              <option value="Pedido">Pedido</option>
              <option value="Outros">Outros</option>
            </select>
            <input
              type="number"
              name="numeroDoc"
              placeholder="Número do documento"
              value={formData.numeroDoc}
              onChange={handleChange}
            />
            <input
              type="date"
              name="dataOcorrencia"
              placeholder="Data da ocorrência ou serviço"
              value={formData.dataOcorrencia}
              onChange={handleChange}
            />
            <input
              type="date"
              name="dataNegativa"
              placeholder="Data de cancelamento, desistência ou negativa"
              value={formData.dataNegativa}
              onChange={handleChange}
            />
            <select
              name="formaPagamento"
              className="conteinar-Add-Products-select"
              value={formData.formaPagamento}
              onChange={handleChange}
            >
              <option value="">Forma de Pagamento</option>
              <option value="Boleto Bancário">Boleto Bancário</option>
              <option value="Cartão">Cartão</option>
              <option value="Cheque">Cheque</option>
              <option value="Débito em Conta Corrente">Débito em Conta Corrente</option>
              <option value="Débito em Conta Poupança">Débito em Conta Poupança</option>
              <option value="Dinheiro (espécie)">Dinheiro (espécie)</option>
              <option value="Fatura">Fatura</option>
              <option value="Intermediadoras de Pagamento">Intermediadoras de Pagamento</option>
              <option value="Não Informado">Não Informado</option>
              <option value="Pix">Pix</option>
            </select>
            <input
              type="number"
              name="valorCompra"
              placeholder="Valor da Compra"
              value={formData.valorCompra}
              onChange={handleChange}
            />
            <p>Outras Informações</p>
            <textarea
              name="detalhesReclamacao"
              placeholder="Descreva em detalhes sua reclamação"
              value={formData.detalhesReclamacao}
              onChange={handleChange}
            />
            <select
              name="pedidoConsumidor"
              className="conteinar-Add-Products-select"
              value={formData.pedidoConsumidor}
              onChange={handleChange}
            >
              <option value="">Pedido do Consumidor</option>
              <option value="cancelamento">Cancelamento da compra/serviço com restituição do valor pago</option>
              <option value="Conserto do produto">Conserto do produto</option>
              <option value="Cumprimento a oferta">Cumprimento a oferta</option>
              <option value="Devolução proporcional/total do valor cobrado/pago">Devolução proporcional/total do valor cobrado/pago</option>
              <option value="Entrega imediata do produto/serviço">Entrega imediata do produto/serviço</option>
              <option value="Reexecução do serviço">Reexecução do serviço</option>
              <option value="Substituição do produto/serviço">Substituição do produto/serviço</option>
              <option value="Outros (Exceto indenização por danos morais, que só podem ser solicitadas através de ação judicial">Outros (Exceto indenização por danos morais, que só podem ser solicitadas através de ação judicial</option>
            </select>
            <p>Anexos</p>
            <input
              type="number"
              name="numeroMateriaExt"
              placeholder="Numero da Materia Externa"
              value={formData.numeroMateriaExt}
              onChange={handleChange}
            />
            <button type="submit">Protocolar Materia</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;