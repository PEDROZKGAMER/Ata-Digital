import { useRef, useState, useEffect } from 'react';

const ImageCrop = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef();
  const previewRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(new Image());

  useEffect(() => {
    imgRef.current.onload = () => setImgLoaded(true);
    imgRef.current.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (imgLoaded) drawPreview();
  }, [zoom, rotation, position, brightness, contrast, imgLoaded]);

  const drawPreview = () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    
    // Aplicar filtros
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Centro do canvas
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Calcular dimensões
    const scale = zoom;
    const imgAspect = img.width / img.height;
    let drawWidth = size * scale;
    let drawHeight = size * scale;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }
    
    ctx.drawImage(
      img,
      -drawWidth / 2 + position.x,
      -drawHeight / 2 + position.y,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
    
    // Desenhar círculo de corte
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Criar máscara circular
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    const scale = zoom;
    const imgAspect = img.width / img.height;
    let drawWidth = size * scale;
    let drawHeight = size * scale;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }
    
    ctx.drawImage(
      img,
      -drawWidth / 2 + position.x * (size / 300),
      -drawHeight / 2 + position.y * (size / 300),
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
    onCropComplete(canvas.toDataURL('image/jpeg', 0.95));
  };

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold text-center">✨ Editor de Foto</h3>
        </div>
        
        <div className="p-6">
          {/* Preview */}
          <div className="mb-6 flex justify-center">
            <div className="relative" style={{ width: 300, height: 300 }}>
              <canvas
                ref={previewRef}
                className="rounded-full shadow-lg cursor-move"
                style={{ width: 300, height: 300 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full">
                Arraste para mover
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Zoom */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  🔍 Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Rotação */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  🔄 Rotação: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Brilho */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  ☀️ Brilho: {brightness}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Contraste */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  🎨 Contraste: {contrast}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Botões de ação rápida */}
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setRotation((r) => r - 90)} className="btn btn-secondary btn-sm">
                ↶ -90°
              </button>
              <button onClick={() => setRotation((r) => r + 90)} className="btn btn-secondary btn-sm">
                ↷ +90°
              </button>
              <button onClick={reset} className="btn btn-secondary btn-sm">
                🔄 Resetar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">
            ❌ Cancelar
          </button>
          <button onClick={handleCrop} className="btn btn-primary flex-1">
            ✅ Aplicar
          </button>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default ImageCrop;