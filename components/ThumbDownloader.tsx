import React, { useState } from 'react';
import { Download, Youtube } from 'lucide-react';

const ThumbDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleExtract = () => {
    setError('');
    setThumbUrl(null);
    
    // Simple regex for YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      setThumbUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setError('URL do YouTube inválida');
    }
  };

  const handleDownload = async () => {
    if (!thumbUrl) return;
    try {
      const response = await fetch(thumbUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'thumbnail.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      setError('Falha ao baixar diretamente. Tente clicar com o botão direito > Salvar Imagem.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-600 rounded-lg">
          <Youtube className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">Baixar Thumbnail</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Cole o link do vídeo do YouTube
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleExtract}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {thumbUrl && (
          <div className="mt-8 animate-fade-in">
            <div className="relative group rounded-xl overflow-hidden shadow-2xl">
              <img src={thumbUrl} alt="Thumbnail" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={handleDownload}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                >
                  <Download size={20} />
                  Baixar em Alta Resolução
                </button>
              </div>
            </div>
            <p className="text-center text-gray-500 text-xs mt-3">
              Clique com o botão direito na imagem e selecione "Salvar Imagem Como" se o botão não funcionar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbDownloader;
