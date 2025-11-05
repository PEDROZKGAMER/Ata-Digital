import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { captureImageFromVideo, resizeImage } from '../utils/imageCapture';
import ImageCrop from '../components/ImageCrop';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const fileInputRef = useRef();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profile_photo: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile_photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [tempImage, setTempImage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        profile_photo: userData.profile_photo || ''
      });
    } catch (error) {
      // Fallback para dados do localStorage
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile(localUser);
      setFormData({
        name: localUser.name || '',
        email: localUser.email || '',
        password: '',
        confirmPassword: '',
        profile_photo: localUser.profile_photo || ''
      });
    }
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      alert('Erro ao acessar câmera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraReady) {
      const photo = captureImageFromVideo(videoRef.current, 400, 300);
      setTempImage(photo);
      setShowCrop(true);
      stopCamera();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    console.log('Arquivo selecionado:', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Imagem carregada, abrindo crop');
        setTempImage(e.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setFormData({ ...formData, profile_photo: croppedImage });
    setShowCrop(false);
    setTempImage('');
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    setTempImage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        profile_photo: formData.profile_photo
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await userAPI.updateProfile(updateData);
      
      // Atualizar localStorage
      const updatedUser = {
        id: profile.id,
        name: formData.name,
        email: formData.email,
        profile_photo: formData.profile_photo
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Perfil atualizado com sucesso!');
      setFormData({ ...formData, password: '', confirmPassword: '' });
      loadProfile();
    } catch (error) {
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTodos os seus dados serão permanentemente deletados:\n• Sua conta\n• Todas as aulas criadas\n• Todos os registros de presença\n\nDeseja realmente continuar?')) {
      try {
        await userAPI.deleteAccount();
        localStorage.clear();
        alert('Conta deletada com sucesso');
        navigate('/');
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao deletar conta');
      }
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1>👤 Meu Perfil</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{ maxWidth: '800px' }}>
        {/* Profile Header */}
        <div className="card">
          <div className="card-body text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {formData.profile_photo ? (
                  <img 
                    src={formData.profile_photo} 
                    alt="Perfil"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {getInitials(formData.name)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="mb-1">{formData.name || 'Nome não definido'}</h2>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card">
          <div className="card-header">
            <h2>✏️ Editar Informações</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              {/* Photo Section */}
              <div className="form-group">
                <label className="form-label">Foto de Perfil</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowCamera(true);
                        initCamera();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      📷 Tirar Foto
                    </button>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-secondary btn-sm"
                    >
                      📁 Escolher Arquivo
                    </button>
                    {formData.profile_photo && (
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, profile_photo: '' })}
                        className="btn btn-error btn-sm"
                      >
                        🗑️ Remover
                      </button>
                    )}
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Camera Modal */}
              {showCamera && (
                <div className="form-group">
                  <div className="card" style={{ backgroundColor: 'var(--gray-100)' }}>
                    <div className="card-body text-center">
                      <video 
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full max-w-sm rounded-lg mb-4"
                        style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                      />
                      <div className="flex gap-2 justify-center">
                        <button 
                          type="button"
                          onClick={capturePhoto}
                          disabled={!cameraReady}
                          className="btn btn-primary"
                        >
                          📸 Capturar
                        </button>
                        <button 
                          type="button"
                          onClick={stopCamera}
                          className="btn btn-secondary"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nova Senha (opcional)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                
                {formData.password && (
                  <div className="form-group">
                    <label className="form-label">Confirmar Senha</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                {loading && <div className="spinner" />}
                {loading ? 'Salvando...' : '💾 Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card danger-zone">
          <div className="card-header">
            <h2>⚠️ Zona de Perigo</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente deletados.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="btn btn-error"
            >
              🗑️ Deletar Conta Permanentemente
            </button>
          </div>
        </div>
      </div>
      
      {/* Image Crop Modal */}
      {showCrop && (
        <ImageCrop
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default Profile;