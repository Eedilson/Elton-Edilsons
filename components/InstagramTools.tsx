import React, { useState } from 'react';
import { Instagram, Link as LinkIcon, RefreshCw, Layers, Video as VideoIcon, ImagePlus, Check, Sparkles, Loader2, Camera } from 'lucide-react';
import { repurposeInstagramContent } from '../services/geminiService';
import { InstagramRepurposeResult } from '../types';

const InstagramTools: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'VIRALIZER' | 'DOWNLOADER'>('VIRALIZER');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#1e1e1e] p-1 rounded-xl border border-gray-800 inline-flex">
          <button
            onClick={() => setActiveMode('VIRALIZER')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeMode === 'VIRALIZER'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Viralizador AI (Copiar & Melhorar)
          </button>
          <button
            onClick={() => setActiveMode('DOWNLOADER')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeMode === 'DOWNLOADER'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Baixar / Ver Mídia
          </button>
        </div>
      </div>

      {activeMode === 'VIRALIZER' ? <ViralizerView /> : <DownloaderInfoView />}
    </div>
  );
};

// --- Viralizer View (Main Feature) ---
const ViralizerView: React.FC = () => {
  const [link, setLink] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [myNiche, setMyNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InstagramRepurposeResult | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64Data = (dataUrl: string) => dataUrl.split(',')[1];
  const getMimeType = (dataUrl: string) => dataUrl.split(';')[0].split(':')[1];

  const handleProcess = async () => {
    if ((!link && !image) || !myNiche) {
      alert("Por favor, forneça um Link OU um Print, e defina seu nicho.");
      return;
    }
    
    setLoading(true);
    try {
      const data = await repurposeInstagramContent({
        link: link || undefined,
        image: image ? { data: getBase64Data(image), mimeType: getMimeType(image) } : undefined,
        userInstructions: instructions || "Melhore isso para o meu nicho, torne mais viral.",
      }, myNiche);
      setResult(data);
    } catch (e: any) {
      console.error(e);
      alert("Erro na análise: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Input Column */}
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 h-fit space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg">
            <RefreshCw className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Copiar & Melhorar</h2>
            <p className="text-gray-400 text-sm">Cole o link ou suba um print para a IA analisar.</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          
          {/* Link Input */}
          <div>
            <label className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <LinkIcon size={14} /> Link do Post (Opcional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="text-center text-gray-500 text-xs font-bold">- OU -</div>

          {/* Image Upload (Print) */}
          <div>
            <label className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Camera size={14} /> Enviar Print/Foto (Recomendado)
            </label>
            <div className={`relative border-2 border-dashed ${image ? 'border-pink-500' : 'border-gray-700'} rounded-xl p-4 h-32 flex flex-col items-center justify-center text-gray-500 hover:border-pink-500/50 transition-colors bg-[#2a2a2a]`}>
              {image ? (
                 <img src={image} alt="Preview" className="h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-2" size={24} />
                  <span className="text-xs">Clique para enviar print do post</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Se enviar a foto, a IA vai 'ver' a imagem para recriar o estilo.</p>
          </div>

          <hr className="border-gray-700 my-4" />

          {/* Niche & Instructions */}
          <div>
            <label className="text-gray-300 text-sm font-bold mb-2 block">Seu Nicho / Objetivo</label>
            <input
              type="text"
              value={myNiche}
              onChange={(e) => setMyNiche(e.target.value)}
              placeholder="Ex: Fitness, Marketing, Vendas..."
              className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
             <label className="text-gray-300 text-sm font-bold mb-2 block">O que alterar? (Instruções)</label>
             <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Mantenha a estrutura mas mude o tema para Musculação. Quero que a imagem seja azul..."
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 h-20"
             />
          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-900/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Gerar Nova Versão"}
          </button>
        </div>
      </div>

      {/* Results Column */}
      <div className="space-y-6">
        {result ? (
          <>
             {/* Visual Strategy */}
             <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold uppercase text-xs tracking-wider">
                <Sparkles size={16} /> Sugestão Visual (Prompt)
              </div>
              <p className="text-gray-300 text-sm italic">
                "{result.visualPrompt}"
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Dica: Copie isso e cole no "Criar Thumb" para gerar a imagem.
              </div>
            </div>

            {/* Reels Script */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold uppercase text-xs tracking-wider">
                <VideoIcon size={16} /> Roteiro Adaptado
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded-lg mb-4">
                <p className="text-xs text-gray-400 uppercase font-bold">Gancho (0-3s)</p>
                <p className="text-white font-bold text-lg">"{result.reelScript.hook}"</p>
              </div>
              <ul className="space-y-2 mb-4">
                {result.reelScript.scenes.map((scene, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-3">
                    <span className="text-gray-600 font-mono">{i + 1}.</span> {scene}
                  </li>
                ))}
              </ul>
            </div>

            {/* Carousel & Caption */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
               <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold uppercase text-xs tracking-wider">
                <Layers size={16} /> Estrutura do Post
              </div>
              <div className="space-y-2 mb-6">
                {result.carouselPlan.map((slide, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-blue-500 font-bold">Slide {slide.slideNumber}:</span>
                    <span className="text-gray-300">{slide.title}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-400 uppercase mb-2">Legenda</p>
                <p className="text-sm text-gray-300 whitespace-pre-line">{result.caption}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-10 bg-[#1e1e1e]/50 min-h-[400px]">
            <Sparkles size={48} className="mb-4 opacity-50 text-pink-500" />
            <p className="text-center max-w-xs">
              Envie um link ou print para a IA analisar a estratégia, cores e texto, e recriar para você.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Downloader Info View (Transparency) ---
const DownloaderInfoView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-[#1e1e1e] p-8 rounded-xl border border-gray-800 animate-fade-in text-center">
      <div className="inline-block p-4 bg-gray-700 rounded-full mb-6">
        <Instagram size={40} className="text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Sobre Baixar Vídeos do Instagram</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Devido às políticas de privacidade e bloqueios do Instagram, <strong>downloads diretos de vídeo não são possíveis através deste site</strong> sem um aplicativo externo.
      </p>
      
      <div className="bg-pink-900/20 border border-pink-700/50 p-6 rounded-xl text-left">
        <h4 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
          <Check size={18} /> Solução Recomendada (O jeito certo)
        </h4>
        <p className="text-gray-300 text-sm mb-4">
          Você não precisa baixar o vídeo para copiar a estratégia!
        </p>
        <ol className="list-decimal list-inside text-gray-400 text-sm space-y-2">
          <li>Tire um <strong>Print (Screenshot)</strong> do post ou copie o link.</li>
          <li>Vá na aba <strong className="text-white">"Viralizador AI"</strong> acima.</li>
          <li>Envie o print. A IA vai "ver" a imagem e extrair todo o texto e estratégia para você usar.</li>
        </ol>
      </div>

      <p className="text-gray-500 text-xs mt-6">
        Esta ferramenta foca em ANÁLISE e ESTRATÉGIA com IA, não em pirataria de conteúdo.
      </p>
    </div>
  );
};

export default InstagramTools;
