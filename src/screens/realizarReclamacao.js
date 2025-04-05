import React, { useEffect, useState } from 'react';
import MenuDashboard from '../componets/menuDashboard';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useNavigate, useLocation } from 'react-router-dom';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
        arquivos: [],
        cnpj: '', // Adiciona o campo CNPJ ao state
    });

    const [empresaInfo, setEmpresaInfo] = useState(null);
    const [cnpjError, setCnpjError] = useState('');
    const [loadingCnpj, setLoadingCnpj] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const [fileInputKey] = useState(Date.now());
    const [fileErrors, setFileErrors] = useState([]);
    const [fileCount, setFileCount] = useState(0);

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            localStorage.setItem('paginaAnterior', location.pathname);
            navigate('/login');
        }
    }, [navigate, location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'cnpj') {
            setEmpresaInfo(null); // Limpa as informações da empresa ao digitar um novo CNPJ
            setCnpjError('');
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const errors = [];
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];

        const validatedFiles = Array.from(files).filter(file => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`O arquivo "${file.name}" não é um formato permitido. Use .png, .jpg ou .pdf.`);
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                errors.push(`O arquivo "${file.name}" excede o limite de 2MB.`);
                return false;
            }
            return true;
        });

        const filePromises = validatedFiles.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        data: event.target.result,
                    });
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises)
            .then((fileData) => {
                setFormData({
                    ...formData,
                    arquivos: fileData,
                });
                setFileCount(validatedFiles.length);
                setFileErrors(errors);
            })
            .catch((error) => console.error('Erro ao converter arquivos:', error));
    };

    const buscarEmpresaPorCnpj = async () => {
        const cnpj = formData.cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cnpj.length !== 14) {
            setCnpjError('CNPJ inválido');
            setEmpresaInfo(null);
            return;
        }
        setCnpjError('');
        setLoadingCnpj(true);
        setEmpresaInfo(null);

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (response.ok) {
                const data = await response.json();
                setEmpresaInfo(data);
            } else {
                const errorData = await response.json();
                setCnpjError(errorData.message || 'Erro ao buscar CNPJ');
            }
        } catch (error) {
            setCnpjError('Erro ao conectar com a API');
            console.error('Erro ao buscar CNPJ:', error);
        } finally {
            setLoadingCnpj(false);
        }
    };

    const gerarProtocolo = (comprimento = 10) => {
        let protocolo = '';
        for (let i = 0; i < comprimento; i++) {
            protocolo += Math.floor(Math.random() * 10);
        }
        return protocolo;
    };

    const gerarPDF = (protocolo, formData) => {
        const documentDefinition = {
            content: [
                { text: 'Protocolo: ' + protocolo, style: 'header' },
                { text: 'Tipo de Reclamação: ' + formData.tipoReclamacao },
                { text: 'Classificação: ' + formData.classificacao },
                { text: 'Assunto da Denúncia: ' + formData.assuntoDenuncia },
                { text: 'CNPJ da Empresa: ' + formData.cnpj },
                { text: 'Nome da Empresa: ' + (empresaInfo?.razao_social || 'Não Informado') },
                // Adicione outros campos do formulário aqui
            ],
            styles: {
                header: { fontSize: 18, bold: true },
            },
        };

        pdfMake.createPdf(documentDefinition).download('reclamacao_' + protocolo + '.pdf');
    };

    const enviarReclamacaoParaFirebase = async (data, protocolo) => {
        try {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.error('Usuário não autenticado.');
                return;
            }

            const reclamacaoData = {
                ...data,
                userId: userId,
                cpf: '', // Você pode querer buscar o CPF do localStorage ou de outro lugar
                timestamp: new Date(),
                protocolo: protocolo,
                nomeEmpresaReclamada: empresaInfo?.razao_social || '',
            };

            const docRef = await addDoc(collection(db, 'reclamacoes'), reclamacaoData);

            console.log('Reclamação enviada com sucesso! ID do documento:', docRef.id);
        } catch (error) {
            console.error('Erro ao enviar reclamação para o Firebase:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const protocolo = gerarProtocolo();
        await enviarReclamacaoParaFirebase(formData, protocolo);
        gerarPDF(protocolo, formData);
        console.log(formData);
        window.location.pathname = '/meus-atendimentos';
    };

    return (
        <div className="App-header">
            <MenuDashboard />
            <div className="formRealizarReclamacao">
                <div className='atualizeData formRealizarReclamacao'>
                    <h3>Faça sua reclamação</h3>
                    <form onSubmit={handleSubmit}>
                        <p>Informações Principais</p>
                        <select
                            name="tipoReclamacao"
                            className="conteinar-Add-Products-select"
                            value={formData.tipoReclamacao}
                            onChange={handleChange}
                        >
                            <option value="">Tipo de Reclamação</option>
                            <option value="Outra Compra/Contratação">Compra de Produto</option>
                            <option value="Outra Compra/Contratação">Contratação de Serviço</option>
                            <option value="Jogos e Apostas">Jogos e Apostas</option>
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
                            className="conteinar-Add-Products-select"
                            type="text"
                            name="assuntoDenuncia"
                            placeholder="Assunto da Denuncia"
                            value={formData.assuntoDenuncia}
                            onChange={handleChange}
                        />
                        <br />
                        <label className="labelform-materia">Empresa Reclamada:</label><br />
                        <input
                            className="conteinar-Add-Products-select"
                            type="text"
                            name="cnpj"
                            placeholder="Digite o CNPJ"
                            value={formData.cnpj}
                            onChange={handleChange}
                        /><br />
                        <button className='buttonLogin btnComentario' type="button" onClick={buscarEmpresaPorCnpj} disabled={loadingCnpj}>
                            {loadingCnpj ? 'Buscando...' : 'Buscar Empresa'}
                        </button>
                        {cnpjError && <p style={{ color: 'red' }}>{cnpjError}</p>}
                        {empresaInfo && (
                            <p>
                                <strong>Empresa:</strong> {empresaInfo.razao_social}
                                {empresaInfo.fantasia && ` (${empresaInfo.fantasia})`}
                            </p>
                        )}
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
                        <br /><label className="labelform-materia">Data da contratação</label><br />
                        <input
                            className="conteinar-Add-Products-select"
                            type="date"
                            name="dataContratacao"
                            placeholder="Data da Compra"
                            value={formData.dataContratacao}
                            onChange={handleChange}
                        />
                        <input
                            className="conteinar-Add-Products-select"
                            type="text"
                            name="nomeServico"
                            placeholder="Nome do Serviço ou Plano"
                            value={formData.nomeServico}
                            onChange={handleChange}
                        />
                        <textarea
                            id="comentarios"
                            className="conteinar-Add-Products-select"
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
                            className="conteinar-Add-Products-select"
                            type="number"
                            name="numeroDoc"
                            placeholder="Número do documento"
                            value={formData.numeroDoc}
                            onChange={handleChange}
                        />
                        <br /><label className="labelform-materia">Data da ocorrência</label><br />
                        <input
                            className="conteinar-Add-Products-select"
                            type="date"
                            name="dataOcorrencia"
                            placeholder="Data da ocorrência ou serviço"
                            value={formData.dataOcorrencia}
                            onChange={handleChange}
                        />

                        <br /><label className="labelform-materia">Data do cancelamento, desistência ou negativa</label><br />

                        <input
                            className="conteinar-Add-Products-select"
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
                            className="conteinar-Add-Products-select"
                            type="number"
                            name="valorCompra"
                            placeholder="Valor da Compra"
                            value={formData.valorCompra}
                            onChange={handleChange}
                        />
                        <p>Outras Informações</p>
                        <textarea
                            id="comentarios"
                            className="conteinar-Add-Products-select"
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
                        <label>
                            Selecione arquivos (máximo 2MB por arquivo, formatos: .png, .jpg, .pdf)
                            <input
                                key={fileInputKey}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept=".png,.jpg,.jpeg,.pdf"
                                className='buttonLogin btnUpload'
                            />
                        </label>
                        {fileCount > 0 && <p>{fileCount} arquivos selecionados</p>}
                        {fileErrors.map((error, index) => (
                            <p key={index} style={{ color: 'red' }}>{error}</p>
                        ))}
                        <br />
                        <button type="submit" className='buttonLogin btnLogin'>Enviar Reclamação</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProducts;