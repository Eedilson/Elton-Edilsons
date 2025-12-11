import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Activity, Target, ThumbsUp, ThumbsDown, Loader2, Search } from 'lucide-react';
import { analyzeChannel } from '../services/geminiService';
import { AnalysisResult } from '../types';

const ChannelAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null); // Clear previous results
    try {
      const data = await analyzeChannel(url);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Falha na análise. Verifique o link e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for the chart based on the score
  const getChartData = (score: number) => [
    { name: 'Crescimento', value: score, color: '#10b981' },
    { name: 'Conteúdo', value: Math.min(100, score + 10), color: '#3b82f6' },
    { name: 'Engajamento', value: Math.max(0, score - 15), color: '#f59e0b' },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Auditoria de Canal</h2>
              <p className="text-gray-400 text-sm">Analise qualquer canal apenas com o link</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Link do Canal (URL)</label>
              <div className="relative">
                <input
                  required
                  type="url"
                  placeholder="https://www.youtube.com/@CanalExemplo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                A IA irá pesquisar os dados do canal automaticamente.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Analisar Canal"}
            </button>
          </form>
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-sm">Pontuação de Crescimento</p>
                <div className="text-4xl font-bold text-white mt-2 flex items-baseline gap-2">
                  {result.growthScore}<span className="text-lg text-gray-500">/100</span>
                </div>
              </div>
              <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-sm">Receita Mensal Est.</p>
                <div className="text-2xl font-bold text-green-400 mt-2">
                  {result.estimatedMonthlyRevenue}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 h-64">
              <p className="text-gray-400 text-sm mb-4">Métricas de Performance</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData(result.growthScore)}>
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#444', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {getChartData(result.growthScore).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Content Strategy */}
            <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">Estratégia de Conteúdo</h3>
              </div>
              <ul className="space-y-2">
                {result.contentStrategy.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-gray-300 text-sm">
                    <span className="text-purple-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e1e1e] p-5 rounded-xl border border-green-900/30">
                <div className="flex items-center gap-2 mb-3 text-green-400 font-bold">
                  <ThumbsUp size={18} /> Pontos Positivos
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.pros.map((p, i) => <li key={i}>✓ {p}</li>)}
                </ul>
              </div>
              <div className="bg-[#1e1e1e] p-5 rounded-xl border border-red-900/30">
                <div className="flex items-center gap-2 mb-3 text-red-400 font-bold">
                  <ThumbsDown size={18} /> Pontos Negativos
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.cons.map((c, i) => <li key={i}>⚠ {c}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800">
               <p className="text-gray-400 text-sm mb-2">Persona da Audiência</p>
               <p className="text-white text-sm">{result.audiencePersona}</p>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-[#1e1e1e]/50 rounded-xl border border-gray-800 border-dashed p-10 text-gray-500">
            <Activity size={48} className="mb-4 opacity-50" />
            <p className="text-center">Cole o link do canal ao lado para gerar uma auditoria completa com IA.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalyzer;
