import React, { useState } from 'react';
import { ImagePlus, Wand2, Loader2, User, Image as ImageIcon } from 'lucide-react';
import { generateThumbnail } from '../services/geminiService';

const ThumbGenerator: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("Arquivo muito grande. Por favor, envie uma imagem menor que 20MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setter(base64String);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64Data = (dataUrl: string) => {
    return dataUrl.split(',')[1];
  };

  const getMimeType = (dataUrl: string) => {
    return dataUrl.split(';')[0].split(':')[1];
  };

  const handleGenerate = async () => {
    if (!userImage || !refImage || !prompt) {
      setError('Por favor, envie sua foto, uma imagem de referência e uma descrição.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImage(null);

    try {
      const result = await generateThumbnail(
        { data: getBase64Data(userImage), mimeType: getMimeType(userImage) },
        { data: getBase64Data(refImage), mimeType: getMimeType(refImage) },
        prompt
      );
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("Falha ao gerar imagem.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro durante a geração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500 text-black rounded-lg">
            <Wand2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Criador de Thumbnails AI</h2>
            <p className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash Image (Nano Banana)</p>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg mb-6 text-yellow-200 text-sm">
          <strong>Como funciona:</strong> Envie uma foto sua e uma thumbnail de referência que você gostou. A IA irá recriar a thumbnail de referência, mas <strong>colocará VOCÊ no lugar da pessoa da referência</strong>.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* User Photo Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User size={16} /> Sua Foto (Rosto/Corpo)
            </label>
            <div className={`relative border-2 border-dashed ${userImage ? 'border-yellow-500' : 'border-gray-700'} rounded-xl p-4 h-48 flex flex-col items-center justify-center text-gray-500 hover:border-yellow-500/50 transition-colors bg-[#2a2a2a]`}>
              {userImage ? (
                 <img src={userImage} alt="User" className="h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-2" size={32} />
                  <span className="text-xs">Clique para enviar sua foto</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setUserImage)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Reference Photo Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <ImageIcon size={16} /> Imagem de Referência (Modelo)
            </label>
            <div className={`relative border-2 border-dashed ${refImage ? 'border-purple-500' : 'border-gray-700'} rounded-xl p-4 h-48 flex flex-col items-center justify-center text-gray-500 hover:border-purple-500/50 transition-colors bg-[#2a2a2a]`}>
              {refImage ? (
                 <img src={refImage} alt="Reference" className="h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-2" size={32} />
                  <span className="text-xs">Clique para enviar a referência</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setRefImage)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-gray-300">Descrição / Ajustes</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva o que manter ou mudar. Ex: 'Mantenha o fundo vermelho e a expressão de choque, mas me coloque de terno.'"
            className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
          />
        </div>

        {error && <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg shadow-orange-900/20'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Gerando...
            </>
          ) : (
            <>
              <Wand2 /> Gerar Thumbnail
            </>
          )}
        </button>
      </div>

      {/* Result Area */}
      {generatedImage && (
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-4">Resultado Gerado</h3>
          <div className="rounded-xl overflow-hidden border border-gray-700">
            <img src={generatedImage} alt="Generated Thumbnail" className="w-full h-auto" />
          </div>
          <div className="mt-4 flex justify-end">
            <a 
              href={generatedImage} 
              download="ai-thumbnail.png"
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Baixar Imagem
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbGenerator;