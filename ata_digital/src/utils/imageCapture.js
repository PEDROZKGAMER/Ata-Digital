export const captureImageFromVideo = (videoElement, maxWidth = 150, maxHeight = 150) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Calcular proporções
  const ratio = Math.min(maxWidth / videoElement.videoWidth, maxHeight / videoElement.videoHeight);
  canvas.width = videoElement.videoWidth * ratio;
  canvas.height = videoElement.videoHeight * ratio;
  
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.6);
};

export const resizeImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = URL.createObjectURL(file);
  });
};