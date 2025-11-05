import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    date: '',
    startTime: '',
    duration: 60
  });
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    // Atualizar dados do usuário quando voltar do perfil
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await classAPI.create(formData);
      setShowForm(false);
      setFormData({ name: '', course: '', date: '', startTime: '', duration: 60 });
      loadClasses();
    } catch (error) {
      alert('Erro ao criar aula');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="badge badge-success">✅ Ativa</span>;
    }
    return <span className="badge badge-warning">⏹️ Encerrada</span>;
  };

  const handleDeleteClass = async (classId, className) => {
    if (window.confirm(`Deseja deletar a aula "${className}"?\n\nEsta ação é irreversível e deletará também todos os registros de presença.`)) {
      try {
        await classAPI.delete(classId);
        await loadClasses();
        alert('Aula deletada com sucesso!');
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao deletar aula');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                {user.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt="Perfil"
                    className="dashboard-avatar"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xl font-bold shadow-xl ring-4 ring-primary/20">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '👤'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-3 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div>
                <h1 className="mb-1">📚 Dashboard</h1>
                <p className="text-gray-600">
                  Bem-vindo, <strong>{user.name || user.email}</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                👤 Perfil
              </button>
              <button onClick={logout} className="btn btn-secondary">
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm ? '❌ Cancelar' : '➕ Nova Aula'}
        </button>
      </div>

      {/* Create Class Form */}
      {showForm && (
        <div className="card mb-8">
          <div className="card-header">
            <h3>📝 Criar Nova Aula</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateClass}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label">Nome da Aula</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Matemática Básica"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Curso</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Engenharia"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário de Início</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duração (minutos)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="30"
                  max="240"
                  style={{ maxWidth: '150px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                ✅ Criar Aula
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div>
        <h2 className="mb-6">📋 Minhas Aulas</h2>
        {classes.length === 0 ? (
          <div className="card text-center">
            <div className="card-body">
              <p className="text-gray-500 text-lg">📚 Nenhuma aula criada ainda</p>
              <p className="text-gray-400 text-sm">Clique em "Nova Aula" para começar</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="mb-2">📖 {cls.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>🎓 <strong>Curso:</strong> {cls.course}</span>
                        <span>📅 <strong>Data:</strong> {formatDate(cls.date)}</span>
                        <span>🕐 <strong>Horário:</strong> {cls.startTime}</span>
                        <span>⏱️ <strong>Duração:</strong> {cls.duration}min</span>
                      </div>
                    </div>
                    {getStatusBadge(cls.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    {cls.status === 'active' && (
                      <button 
                        onClick={() => navigate(`/class/${cls.id}`)}
                        className="btn btn-primary"
                      >
                        🎯 Gerenciar Aula
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="btn btn-error btn-sm"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;