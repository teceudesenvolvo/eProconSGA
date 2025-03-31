import React, { Component } from 'react';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Importando imagem
import camera from '../assets/Camera.png';
import logo from '../assets/logo.png'
import signature from '../assets/assinatura-teste-1.png'

import MenuDashboard from '../componets/menuDashboard'

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class AddProducts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Identificação Básica
            tipoMateria: '',
            ano: '',
            numero: '',
            dataApresenta: '',
            protocolo: '',
            tipoApresentacao: '',
            tipoAutor: '',
            autor: '',
            
            
            // Outras Informações
            apelido: '',
            prazo: 'em',
            materiaPolemica: '',
            objeto: '',
            regTramita: '',
            status: '',
            dataPrazo:'',
            publicacao:'',
            isComplementar: '',
            
            // Origem Externa
            tipoMateriaExt:'',
            numeroMateriaExt: '',
            anoMateriaExt: '',
            dataMateriaExt: '',
            
            // Dados Textuais
            titulo: '',
            ementa: '',
            indexacao: '',
            observacao: '',

            file: null,
            pdfData: null
        };
    }


    handleFileChange = (e) => {
        this.setState({ file: e.target.files[0] });
    };

    handleGeneratePDF = () => {
        const { tipoMateria, ano, numero, dataApresenta, protocolo, tipoApresentacao, tipoAutor, autor, apelido,
            prazo, materiaPolemica, objeto, regTramita, status, dataPrazo, publicacao, isComplementar, tipoMateriaExt,
            numeroMateriaExt, anoMateriaExt, dataMateriaExt, titulo, ementa, indexacao, observacao
         } = this.state;

        const docDefinition = {
            content: [
                {
                    image: logo,
                    width: 80,
                    alignment: 'center'
                },
                {
                    text: 'Câmara Municipal de Teste',
                    alignment: 'center',
                    style: 'timbrado'
                },
                {
                    text: `Protocolo: ${protocolo}`,
                    alignment: 'center'
                },
                {
                    text: titulo,
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: 'Identificação da Materia',
                    alignment: 'center',
                    style: 'timbrado'
                },
                
                {
                    text: [
                        { text: 'Tipo de Materia: ', bold: true },
                        { text:  tipoMateria },
                    ], style: 'descricoes'
                },
                { text: 'Ano: ' + ano },
                { text: 'Numero: ' + numero },
                { text: 'Data: ' + dataApresenta },
                { text: 'Apresentação: ' + tipoApresentacao },
                { text: 'Materia Polêmica: ' + materiaPolemica },
                { text: 'Materia Complementar: ' + isComplementar },
                { text: 'Autor: ' + tipoAutor + " " + autor },

                {
                    text: 'Informações Complementares',
                    alignment: 'center',
                    style: 'timbrado'
                },
                { text: 'Apelido: ' + apelido },
                { text: 'Prazo: ' + prazo + ' dias' },
                { text: 'Matéria Polêmica: ' + materiaPolemica },
                { text: 'objeto: ' + objeto },
                { text: 'Regime de Tramitação: ' + regTramita },
                { text: 'Situação' + status },
                { text: 'Fim do Prazo: ' + dataPrazo },
                { text: 'Publicação: ' + publicacao },
                { text: 'Matéria Complementar: ' + isComplementar },
                
                // Origem Externa
                { text: tipoMateriaExt },
                { text: numeroMateriaExt },
                { text: anoMateriaExt },
                { text: dataMateriaExt },


                
                { text: 'Ementa: ' + ementa, style: 'descricoes' },
                { text: 'Indexação: ' + indexacao, style: 'descricoes' },
                { text: 'Observação: ' + observacao, style: 'descricoes' },
                {
                    image: signature,
                    width: 150,
                    alignment: 'center',
                    style: 'assinatura'
                },
                {
                    text: '___________________________________________________',
                    alignment: 'center',
                    style: 'underline'
                },
                {
                    text: autor,
                    alignment: 'center',
                    style: 'small'
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    marginBottom: 20,
                    marginTop: 20,
                },
                subheader: {
                    fontSize: 15,
                    bold: true
                },
                descricoes: {
                    marginTop: 20,
                },
                timbrado: {
                    fontSize: 12,
                    bold: true,
                    marginBottom: 20
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                },
                assinatura: {
                    marginTop: 50
                },
                underline: {
                    marginTop: -20
                }
            }
        };


        pdfMake.createPdf(docDefinition).getBase64((data) => {
            this.setState({ pdfData: data });
        });


    };

    componentDidMount = () => {
        this.handleGeneratePDF();
        setInterval(this.handleGeneratePDF, 30000);
    }




    render() {
        const { pdfData } = this.state;
        console.log(pdfData)

        return (
            <div className='App-header' >
                <MenuDashboard />
                <div className='conteinar-Add-Products'>
                    <div>
                        <form>
                            <h1>Realizar Reclamação</h1>
                            <p>Identificação Básica</p>
                            <select placeholder='Tipo de Materia' className='conteinar-Add-Products-select' onChange={(event) => this.setState({ tipoMateria: event.target.value })} onFocus={this.handleGeneratePDF}>
                                <option>Tipo de Reclamação</option>
                                <option>Jogos e Apostas</option>
                                <option>Outra Compra/Contratação</option>
                            </select>
                            <select placeholder='Classificação' className='conteinar-Add-Products-select' onChange={(event) => this.setState({ tipoMateria: event.target.value })} onFocus={this.handleGeneratePDF}>
                                <option>Área de Atuação</option>
                                <option>Água, Energia e Gás</option>
                                <option>Alimentos</option>
                                <option>Educação</option>
                                <option>Habitação</option>
                                <option>Produtos Automotivos</option>
                                <option>Produtos de Telefonia e Informática</option>
                                <option>Produtos Eletrodomésticos e Eletrônicos</option>
                                <option>Saúde </option>
                                <option>Serviços Financeiros </option>
                                <option>Telecomunicações </option>
                                <option>Transportes </option>
                                <option>Turismo/Viagens </option>
                                <option>Demais Produtos</option>
                                <option>Demais Serviços</option>
                            </select>
                            <input type="text" name="Assunto" placeholder="Assunto da Denuncia" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>
                            
                            <br/><label className='labelform-materia'>Detalhes da Reclamação</label><br/>
                            <select name="Procurou_Fonecedor" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Procurei o fornecedor para resolver?</option> 
                                <option value="Oral">Sim</option> 
                                <option value="Oral">Não</option>
                            </select> 
                            <select name="Formas de Aquisição" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Forma de Aquisição</option> 
                                <option value="Oral">Catalogo</option> 
                                <option value="Oral">Loja Física</option>
                                <option value="Oral">Loja Virtual ou Internet</option>
                                <option value="Oral">Não comprei ou não contratei</option>
                                <option value="Oral">Presente</option>
                                <option value="Oral">Stand, feira ou eventos</option>
                                <option value="Oral">Telefone</option>
                                <option value="Oral">Venda em domicílio</option>
                            </select> 
                            <select name="Tipo Contratação" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Tipo de Contratação</option> 
                                <option value="Oral">Produto</option> 
                                <option value="Oral">Serviço</option>
                            </select> 
                            <input type="date" name="dataContratacao" placeholder='Data da Compra' onChange={(event) => { this.setState({ dataApresenta: event.target.value }) }}  />
                            <input type="text" name="nomeServiço" placeholder="Nome do Serviço ou Plano" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>
                            <textarea name="detalheServiço" placeholder="Detalhes do Serviço ou Plano" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>

                            <select name="tipo_documento" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Tipo de Documento</option> 
                                <option value="NF">Nota Fiscal</option> 
                                <option value="Contrato">Contrato</option>
                                <option value="Ordem de Serviço">Ordem de Serviço</option>
                                <option value="Pedido">Pedido</option>
                                <option value="Outros">Outros</option>
                            </select>     
                            <input type="number" name="numeroDoc" placeholder="Número do documento" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>
                            <input type="date" name="dataOcorrencia" placeholder='Data da ocorrência ou serviço' onChange={(event) => { this.setState({ dataApresenta: event.target.value }) }}  />
                            <input type="date" name="dataNegativa" placeholder='Data de cancelamento, desistência ou negativa' onChange={(event) => { this.setState({ dataApresenta: event.target.value }) }}  />
                            
                            <select name="formaPagamento" class="conteinar-Add-Products-select" onChange={(event) => this.setState({ tipoApresentacao: event.target.value })} onFocus={this.handleGeneratePDF}> 
                                <option value="" selected="">Forma de Pagamento</option> 
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

                            <input type="number" name="valorCompra" placeholder="Valor da Compra" onChange={(event) => { this.setState({ numero: event.target.value }) }} onFocus={this.handleGeneratePDF}/>


                            
                            <p>Outras Informações</p>
                            
                            
                            <textarea name="Detalhes" placeholder="Descreva em detalhes sua reclamação" onChange={(event) => { this.setState({ prazo: event.target.value }) }}  onFocus={this.handleGeneratePDF}/>     
                            <select name="pedidoConsumidor" className='conteinar-Add-Products-select' onChange={(event) => this.setState({ materiaPolemica: event.target.value })} onFocus={this.handleGeneratePDF} >
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
                            <input type='number' name="Numero da Materia" placeholder="Numero da Materia Externa" onChange={(event) => { this.setState({ numeroMateriaExt: event.target.value }) }} onFocus={this.handleGeneratePDF} />     
                            


                           
                        </form>
                        <button type="button" onClick={this.handleGeneratePDF}>Protocolar Materia</button>
                    </div>
                    <div className='addImg'>
                        {pdfData && (
                            <iframe
                                title="Preview PDF"
                                src={`data:application/pdf;base64,${pdfData}`}
                                width="600"
                                height="800"
                                frameBorder="0"
                                className='addImg'
                            />
                        )}
                        {!pdfData && (
                            <div>
                                <img src={camera} alt={camera} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default AddProducts;
