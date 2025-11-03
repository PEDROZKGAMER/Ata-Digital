import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, attendanceAPI } from '../services/api';
import { loadModels, detectFace, captureImage } from '../utils/faceRecognition';
import { generateAttendancePDF } from '../utils/pdfGenerator';

const ClassRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef();
  const [classData, setClassData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [studentForm, setStudentForm] = useState({ matricula: '', nome: '' });
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('loading');

  useEffect(() => {
    loadClassData();
    initializeCamera();
    initializeFaceAPI();
  }, [id]);

  const loadClassData = async () => {
    try {
      const [classResponse, attendanceResponse] = await Promise.all([
        classAPI.getById(id),
        attendanceAPI.getByClass(id)
      ]);
      setClassData(classResponse.data);
      setAttendance(attendanceResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados da aula:', error);
    }
  };

  const initializeCamera = async () => {
    try {
      setCameraStatus('loading');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus('ready');
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraStatus('error');
    }
  };

  const initializeFaceAPI = async () => {
    try {
      await loadModels();
      setModelsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar modelos de IA:', error);
    }
  };

  const handleAttendance = async () => {
    if (!studentForm.matricula || !studentForm.nome) {
      alert('Preencha matrícula e nome do aluno');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Capturar imagem da biometria facial
      const faceImage = captureImage(videoRef.current);
      
      // Detectar face (opcional - para validação)
      if (modelsLoaded) {
        const detections = await detectFace(videoRef.current);
        if (detections.length === 0) {
          alert('Nenhuma face detectada. Tente novamente.');
          setIsCapturing(false);
          return;
        }
      }

      // Registrar presença
      const attendanceData = {
        classId: id,
        matricula: studentForm.matricula,
        nome: studentForm.nome,
        biometria: faceImage,
        timestamp: new Date().toISOString()
      };

      await attendanceAPI.register(attendanceData);
      
      // Atualizar lista local
      setAttendance([...attendance, attendanceData]);
      setStudentForm({ matricula: '', nome: '' });
      
      alert('Presença registrada com sucesso!');
    } catch (error) {
      alert('Erro ao registrar presença');
      console.error(error);
    } finally {
      setIsCapturing(false);
    }
  };

  const endClass = async () => {
    if (window.confirm('Deseja encerrar a aula e gerar o PDF?')) {
      try {
        await classAPI.end(id);
        
        // Gerar PDF
        const pdf = generateAttendancePDF(classData, attendance);
        pdf.save(`ata-${classData.name}-${new Date().toLocaleDateString('pt-BR')}.pdf`);
        
        navigate('/dashboard');
      } catch (error) {
        alert('Erro ao encerrar aula');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteAttendance = async (attendanceId, studentName) => {
    if (window.confirm(`Remover presença de ${studentName}?`)) {
      try {
        await attendanceAPI.delete(attendanceId);
        setAttendance(attendance.filter(a => a.id !== attendanceId));
        alert('Presença removida com sucesso!');
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao remover presença');
      }
    }
  };

  if (!classData) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }} />
          <p className="text-gray-600">Carregando dados da aula...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="mb-2">🎯 {classData.name}</h1>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>🎓 <strong>Curso:</strong> {classData.course}</span>
                <span>📅 <strong>Data:</strong> {formatDate(classData.date)}</span>
                <span>🕐 <strong>Horário:</strong> {classData.startTime}</span>
                <span>⏱️ <strong>Duração:</strong> {classData.duration}min</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                ← Voltar
              </button>
              <button 
                onClick={endClass}
                className="btn btn-error"
              >
                📝 Encerrar Aula
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Registro de Presença */}
        <div className="card">
          <div className="card-header">
            <h2>📷 Registro de Presença</h2>
            <div className="flex items-center gap-2 mt-2">
              {cameraStatus === 'loading' && (
                <><div className="spinner" /> <span className="text-sm text-gray-600">Iniciando câmera...</span></>
              )}
              {cameraStatus === 'ready' && (
                <><span className="badge badge-success">✓ Câmera Ativa</span></>
              )}
              {cameraStatus === 'error' && (
                <><span className="badge badge-error">⚠ Erro na Câmera</span></>
              )}
              {modelsLoaded && (
                <span className="badge badge-success">🤖 IA Carregada</span>
              )}
            </div>
          </div>
          
          <div className="card-body">
            <div className="mb-4">
              <video 
                ref={videoRef} 
                autoPlay 
                muted
                className="w-full rounded-lg border-2 border-gray-200"
                style={{ maxWidth: '100%', aspectRatio: '4/3', minHeight: '300px' }}
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Matrícula do Aluno</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 2024001"
                  value={studentForm.matricula}
                  onChange={(e) => setStudentForm({...studentForm, matricula: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: João Silva Santos"
                  value={studentForm.nome}
                  onChange={(e) => setStudentForm({...studentForm, nome: e.target.value})}
                />
              </div>
              
              <button 
                onClick={handleAttendance}
                disabled={isCapturing || cameraStatus !== 'ready'}
                className={`btn btn-lg ${isCapturing ? 'btn-secondary' : 'btn-success'}`}
              >
                {isCapturing && <div className="spinner" />}
                {isCapturing ? 'Capturando...' : '📸 Registrar Presença'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Presença */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2>📋 Lista de Presença</h2>
              <span className="badge badge-success">{attendance.length} alunos</span>
            </div>
          </div>
          
          <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {attendance.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">📋 Lista vazia</p>
                <p className="text-gray-400 text-sm">Os alunos aparecerão aqui após o registro</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {attendance.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      <img 
                        src={student.biometria} 
                        alt="Biometria"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm cursor-pointer image-hover"
                        onClick={() => window.open(student.biometria, '_blank')}
                        title="Clique para ampliar"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{student.nome}</h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>🎫 <strong>Matrícula:</strong> {student.matricula}</span>
                        <span>🕐 <strong>Horário:</strong> {formatTime(student.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="badge badge-success">✓ Presente</span>
                      <button 
                        onClick={() => handleDeleteAttendance(student.id, student.nome)}
                        className="btn btn-error btn-sm"
                        title="Remover presença"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;