import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-SGA-procon.png';
import InputMask from 'react-input-mask';

const CadastroForm = () => {
    // Estado para os dados do formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        sexo: '',
        cpf: '',
        rg: '',
        ufEmissor: '',
        orgaoEmissor: '',
        dataNascimento: '',
        estadoCivil: '',
        celular: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        municipio: '',
        senha: '',
        confirmarSenha: '',
    });

    // Estado para controlar a aba atual do formulário
    const [activeTab, setActiveTab] = useState('autenticacao');
    // Estado para armazenar erros de validação
    const [errors, setErrors] = useState({});
    // Estado para controlar os critérios de segurança da senha
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });
    
    // Navegação entre rotas
    const navigate = useNavigate();

    // Opções de UF para o campo RG
    const ufOptions = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ];

    // Função para validar a força da senha em tempo real
    const validatePasswordStrength = (password) => {
        setPasswordCriteria({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    // Manipulador genérico para a mudança de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'senha') {
            validatePasswordStrength(value);
        }
    };

    // Manipulador para o input de CEP com autocompletar
    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, cep });

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setFormData(prevData => ({
                        ...prevData,
                        endereco: data.logradouro,
                        complemento: data.complemento,
                        bairro: data.bairro,
                        municipio: data.localidade,
                        estado: data.uf,
                    }));
                } else {
                    setErrors({ ...errors, cep: 'CEP não encontrado' });
                    // Limpa os campos se o CEP não for encontrado
                    setFormData(prevData => ({
                        ...prevData,
                        endereco: '',
                        complemento: '',
                        bairro: '',
                        municipio: '',
                        estado: '',
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                setErrors({ ...errors, cep: 'Erro ao buscar CEP' });
            }
        } else {
            // Limpa os campos de endereço se o CEP for incompleto
            setFormData(prevData => ({
                ...prevData,
                endereco: '',
                complemento: '',
                bairro: '',
                municipio: '',
                estado: '',
            }));
        }
    };
    
    // Funções de validação para cada aba
    const validateAutenticacao = () => {
        let stepErrors = {};
        if (!formData.email) {
            stepErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            stepErrors.email = 'Email inválido';
        }

        // Validação de segurança da senha
        if (!formData.senha) {
            stepErrors.senha = 'Senha é obrigatória';
        } else if (formData.senha.length < 8) {
            stepErrors.senha = 'A senha deve ter no mínimo 8 caracteres.';
        } else if (!/[A-Z]/.test(formData.senha)) {
            stepErrors.senha = 'A senha deve conter pelo menos uma letra maiúscula.';
        } else if (!/[a-z]/.test(formData.senha)) {
            stepErrors.senha = 'A senha deve conter pelo menos uma letra minúscula.';
        } else if (!/[0-9]/.test(formData.senha)) {
            stepErrors.senha = 'A senha deve conter pelo menos um número.';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.senha)) {
            stepErrors.senha = 'A senha deve conter pelo menos um caractere especial.';
        }

        if (!formData.confirmarSenha) {
            stepErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
        } else if (formData.senha !== formData.confirmarSenha) {
            stepErrors.confirmarSenha = 'As senhas não coincidem';
        }
        
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const validateDadosPessoais = () => {
        let stepErrors = {};
        if (!formData.nome) stepErrors.nome = 'Nome é obrigatório';
        if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) stepErrors.cpf = 'CPF inválido';
        if (!formData.rg) stepErrors.rg = 'RG é obrigatório';
        if (!formData.ufEmissor) stepErrors.ufEmissor = 'UF Emissor é obrigatório';
        if (!formData.orgaoEmissor) stepErrors.orgaoEmissor = 'Órgão Emissor é obrigatório';
        if (!formData.dataNascimento) stepErrors.dataNascimento = 'Data de Nascimento é obrigatória';
        if (!formData.estadoCivil) stepErrors.estadoCivil = 'Estado Civil é obrigatório';
        if (!formData.sexo) stepErrors.sexo = 'Sexo é obrigatório';
        if (!formData.celular || formData.celular.replace(/\D/g, '').length !== 11) stepErrors.celular = 'Celular inválido';
        
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const validateEndereco = () => {
        let stepErrors = {};
        if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) stepErrors.cep = 'CEP inválido';
        if (!formData.endereco) stepErrors.endereco = 'Endereço é obrigatório';
        if (!formData.numero) stepErrors.numero = 'Número é obrigatório';
        if (!formData.bairro) stepErrors.bairro = 'Bairro é obrigatório';
        if (!formData.estado) stepErrors.estado = 'Estado é obrigatório';
        if (!formData.municipio) stepErrors.municipio = 'Município é obrigatório';
        
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Lida com a mudança de abas, aplicando a validação
    const handleTabChange = (tabName) => {
        if (tabName === 'autenticacao') {
            setActiveTab('autenticacao');
        } else if (tabName === 'pessoais') {
            if (activeTab === 'autenticacao' && validateAutenticacao()) {
                setActiveTab('pessoais');
            } else if (activeTab === 'pessoais' || activeTab === 'endereco') {
                setActiveTab('pessoais');
            }
        } else if (tabName === 'endereco') {
            if (activeTab === 'autenticacao' && validateAutenticacao()) {
                setActiveTab('endereco');
            } else if (activeTab === 'pessoais' && validateDadosPessoais()) {
                setActiveTab('endereco');
            } else if (activeTab === 'endereco') {
                setActiveTab('endereco');
            }
        }
    };

    // Lida com o avanço para a próxima aba
    const handleNextStep = () => {
        if (activeTab === 'autenticacao') {
            if (validateAutenticacao()) {
                setActiveTab('pessoais');
            }
        } else if (activeTab === 'pessoais') {
            if (validateDadosPessoais()) {
                setActiveTab('endereco');
            }
        }
    };
    
    // Lida com o registro final do usuário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validação completa de todos os campos antes de submeter
        if (!validateAutenticacao() || !validateDadosPessoais() || !validateEndereco()) {
            return;
        }

        try {
            // Cria o usuário com email e senha
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
            const user = userCredential.user;

            // Salva todos os dados do formulário no Firestore
            // A senha não é salva diretamente no banco de dados por segurança.
            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                nome: formData.nome,
                email: formData.email,
                sexo: formData.sexo,
                cpf: formData.cpf,
                rg: formData.rg,
                ufEmissor: formData.ufEmissor,
                orgaoEmissor: formData.orgaoEmissor,
                dataNascimento: formData.dataNascimento,
                estadoCivil: formData.estadoCivil,
                celular: formData.celular,
                cep: formData.cep,
                endereco: formData.endereco,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                estado: formData.estado,
                municipio: formData.municipio,
            });

            console.log('Usuário registrado e dados salvos com sucesso:', user);
            localStorage.setItem('userId', user.uid);

            // Redireciona para a página de meus atendimentos após o registro
            navigate('/meus-atendimentos');
        } catch (error) {
            console.error('Erro ao registrar/autenticar usuário ou salvar dados:', error);
            if (error.code === 'auth/email-already-in-use') {
                setErrors({ firebase: 'Este email já está em uso. Por favor, faça login.' });
            } else if (error.code === 'auth/weak-password') {
                setErrors({ firebase: 'A senha é muito fraca. Por favor, siga os critérios de segurança.' });
            } else {
                setErrors({ firebase: 'Erro ao registrar usuário. Tente novamente mais tarde.' });
            }
        }
    };

    return (
        <div className='App-header loginPage'>
            <div className='Container container-register'>
                <img src={logo} alt="logo" className='logo logoLogin' />

                
                <form onSubmit={handleSubmit} className='formLogin'>
                    {/* Navegação por abas */}
                    <div className="tabs">
                        <div 
                            className={`tab-button ${activeTab === 'autenticacao' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('autenticacao')}>Autenticação
                        </div>
                        <div 
                            className={`tab-button ${activeTab === 'pessoais' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('pessoais')}>Dados Pessoais
                        </div>
                        <div 
                            className={`tab-button ${activeTab === 'endereco' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('endereco')}>Endereço
                        </div>
                    </div>

                    <div className="tab-content">
                        {/* Aba 1: Autenticação */}
                        {activeTab === 'autenticacao' && (
                            <div>
                                <label className="label-input label-register">Email:</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={`inputLogin ${errors.email ? 'error' : ''}`} />
                                {errors.email && <p className="error-message">{errors.email}</p>}
                                
                                <label className="label-input label-register">Senha:</label>
                                <input id='inputSenhaRegister' type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="Senha" className={`inputLogin ${errors.senha ? 'error' : ''}`} />
                                {errors.senha && <p className="error-message">{errors.senha}</p>}

                                {/* Requisitos de senha */}
                                <div className="password-criteria">
                                    <p style={{ color: passwordCriteria.length ? 'green' : 'red' }}>
                                        {passwordCriteria.length ? '✓' : '✗'} Pelo menos 8 caracteres
                                    </p>
                                    <p style={{ color: passwordCriteria.uppercase ? 'green' : 'red' }}>
                                        {passwordCriteria.uppercase ? '✓' : '✗'} Pelo menos 1 letra maiúscula
                                    </p>
                                    <p style={{ color: passwordCriteria.lowercase ? 'green' : 'red' }}>
                                        {passwordCriteria.lowercase ? '✓' : '✗'} Pelo menos 1 letra minúscula
                                    </p>
                                    <p style={{ color: passwordCriteria.number ? 'green' : 'red' }}>
                                        {passwordCriteria.number ? '✓' : '✗'} Pelo menos 1 número
                                    </p>
                                    <p style={{ color: passwordCriteria.specialChar ? 'green' : 'red' }}>
                                        {passwordCriteria.specialChar ? '✓' : '✗'} Pelo menos 1 caractere especial (!@#$%^&*)
                                    </p>
                                </div>


                                <label className="label-input label-register">Confirmar Senha:</label>
                                <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="Confirmar Senha" className={`inputLogin ${errors.confirmarSenha ? 'error' : ''}`} />
                                {errors.confirmarSenha && <p className="error-message">{errors.confirmarSenha}</p>}
                                
                                <button type="button" onClick={handleNextStep} className='buttonLogin btnLogin button-next'>Avançar</button>
                            </div>
                        )}

                        {/* Aba 2: Dados Pessoais */}
                        {activeTab === 'pessoais' && (
                            <div>
                                <label className="label-input label-register">Nome:</label>
                                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" className={`inputLogin ${errors.nome ? 'error' : ''}`} />
                                {errors.nome && <p className="error-message">{errors.nome}</p>}
                                
                                {/* Agrupamento dos campos CPF e Sexo na mesma linha */}
                                <div className="inline-row">
                                    <div>
                                        <label className="label-input label-register">CPF:</label>
                                        <InputMask
                                            mask="999.999.999-99"
                                            name="cpf"
                                            value={formData.cpf}
                                            onChange={handleChange}
                                            placeholder="CPF"
                                            className={`inputLogin ${errors.cpf ? 'error' : ''}`}
                                        />
                                        {errors.cpf && <p className="error-message">{errors.cpf}</p>}
                                    </div>
                                    <div>
                                        <label className="label-input label-register">Sexo:</label>
                                        <select id='select-input' name="sexo" value={formData.sexo} onChange={handleChange} className={`inputLogin ${errors.sexo ? 'error' : ''}`}>
                                            <option value="">Selecione o sexo</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="feminino">Feminino</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                        {errors.sexo && <p className="error-message">{errors.sexo}</p>}
                                    </div>
                                </div>

                                {/* Agrupamento dos campos RG, Órgão Emissor e UF Emissor na mesma linha */}
                                <div className="inline-row">
                                    <div>
                                        <label className="label-input label-register">RG:</label>
                                        <input type="text" name="rg" value={formData.rg} onChange={handleChange} placeholder="RG" className={`inputLogin ${errors.rg ? 'error' : ''}`} />
                                        {errors.rg && <p className="error-message">{errors.rg}</p>}
                                    </div>
                                    <div>
                                        <label className="label-input label-register">Órgão Emissor:</label>
                                        <input type="text" name="orgaoEmissor" value={formData.orgaoEmissor} onChange={handleChange} placeholder="Órgão Emissor" className={`inputLogin ${errors.orgaoEmissor ? 'error' : ''}`} />
                                        {errors.orgaoEmissor && <p className="error-message">{errors.orgaoEmissor}</p>}
                                    </div>
                                    <div>
                                        <label className="label-input label-register">UF Emissor:</label>
                                        <select id='select-input' name="ufEmissor" value={formData.ufEmissor} onChange={handleChange} className={`inputLogin ${errors.ufEmissor ? 'error' : ''}`}>
                                            <option value="">UF</option>
                                            {ufOptions.map((uf) => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                        {errors.ufEmissor && <p className="error-message">{errors.ufEmissor}</p>}
                                    </div>
                                </div>
                                
                                {/* Agrupamento dos campos Data de Nascimento e Estado Civil na mesma linha */}
                                <div className="inline-row">
                                    <div>
                                        <label className="label-input">Data de Nascimento:</label>
                                        <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} placeholder="Data de Nascimento" className={`inputLogin ${errors.dataNascimento ? 'error' : ''}`} />
                                        {errors.dataNascimento && <p className="error-message">{errors.dataNascimento}</p>}
                                    </div>
                                    <div>
                                        <label className="label-input label-register">Estado Civil:</label>
                                        <select id='select-input' name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} className={`inputLogin ${errors.estadoCivil ? 'error' : ''}`}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro</option>
                                            <option value="casado">Casado</option>
                                            <option value="divorciado">Divorciado</option>
                                            <option value="viuvo">Viúvo</option>
                                        </select>
                                        {errors.estadoCivil && <p className="error-message">{errors.estadoCivil}</p>}
                                    </div>
                                </div>
                                
                                <label className="label-input label-register">Celular:</label>
                                <InputMask
                                    mask="(99) 99999-9999"
                                    name="celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    placeholder="Celular"
                                    className={`inputLogin ${errors.celular ? 'error' : ''}`}
                                />
                                {errors.celular && <p className="error-message">{errors.celular}</p>}
                                <button type="button" onClick={handleNextStep} className='buttonLogin btnLogin button-next'>Avançar</button>
                            </div>
                        )}

                        {/* Aba 3: Dados de Endereço */}
                        {activeTab === 'endereco' && (
                            <div>
                                <label className="label-input label-register">CEP:</label>
                                <InputMask
                                    mask="99999-999"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleCepChange}
                                    placeholder="CEP"
                                    className={`inputLogin ${errors.cep ? 'error' : ''}`}
                                />
                                {errors.cep && <p className="error-message">{errors.cep}</p>}

                                <label className="label-input label-register">Endereço:</label>
                                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className={`inputLogin ${errors.endereco ? 'error' : ''}`} />
                                {errors.endereco && <p className="error-message">{errors.endereco}</p>}

                                <label className="label-input label-register">Número:</label>
                                <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" className={`inputLogin ${errors.numero ? 'error' : ''}`} />
                                {errors.numero && <p className="error-message">{errors.numero}</p>}

                                <label className="label-input label-register">Complemento:</label>
                                <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Complemento" className={`inputLogin ${errors.complemento ? 'error' : ''}`} />
                                {errors.complemento && <p className="error-message">{errors.complemento}</p>}

                                <label className="label-input label-register">Bairro:</label>
                                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bairro" className={`inputLogin ${errors.bairro ? 'error' : ''}`} />
                                {errors.bairro && <p className="error-message">{errors.bairro}</p>}

                                <label className="label-input label-register">Estado:</label>
                                <input type="text" name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" className={`inputLogin ${errors.estado ? 'error' : ''}`} />
                                {errors.estado && <p className="error-message">{errors.estado}</p>}

                                <label className="label-input label-register">Município:</label>
                                <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} placeholder="Município" className={`inputLogin ${errors.municipio ? 'error' : ''}`} />
                                {errors.municipio && <p className="error-message">{errors.municipio}</p>}
                            </div>
                        )}
                    </div>
                    
                    {errors.firebase && <p className="error-message firebase-error">{errors.firebase}</p>}
                    {/* O botão de Cadastro só aparece na última aba */}
                    {activeTab === 'endereco' && (
                        <button type="submit" className='buttonLogin btnLogin'>Cadastrar</button>
                    )}
                    <p className='label-input'>Já tem uma conta? <a href='/login' className='label-input'>Faça login</a></p>
                </form>
            </div>
        </div>
    );
};

export default CadastroForm;
