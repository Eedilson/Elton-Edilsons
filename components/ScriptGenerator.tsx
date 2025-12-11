import React, { useState } from 'react';
import { FileText, Calendar, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateScriptAndPlan } from '../services/geminiService';
import { ScriptResult } from '../types';

const ScriptGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [references, setReferences] = useState('');
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await generateScriptAndPlan(topic, references);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o roteiro.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const text = `TÍTULO: ${result.title}\n\nGANCHO:\n${result.hook}\n\nCORPO:\n${result.body}\n\nCTA:\n${result.cta}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Roteirista Mágico</h2>
            <p className="text-gray-400 text-sm">Melhora suas referências e cria um plano completo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 font-medium text-sm mb-2 block">Tópico do Vídeo / Ideia</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Como fazer um bolo em 10 minutos"
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-300 font-medium text-sm mb-2 block">Referências / Links</label>
              <textarea
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Cole links, transcrições ou notas de outros vídeos que você quer combinar/melhorar..."
                rows={6}
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                loading || !topic
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Gerar Roteiro & Plano"}
            </button>
          </div>

          {/* Intro / Empty State */}
          <div className="flex items-center justify-center bg-[#2a2a2a]/50 rounded-xl p-8 border border-dashed border-gray-700">
            <div className="text-center text-gray-500 max-w-xs">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>A IA vai analisar suas referências, encontrar os melhores ganchos e estruturar um roteiro de alta retenção com um plano de 7 dias.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Script Column */}
          <div className="lg:col-span-2 bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#252525]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-purple-400" /> Roteiro Gerado
              </h3>
              <button 
                onClick={copyToClipboard}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="p-6 space-y-6 text-gray-300">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Sugestão de Título</span>
                <h1 className="text-2xl font-bold text-white mt-1">{result.title}</h1>
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border-l-4 border-purple-500">
                <span className="text-xs font-bold text-gray-400 uppercase">O Gancho (0:00 - 0:30)</span>
                <p className="mt-1 text-white italic">"{result.hook}"</p>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Corpo Principal</span>
                <div className="mt-2 whitespace-pre-wrap leading-relaxed">
                  {result.body}
                </div>
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded-lg">
                <span className="text-xs font-bold text-gray-400 uppercase">Chamada para Ação (CTA)</span>
                <p className="mt-1 font-semibold text-white">{result.cta}</p>
              </div>
            </div>
          </div>

          {/* Plan Column */}
          <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 h-fit">
            <div className="p-4 border-b border-gray-800 bg-[#252525]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-green-400" /> Plano de Postagem
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
                {result.postingPlan.map((plan, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-[#2a2a2a] text-gray-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#2a2a2a] p-3 rounded-lg border border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-white text-sm">{plan.day}</div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {plan.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;
