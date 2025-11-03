# Modelos de IA para Reconhecimento Facial

Para o funcionamento completo da biometria facial, você precisa baixar os modelos do face-api.js:

1. Acesse: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Baixe os seguintes arquivos para esta pasta:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2

Alternativamente, você pode usar o comando:
```bash
# No diretório public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```