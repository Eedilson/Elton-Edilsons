import React, { useState } from 'react';
import { Search, TrendingUp, Tag, Hash, Award, Loader2, Copy, Check, Lightbulb } from 'lucide-react';
import { getSeoTrends, getChannelIdentity } from '../services/geminiService';
import { SeoTrendsResult, ChannelIdentityResult } from '../types';

type Mode = 'TRENDS' | 'IDENTITY';

const SeoTools: React.FC = () => {
  const [mode, setMode] = useState<Mode>('TRENDS');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-center mb-8">
        <div className="bg-[#1e1e1e] p-1 rounded-xl border border-gray-800 inline-flex">
          <button
            onClick={() => setMode('TRENDS')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'TRENDS'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trends & Títulos
          </button>
          <button
            onClick={() => setMode('IDENTITY')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'IDENTITY'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Nomes & Tags
          </button>
        </div>
      </div>

      {mode === 'TRENDS' ? <TrendsView /> : <IdentityView />}
    </div>
  );
};

// --- Sub-Component: Trends & Titles ---
const TrendsView: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoTrendsResult | null>(null);

  const handleSearch = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const data = await getSeoTrends(niche);
      setResult(data);
    } catch (e: any) {
      alert("Erro ao buscar trends: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Input */}
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-600 rounded-lg">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pesquisa de Mercado</h2>
            <p className="text-gray-400 text-sm">Descubra o que está em alta agora.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-gray-300 font-bold text-sm">Qual o seu Nicho?</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: Marketing Digital, Jogos Mobile, Culinária..."
            className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !niche}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Analisar Trends & Títulos"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {result ? (
          <>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search size={20} className="text-blue-400" /> Assuntos Mais Pesquisados
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.trendingTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-800 rounded-full text-sm">
                    🔥 {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-400" /> Fórmulas de Títulos Virais
              </h3>
              <div className="space-y-4">
                {result.highCtrTitles.map((item, i) => (
                  <div key={i} className="bg-[#2a2a2a] p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Template</p>
                    <p className="text-white font-mono text-sm mb-2 bg-black/20 p-1 rounded inline-block">{item.template}</p>
                    <p className="text-gray-300 text-sm italic mb-2">Ex: "{item.example}"</p>
                    <p className="text-xs text-green-400">💡 Por que funciona: {item.whyItWorks}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-10 bg-[#1e1e1e]/50">
            <p>Os resultados aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Identity (Names & Tags) ---
const IdentityView: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [vibe, setVibe] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChannelIdentityResult | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);

  const handleGenerate = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const data = await getChannelIdentity(niche, vibe || 'Profissional e Moderno');
      setResult(data);
    } catch (e: any) {
      alert("Erro ao gerar identidade: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTags = () => {
    if (result) {
      navigator.clipboard.writeText(result.channelTags.join(', '));
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
       {/* Input */}
       <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-600 rounded-lg">
            <Award className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Identidade do Canal</h2>
            <p className="text-gray-400 text-sm">Nomes estratégicos e Tags de SEO.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-300 font-bold text-sm mb-1 block">Nicho do Canal</label>
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex: Finanças Pessoais"
              className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-gray-300 font-bold text-sm mb-1 block">Vibe / Estilo Desejado</label>
            <input
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Ex: Minimalista, Engraçado, Sério, Polêmico..."
              className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !niche}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Gerar Identidade"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {result ? (
          <>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={20} className="text-teal-400" /> Sugestões de Nomes
              </h3>
              <div className="space-y-3">
                {result.strategicNames.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-[#2a2a2a] rounded-lg">
                    <span className="font-bold text-white text-lg">{item.name}</span>
                    <span className="text-xs text-gray-400 mt-1 sm:mt-0 sm:text-right max-w-xs">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Hash size={20} className="text-gray-400" /> Tags para o Canal
                </h3>
                <button 
                  onClick={copyTags}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1"
                >
                  {copiedTags ? <Check size={14} /> : <Copy size={14} />} {copiedTags ? 'Copiado' : 'Copiar Todas'}
                </button>
               </div>
               <div className="flex flex-wrap gap-2 bg-[#2a2a2a] p-4 rounded-lg">
                 {result.channelTags.map((tag, i) => (
                   <span key={i} className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                     {tag},
                   </span>
                 ))}
               </div>
               <p className="text-xs text-gray-500 mt-2">Copie e cole na seção "Tags" nas configurações do seu canal.</p>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-10 bg-[#1e1e1e]/50">
             <p>Preencha os dados ao lado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoTools;
