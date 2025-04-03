import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-SGA-procon.png';

const CadastroForm = () => {
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
        endereco: '',
        cep: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        municipio: '',
        telefone: '',
        celular: '',
        senha: '',
        confirmarSenha: '',
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                // Registrar o usuário
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
                const user = userCredential.user;

                // Salvar dados no Firestore
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
                    endereco: formData.endereco,
                    cep: formData.cep,
                    numero: formData.numero,
                    complemento: formData.complemento,
                    bairro: formData.bairro,
                    estado: formData.estado,
                    municipio: formData.municipio,
                    telefone: formData.telefone,
                    celular: formData.celular,
                });

                console.log('Usuário registrado e dados salvos com sucesso:', user);

                // Autenticar o usuário
                await signInWithEmailAndPassword(auth, formData.email, formData.senha);

                // Redirecionar para o perfil
                navigate('/perfil');
            } catch (error) {
                console.error('Erro ao registrar/autenticar usuário ou salvar dados:', error);
                setErrors({ firebase: 'Erro ao registrar usuário. Tente novamente.' });
            }
        }
    };

    const validateForm = (data) => {
        let errors = {};

        if (!data.nome) errors.nome = 'Nome é obrigatório';
        if (!data.email) errors.email = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email inválido';
        if (!data.sexo) errors.sexo = 'Sexo é obrigatório';
        if (!data.cpf) errors.cpf = 'CPF é obrigatório';
        if (!data.rg) errors.rg = 'RG é obrigatório';
        if (!data.ufEmissor) errors.ufEmissor = 'UF Emissor é obrigatório';
        if (!data.orgaoEmissor) errors.orgaoEmissor = 'Orgão Emissor é obrigatório';
        if (!data.dataNascimento) errors.dataNascimento = 'Data de Nascimento é obrigatório';
        if (!data.estadoCivil) errors.estadoCivil = 'Estado Civil é obrigatório';
        if (!data.endereco) errors.endereco = 'Endereço é obrigatório';
        if (!data.cep) errors.cep = 'CEP é obrigatório';
        if (!data.numero) errors.numero = 'Número é obrigatório';
        if (!data.bairro) errors.bairro = 'Bairro é obrigatório';
        if (!data.estado) errors.estado = 'Estado é obrigatório';
        if (!data.municipio) errors.municipio = 'Município é obrigatório';
        if (!data.telefone) errors.telefone = 'Telefone é obrigatório';
        if (!data.celular) errors.celular = 'Celular é obrigatório';
        if (!data.senha) errors.senha = 'Senha é obrigatório';
        if (!data.confirmarSenha) errors.confirmarSenha = 'Confirmar Senha é obrigatório';
        else if (data.senha !== data.confirmarSenha) errors.confirmarSenha = 'Senhas não coincidem';

        return errors;
    };

    const ufOptions = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ];

    return (
        <div className='App-header loginPage'>
            <div className='Container'>
                <img src={logo} alt="logo" className='logo logoLogin' />

                <form onSubmit={handleSubmit} className='formLogin'>
                    <div>
                        <label className="label-input label-register">Nome:</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" className="inputLogin" />
                        {errors.nome && <p className="error">{errors.nome}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="inputLogin" />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Sexo:</label>
                        <select name="sexo" value={formData.sexo} onChange={handleChange} className="inputLogin">
                            <option value="">Selecione o sexo</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outros">Outros</option>
                        </select>
                        {errors.sexo && <p className="error">{errors.sexo}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">CPF:</label>
                        <input type="number" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF" className="inputLogin" />
                        {errors.cpf && <p className="error">{errors.cpf}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">RG:</label>
                        <input type="number" name="rg" value={formData.rg} onChange={handleChange} placeholder="RG" className="inputLogin" />
                        {errors.rg && <p className="error">{errors.rg}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">UF Emissor:</label>
                        <select name="ufEmissor" value={formData.ufEmissor} onChange={handleChange} className="inputLogin">
                            <option value="">Selecione o UF Emissor</option>
                            {ufOptions.map((uf) => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                        {errors.ufEmissor && <p className="error">{errors.ufEmissor}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Orgão Emissor:</label>
                        <input type="text" name="orgaoEmissor" value={formData.orgaoEmissor} onChange={handleChange} placeholder="Orgão Emissor" className="inputLogin" />
                        {errors.orgaoEmissor && <p className="error">{errors.orgaoEmissor}</p>}
                    </div>
                    <div>
                        <label className="label-input">Data de Nascimento:</label>
                        <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} placeholder="Data de Nascimento" className="inputLogin" />
                        {errors.dataNascimento && <p className="error">{errors.dataNascimento}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Estado Civil:</label>
                        <select name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} className="inputLogin">
                            <option value="">Selecione o Estado Civil</option>
                            <option value="solteiro">Solteiro</option>
                            <option value="casado">Casado</option>
                            <option value="divorciado">Divorciado</option>
                            <option value="viuvo">Viúvo</option>
                        </select>
                        {errors.estadoCivil && <p className="error">{errors.estadoCivil}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Endereço:</label>
                        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="inputLogin" />
                        {errors.endereco && <p className="error">{errors.endereco}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">CEP:</label>
                        <input type="number" name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="inputLogin" />
                        {errors.cep && <p className="error">{errors.cep}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Número:</label>
                        <input type="number" name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" className="inputLogin" />
                        {errors.numero && <p className="error">{errors.numero}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Complemento:</label>
                        <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Complemento" className="inputLogin" />
                        {errors.complemento && <p className="error">{errors.complemento}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Bairro:</label>
                        <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Bairro" className="inputLogin" />
                        {errors.bairro && <p className="error">{errors.bairro}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Estado:</label>
                        <input type="text" name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" className="inputLogin" />
                        {errors.estado && <p className="error">{errors.estado}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Município:</label>
                        <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} placeholder="Município" className="inputLogin" />
                        {errors.municipio && <p className="error">{errors.municipio}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Telefone:</label>
                        <input type="number" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="inputLogin" />
                        {errors.telefone && <p className="error">{errors.telefone}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Celular:</label>
                        <input type="number" name="celular" value={formData.celular} onChange={handleChange} placeholder="Celular" className="inputLogin" />
                        {errors.celular && <p className="error">{errors.celular}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Senha:</label>
                        <input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="Senha" className="inputLogin" />
                        {errors.senha && <p className="error">{errors.senha}</p>}
                    </div>
                    <div>
                        <label className="label-input label-register">Confirmar Senha:</label>
                        <input type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="Confirmar Senha" className="inputLogin" />
                        {errors.confirmarSenha && <p className="error">{errors.confirmarSenha}</p>}
                    </div>

                    {errors.firebase && <p className="error">{errors.firebase}</p>}
                    <button type="submit" className='buttonLogin btnLogin'>Cadastrar</button>
                    <p className='label-input'>Já tem uma conta? <a href='/login' className='label-input'>Faça login</a></p>
                </form>
            </div>
        </div>
    );
};

export default CadastroForm;