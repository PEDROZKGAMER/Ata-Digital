# Ata Digital - Sistema de Presença com Biometria Facial

Sistema completo para registro de presença em aulas utilizando biometria facial, desenvolvido com React + Vite no frontend e Node.js no backend.

## Funcionalidades

### Professor
-  Cadastro e login de professores
-  Criação de aulas (nome, curso, data, horário, duração)
-  Gerenciamento de aulas ativas
-  Encerramento de aulas com geração automática de PDF

### Alunos
-  Registro de presença com biometria facial
-  Captura automática de foto durante o registro
-  Validação de face em tempo real
-  Campos obrigatórios: matrícula e nome

### Sistema
-  Autenticação JWT
-  Banco de dados SQLite
-  Geração de PDF com ata de presença
-  Interface responsiva e intuitiva

## Instalação e Execução

### 1. Backend
```bash
cd backend
npm install
npm start
```
O servidor rodará na porta 3001.

### 2. Frontend
```bash
cd ata_digital
npm install
npm run dev
```
O frontend rodará na porta 5173.

### 3. Modelos de IA (Obrigatório)
Baixe os modelos do face-api.js para `ata_digital/public/models/`:
```bash
cd ata_digital/public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

## Como Usar

### 1. Cadastro do Professor
- Acesse http://localhost:5173
- Clique em "Cadastrar-se"
- Preencha email e senha
- Faça login

### 2. Criação de Aula
- No dashboard, clique em "Nova Aula"
- Preencha: nome da aula, curso, data, horário e duração
- Clique em "Criar Aula"

### 3. Gerenciamento da Aula
- Clique em "Gerenciar Aula" na aula desejada
- A câmera será ativada automaticamente
- Os alunos devem preencher matrícula e nome
- Posicionar o rosto na câmera e clicar "Registrar Presença"
- A foto será capturada automaticamente

### 4. Encerramento e PDF
- Clique em "Encerrar Aula"
- O PDF será gerado automaticamente com:
  - Informações da aula
  - Lista de alunos presentes
  - Fotos da biometria
  - Horários de entrada

## Estrutura do Projeto

```
ata_digital/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── pages/              # Páginas principais
│   │   ├── Login.jsx       # Login/Cadastro
│   │   ├── Dashboard.jsx   # Dashboard do professor
│   │   └── ClassRoom.jsx   # Sala de aula
│   ├── services/           # Serviços de API
│   └── utils/              # Utilitários (PDF, Face Recognition)
├── public/
│   └── models/             # Modelos de IA (baixar separadamente)
└── backend/
    └── server.js           # Servidor Node.js completo
```

## Tecnologias Utilizadas

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- face-api.js
- jsPDF

### Backend
- Node.js
- Express
- SQLite3
- JWT
- bcryptjs
- CORS

## Requisitos do Sistema

- Node.js 16+
- Navegador com suporte a WebRTC (câmera)
- Conexão com internet (para carregar modelos de IA)

## Observações Importantes

1. **Câmera**: O sistema requer acesso à câmera do dispositivo
2. **HTTPS**: Para produção, use HTTPS para acesso à câmera
3. **Modelos**: Os modelos de IA são essenciais para o funcionamento
4. **Performance**: O reconhecimento facial pode ser lento em dispositivos menos potentes

## Licença

MIT License