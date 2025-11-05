import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegister && formData.password !== formData.confirmPassword) {
      alert('Senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = isRegister 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };
        
      const response = isRegister 
        ? await authAPI.register(submitData)
        : await authAPI.login(submitData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="card-header text-center">
          <h1 className="text-lg font-semibold">
            🎓 Ata Digital
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            {isRegister ? 'Criar conta de professor' : 'Acesso do professor'}
          </p>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Prof. João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="professor@escola.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirmar Senha</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading && <div className="spinner" />}
              {loading ? 'Processando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>
        </div>
        
        <div className="card-footer text-center">
          <p className="text-sm text-gray-600">
            {isRegister ? 'Já possui uma conta?' : 'Não possui uma conta?'}
          </p>
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            }}
            className="btn btn-secondary btn-sm mt-2"
          >
            {isRegister ? 'Fazer Login' : 'Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;