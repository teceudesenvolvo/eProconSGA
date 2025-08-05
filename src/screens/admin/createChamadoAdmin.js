import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Adicionado query, where, getDocs
import { db } from '../../firebase';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuAdmin from '../../componets/menuAdmin'; 
import LogoProcon from '../../assets/Procon-logo03.png'; // Importe a logo do Procon

pdfMake.vfs = pdfFonts.vfs;

// Lista de UFs do Brasil
const ufsBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

const AddProducts = () => {
    const [activeTab, setActiveTab] = useState(1); // 1: Dados do Usuário, 2: Detalhes da Reclamação, 3: Anexos e Envio

    const [userFormData, setUserFormData] = useState({
        nome: '',
        email: '',
        cpf: '', // CPF é o primeiro campo para busca
        telefone: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        municipio: '',
        ufEmissor: '',
        estadoCivil: '',
        sexo: '',
    });

    const [reclamacaoFormData, setReclamacaoFormData] = useState({
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
        cnpj: '',
    });

    const [fileData, setFileData] = useState([]);
    const [empresaInfo, setEmpresaInfo] = useState(null);
    const [cnpjError, setCnpjError] = useState('');
    const [loadingCnpj, setLoadingCnpj] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [cepError, setCepError] = useState('');
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [fileErrors, setFileErrors] = useState([]);
    const [fileCount, setFileCount] = useState(0);

    const [loadingCpfSearch, setLoadingCpfSearch] = useState(false); // NOVO: Estado para carregamento da busca por CPF
    const [cpfSearchError, setCpfSearchError] = useState(''); // NOVO: Estado para erro da busca por CPF

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            localStorage.setItem('paginaAnterior', location.pathname);
            navigate('/login');
        }
    }, [navigate, location]);

    const buscarUsuarioPorCpf = async (cpf) => {
        const cleanedCpf = cpf.replace(/\D/g, '');
        if (cleanedCpf.length !== 11) {
            setCpfSearchError('');
            return;
        }

        setLoadingCpfSearch(true);
        setCpfSearchError('');
        
        try {
            const usersCollectionRef = collection(db, 'users');
            // Consulta na coleção 'users' filtrando pelo campo 'cpf'
            const q = query(usersCollectionRef, where('cpf', '==', cleanedCpf));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDataFound = querySnapshot.docs[0].data();
                setUserFormData(prevData => ({
                    ...prevData,
                    ...userDataFound, // Preenche todos os campos com os dados encontrados
                    // Garante que o CPF no formulário seja o pesquisado
                    cpf: cleanedCpf, 
                }));
                setCpfSearchError('');
                // Se o CEP do usuário encontrado estiver preenchido, tenta buscar o endereço
                if (userDataFound.cep && userDataFound.cep.replace(/\D/g, '').length === 8) {
                    await buscarEnderecoPorCep(userDataFound.cep);
                }
            } else {
                setCpfSearchError('CPF não encontrado. Preencha os dados manualmente.');
                // Limpa os campos se o CPF não for encontrado, exceto o CPF digitado
                setUserFormData(prevData => ({
                    ...prevData,
                    nome: '',
                    email: '',
                    telefone: '',
                    cep: '',
                    endereco: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    municipio: '',
                    ufEmissor: '',
                    estadoCivil: '',
                    sexo: '',
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar usuário por CPF:', error);
            setCpfSearchError('Erro ao buscar CPF. Tente novamente.');
        } finally {
            setLoadingCpfSearch(false);
        }
    };

    const handleUserChange = async (e) => {
        const { name, value } = e.target;
        setUserFormData({ ...userFormData, [name]: value });

        if (name === 'cpf') {
            const cleanedCpf = value.replace(/\D/g, '');
            if (cleanedCpf.length === 11) {
                await buscarUsuarioPorCpf(cleanedCpf);
            } else {
                setCpfSearchError('');
                // Limpa os campos se o CPF não estiver completo
                setUserFormData(prevData => ({
                    ...prevData,
                    nome: '',
                    email: '',
                    telefone: '',
                    cep: '',
                    endereco: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    municipio: '',
                    ufEmissor: '',
                    estadoCivil: '',
                    sexo: '',
                }));
            }
        } else if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            await buscarEnderecoPorCep(value);
        } else if (name === 'cep') {
            setCepError('');
            setUserFormData(prevData => ({
                ...prevData,
                endereco: '',
                bairro: '',
                municipio: '',
                ufEmissor: ''
            }));
        }
    };

    const buscarEnderecoPorCep = async (cep) => {
        const cleanedCep = cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) {
            setCepError('CEP inválido');
            return;
        }

        setCepError('');
        setLoadingCep(true);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                setCepError('CEP não encontrado.');
                setUserFormData(prevData => ({
                    ...prevData,
                    endereco: '',
                    bairro: '',
                    municipio: '',
                    ufEmissor: ''
                }));
            } else {
                setUserFormData(prevData => ({
                    ...prevData,
                    endereco: data.logradouro || '',
                    bairro: data.bairro || '',
                    municipio: data.localidade || '',
                    ufEmissor: data.uf || ''
                }));
            }
        } catch (error) {
            setCepError('Erro ao buscar CEP.');
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setLoadingCep(false);
        }
    };

    const handleReclamacaoChange = (e) => {
        setReclamacaoFormData({ ...reclamacaoFormData, [e.target.name]: e.target.value });
        if (e.target.name === 'cnpj') {
            setEmpresaInfo(null);
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
            if (file.size > 2 * 1024 * 1024) { // 2MB limite
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
                        data: event.target.result, // Base64
                    });
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises)
            .then((data) => {
                setFileData(data);
                setFileCount(validatedFiles.length);
                setFileErrors(errors);
            })
            .catch((error) => console.error('Erro ao converter arquivos:', error));
    };

    const buscarEmpresaPorCnpj = async () => {
        const cnpj = reclamacaoFormData.cnpj.replace(/\D/g, '');
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

    const handleNextTab = () => {
        // Validação da primeira aba antes de avançar
        if (activeTab === 1) {
            const { nome, email, cpf, telefone, estadoCivil, sexo, ufEmissor, endereco, numero, bairro, municipio } = userFormData;
            if (!nome || !email || !cpf || !telefone || !estadoCivil || !sexo || !ufEmissor || !endereco || !numero || !bairro || !municipio) {
                alert('Por favor, preencha todos os campos obrigatórios de Dados do Usuário.');
                return;
            }
        } else if (activeTab === 2) {
            const { tipoReclamacao, classificacao, assuntoDenuncia, cnpj, procurouFornecedor, formaAquisicao, tipoContratacao, dataContratacao, nomeServico, detalheServico, tipoDocumento, numeroDoc, dataOcorrencia, dataNegativa, formaPagamento, valorCompra, detalhesReclamacao, pedidoConsumidor } = reclamacaoFormData;
            if (!tipoReclamacao || !classificacao || !assuntoDenuncia || !cnpj || !procurouFornecedor || !formaAquisicao || !tipoContratacao || !dataContratacao || !nomeServico || !detalheServico || !tipoDocumento || !numeroDoc || !dataOcorrencia || !dataNegativa || !formaPagamento || !valorCompra || !detalhesReclamacao || !pedidoConsumidor) {
                alert('Por favor, preencha todos os campos obrigatórios de Detalhes da Reclamação.');
                return;
            }
        }
        setActiveTab(prev => prev + 1);
    };

    const handlePrevTab = () => {
        setActiveTab(prev => prev - 1);
    };

    const gerarProtocolo = (comprimento = 10) => {
        let protocolo = '';
        for (let i = 0; i < comprimento; i++) {
            protocolo += Math.floor(Math.random() * 10);
        }
        return protocolo;
    };

    const gerarPDF = (protocolo, userForm, reclamacaoForm, empresaInfo) => {
        const documentDefinition = {
            content: [
                {image: `${LogoProcon}`, width: 100, alignment: 'center'},
                { text: 'PROCON CMSGA', style: 'header' },
                { text: `Câmara Municpal de São Gonçalo do Amarante - CE`, style: 'subheader' },
                { text: `Protocolo: ${protocolo}`, style: 'subheader' },
                { text: '\nDados do Requerente:', style: 'sectionHeader' },
                { text: `Nome: ${userForm.nome}`, margin: [0, 5] },
                { text: `Email: ${userForm.email}`, margin: [0, 5] },
                { text: `CPF: ${userForm.cpf}`, margin: [0, 5] },
                { text: `Telefone: ${userForm.telefone}`, margin: [0, 5] },
                { text: `Endereço: ${userForm.endereco}, ${userForm.numero} - ${userForm.bairro}, ${userForm.municipio} - ${userForm.ufEmissor}, CEP: ${userForm.cep}`, margin: [0, 5] },
                { text: `Estado Civil: ${userForm.estadoCivil}`, margin: [0, 5] },
                { text: `Sexo: ${userForm.sexo}`, margin: [0, 5] },

                { text: '\nDados da Empresa Reclamada:', style: 'sectionHeader' },
                { text: `CNPJ: ${reclamacaoForm.cnpj}`, margin: [0, 5] },
                { text: `Razão Social: ${empresaInfo?.razao_social || 'Não Informado'}`, margin: [0, 5] },
                { text: `Nome Fantasia: ${empresaInfo?.fantasia || 'Não Informado'}`, margin: [0, 5] },

                { text: '\nDetalhes da Reclamação:', style: 'sectionHeader' },
                { text: `Tipo de Reclamação: ${reclamacaoForm.tipoReclamacao}`, margin: [0, 5] },
                { text: `Classificação: ${reclamacaoForm.classificacao}`, margin: [0, 5] },
                { text: `Assunto da Denúncia: ${reclamacaoForm.assuntoDenuncia}`, margin: [0, 5] },
                { text: `Procurou o Fornecedor: ${reclamacaoForm.procurouFornecedor}`, margin: [0, 5] },
                { text: `Forma de Aquisição: ${reclamacaoForm.formaAquisicao}`, margin: [0, 5] },
                { text: `Tipo de Contratação: ${reclamacaoForm.tipoContratacao}`, margin: [0, 5] },
                { text: `Data da Contratação: ${reclamacaoForm.dataContratacao}`, margin: [0, 5] },
                { text: `Nome do Serviço/Plano: ${reclamacaoForm.nomeServico}`, margin: [0, 5] },
                { text: `Detalhes do Serviço/Plano: ${reclamacaoForm.detalheServico}`, margin: [0, 5] },
                { text: `Tipo de Documento: ${reclamacaoForm.tipoDocumento}`, margin: [0, 5] },
                { text: `Número do Documento: ${reclamacaoForm.numeroDoc}`, margin: [0, 5] },
                { text: `Data da Ocorrência: ${reclamacaoForm.dataOcorrencia}`, margin: [0, 5] },
                { text: `Data de Cancelamento/Negativa: ${reclamacaoForm.dataNegativa}`, margin: [0, 5] },
                { text: `Forma de Pagamento: ${reclamacaoForm.formaPagamento}`, margin: [0, 5] },
                { text: `Valor da Compra: R$ ${reclamacaoForm.valorCompra}`, margin: [0, 5] },
                { text: `Descrição Detalhada: ${reclamacaoForm.detalhesReclamacao}`, margin: [0, 5] },
                { text: `Pedido do Consumidor: ${reclamacaoForm.pedidoConsumidor}`, margin: [0, 5] },
            ],
            styles: {
                header: { fontSize: 15, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                sectionHeader: { fontSize: 10, bold: true, margin: [0, 15, 0, 5], decoration: 'underline' },
            },
            defaultStyle: {
                fontSize: 10,
            }
        };

        pdfMake.createPdf(documentDefinition).download(`reclamacao_${protocolo}.pdf`);
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();

        // O identificador do usuário será o e-mail
        const userEmail = userFormData.email;
        if (!userEmail) {
            alert('Erro: O e-mail do usuário não foi fornecido. Por favor, preencha os dados do usuário na primeira aba.');
            setActiveTab(1); // Volta para a aba de dados do usuário
            return;
        }

        const protocolo = gerarProtocolo();

        try {
            const reclamacaoDataFinal = {
                ...reclamacaoFormData,
                userEmail: userEmail, // Salva o e-mail do usuário na reclamação
                timestamp: new Date().toISOString(),
                protocolo: protocolo,
                nomeEmpresaReclamada: empresaInfo?.razao_social || '',
                arquivos: fileData, // Inclui os arquivos em base64
                status: 'Em Análise', // Status inicial da reclamação
                // Inclui os dados do usuário diretamente na reclamação para facilitar a consulta
                userDataAtTimeOfComplaint: userFormData,
            };

            const docRef = await addDoc(collection(db, 'reclamacoes'), reclamacaoDataFinal);

            console.log('Reclamação enviada com sucesso! ID do documento:', docRef.id);
            gerarPDF(protocolo, userFormData, reclamacaoFormData, empresaInfo);
            alert('Reclamação registrada com sucesso!');
            
            // Resetar o input de arquivo após o envio bem-sucedido
            setFileInputKey(Date.now());

            // Redirecionamento para a página de atendimentos do admin
            navigate('/atendimentos-sga-hyo6d27');
        } catch (error) {
            console.error('Erro ao enviar reclamação para o Firebase:', error);
            alert('Erro ao registrar reclamação. Tente novamente.');
        }
    };


    return (
        <div className="App-header">
            <MenuAdmin/>
            <div className="form-container-tabs">
                <div className="tabs-header">
                    <button className={`tab-button ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                        1. Dados do Usuário
                    </button>
                    <button className={`tab-button ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)} disabled={activeTab < 2}>
                        2. Detalhes da Reclamação
                    </button>
                    <button className={`tab-button ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)} disabled={activeTab < 3}>
                        3. Anexos e Envio
                    </button>
                </div>

                <div className="tab-content">
                    {/* Aba 1: Dados do Usuário */}
                    {activeTab === 1 && (
                        <form onSubmit={(e) => { e.preventDefault(); handleNextTab(); }} className="form-section">
                            <h3>Dados do Requerente</h3>
                            
                            {/* NOVO: Campo CPF primeiro */}
                            <input
                                className="form-input"
                                type="text"
                                name="cpf"
                                placeholder="CPF"
                                value={userFormData.cpf}
                                onChange={handleUserChange}
                                required
                            />
                            {loadingCpfSearch && <p className="loading-message-small">Buscando CPF...</p>}
                            {cpfSearchError && <p className="error-message">{cpfSearchError}</p>}

                            <input
                                className="form-input"
                                type="text"
                                name="nome"
                                placeholder="Nome Completo"
                                value={userFormData.nome}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={userFormData.email}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="telefone"
                                placeholder="Telefone"
                                value={userFormData.telefone}
                                onChange={handleUserChange}
                                required
                            />
                            {/* Campo Estado Civil como select */}
                            <select
                                className="form-input"
                                name="estadoCivil"
                                value={userFormData.estadoCivil}
                                onChange={handleUserChange}
                                required
                            >
                                <option value="">Selecione o Estado Civil</option>
                                <option value="Solteiro">Solteiro</option>
                                <option value="Casado">Casado</option>
                                <option value="Viúvo">Viúvo</option>
                                <option value="Divorciado">Divorciado</option>
                            </select>
                            {/* Campo Sexo como select */}
                            <select
                                className="form-input"
                                name="sexo"
                                value={userFormData.sexo}
                                onChange={handleUserChange}
                                required
                            >
                                <option value="">Selecione o Sexo</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outros">Outros</option>
                            </select>
                            <input
                                className="form-input"
                                type="text"
                                name="cep"
                                placeholder="CEP"
                                value={userFormData.cep}
                                onChange={handleUserChange}
                                onBlur={(e) => buscarEnderecoPorCep(e.target.value)}
                                disabled={loadingCep}
                            />
                            {loadingCep && <p className="loading-message-small">Buscando CEP...</p>}
                            {cepError && <p className="error-message">{cepError}</p>}

                            <input
                                className="form-input"
                                type="text"
                                name="endereco"
                                placeholder="Endereço"
                                value={userFormData.endereco}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="numero"
                                placeholder="Número"
                                value={userFormData.numero}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="complemento"
                                placeholder="Complemento (Opcional)"
                                value={userFormData.complemento}
                                onChange={handleUserChange}
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="bairro"
                                placeholder="Bairro"
                                value={userFormData.bairro}
                                onChange={handleUserChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="municipio"
                                placeholder="Cidade"
                                value={userFormData.municipio}
                                onChange={handleUserChange}
                                required
                            />
                            {/* Campo UF como select */}
                            <select
                                className="form-input"
                                name="ufEmissor"
                                value={userFormData.ufEmissor}
                                onChange={handleUserChange}
                                required
                            >
                                <option value="">Selecione a UF</option>
                                {ufsBrasil.map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                            <button type="submit" className="buttonLogin btnNext" disabled={loadingCep || loadingCpfSearch}>
                                Próximo
                            </button>
                        </form>
                    )}

                    {/* Aba 2: Detalhes da Reclamação */}
                    {activeTab === 2 && (
                        <form onSubmit={(e) => { e.preventDefault(); handleNextTab(); }} className="form-section">
                            <h3>Detalhes da Reclamação</h3>
                            <select
                                name="tipoReclamacao"
                                className="form-input"
                                value={reclamacaoFormData.tipoReclamacao}
                                onChange={handleReclamacaoChange}
                                required
                            >
                                <option value="">Tipo de Reclamação</option>
                                <option value="Outra Compra/Contratação">Compra de Produto</option>
                                <option value="Outra Compra/Contratação">Contratação de Serviço</option>
                                <option value="Jogos e Apostas">Jogos e Apostas</option>
                            </select>
                            <select
                                name="classificacao"
                                className="form-input"
                                value={reclamacaoFormData.classificacao}
                                onChange={handleReclamacaoChange}
                                required
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
                                className="form-input"
                                type="text"
                                name="assuntoDenuncia"
                                placeholder="Assunto da Denúncia"
                                value={reclamacaoFormData.assuntoDenuncia}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <br />
                            <label className="labelform-materia">Empresa Reclamada:</label><br />
                            <input
                                className="form-input"
                                type="text"
                                name="cnpj"
                                placeholder="Digite o CNPJ"
                                value={reclamacaoFormData.cnpj}
                                onChange={handleReclamacaoChange}
                                required
                            /><br />
                            <button className='buttonLogin btnSearchBusiness' type="button" onClick={buscarEmpresaPorCnpj} disabled={loadingCnpj}>
                                {loadingCnpj ? 'Buscando...' : 'Buscar Empresa'}
                            </button>
                            {cnpjError && <p style={{ color: 'red' }}>{cnpjError}</p>}
                            {empresaInfo && (
                                <p className="company-info">
                                    <strong>Empresa:</strong> {empresaInfo.razao_social}
                                    {empresaInfo.fantasia && ` (${empresaInfo.fantasia})`}
                                </p>
                            )}
                            <br />
                            <label className="labelform-materia">Detalhes da Reclamação</label>
                            <br />
                            <select
                                name="procurouFornecedor"
                                className="form-input"
                                value={reclamacaoFormData.procurouFornecedor}
                                onChange={handleReclamacaoChange}
                                required
                            >
                                <option value="">Procurei o fornecedor para resolver?</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            <select
                                name="formaAquisicao"
                                className="form-input"
                                value={reclamacaoFormData.formaAquisicao}
                                onChange={handleReclamacaoChange}
                                required
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
                                className="form-input"
                                value={reclamacaoFormData.tipoContratacao}
                                onChange={handleReclamacaoChange}
                                required
                            >
                                <option value="">Tipo de Contratação</option>
                                <option value="Produto">Produto</option>
                                <option value="Serviço">Serviço</option>
                            </select>
                            <br /><label className="labelform-materia">Data da contratação</label><br />
                            <input
                                className="form-input"
                                type="date"
                                name="dataContratacao"
                                placeholder="Data da Compra"
                                value={reclamacaoFormData.dataContratacao}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <input
                                className="form-input"
                                type="text"
                                name="nomeServico"
                                placeholder="Nome do Serviço ou Plano"
                                value={reclamacaoFormData.nomeServico}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <textarea
                                id="detalheServico"
                                className="form-input textarea-input"
                                name="detalheServico"
                                placeholder="Detalhes do Serviço ou Plano"
                                value={reclamacaoFormData.detalheServico}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <select
                                name="tipoDocumento"
                                className="form-input"
                                value={reclamacaoFormData.tipoDocumento}
                                onChange={handleReclamacaoChange}
                                required
                            >
                                <option value="">Tipo de Documento</option>
                                <option value="NF">Nota Fiscal</option>
                                <option value="Contrato">Contrato</option>
                                <option value="Ordem de Serviço">Ordem de Serviço</option>
                                <option value="Pedido">Pedido</option>
                                <option value="Outros">Outros</option>
                            </select>
                            <input
                                className="form-input"
                                type="number"
                                name="numeroDoc"
                                placeholder="Número do documento"
                                value={reclamacaoFormData.numeroDoc}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <br /><label className="labelform-materia">Data da ocorrência</label><br />
                            <input
                                className="form-input"
                                type="date"
                                name="dataOcorrencia"
                                placeholder="Data da ocorrência ou serviço"
                                value={reclamacaoFormData.dataOcorrencia}
                                onChange={handleReclamacaoChange}
                                required
                            />

                            <br /><label className="labelform-materia">Data do cancelamento, desistência ou negativa</label><br />

                            <input
                                className="form-input"
                                type="date"
                                name="dataNegativa"
                                placeholder="Data de cancelamento, desistência ou negativa"
                                value={reclamacaoFormData.dataNegativa}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <select
                                name="formaPagamento"
                                className="form-input"
                                value={reclamacaoFormData.formaPagamento}
                                onChange={handleReclamacaoChange}
                                required
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
                                className="form-input"
                                type="number"
                                name="valorCompra"
                                placeholder="Valor da Compra"
                                value={reclamacaoFormData.valorCompra}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <p className="section-title">Outras Informações</p>
                            <textarea
                                id="detalhesReclamacao"
                                className="form-input textarea-input"
                                name="detalhesReclamacao"
                                placeholder="Descreva em detalhes sua reclamação"
                                value={reclamacaoFormData.detalhesReclamacao}
                                onChange={handleReclamacaoChange}
                                required
                            />
                            <select
                                name="pedidoConsumidor"
                                className="form-input"
                                value={reclamacaoFormData.pedidoConsumidor}
                                onChange={handleReclamacaoChange}
                                required
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
                            <div className="form-navigation-buttons">
                                <button type="button" className="buttonLogin btnPrev" onClick={handlePrevTab}>Anterior</button>
                                <button type="submit" className="buttonLogin btnNext" disabled={loadingCnpj}>
                                    Próximo
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Aba 3: Anexos e Envio */}
                    {activeTab === 3 && (
                        <form onSubmit={handleSubmitComplaint} className="form-section">
                            <h3>Anexos e Envio</h3>
                            <p className="section-title">Anexos</p>
                            <label className="file-upload-label">
                                Selecione arquivos (máximo 2MB por arquivo, formatos: .png, .jpg, .jpeg, .pdf)
                                <input
                                    key={fileInputKey}
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".png,.jpg,.jpeg,.pdf"
                                    className='buttonLogin btnUpload'
                                />
                            </label>
                            {fileCount > 0 && <p className="file-count-message">{fileCount} arquivos selecionado(s)</p>}
                            {fileErrors.map((error, index) => (
                                <p key={index} className="error-message">{error}</p>
                            ))}
                            <br />
                            <div className="form-navigation-buttons">
                                <button type="button" className="buttonLogin btnPrev" onClick={handlePrevTab}>Anterior</button>
                                <button type="submit" className="buttonLogin btnLogin">Enviar Reclamação</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProducts;