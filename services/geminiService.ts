import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScriptResult, InstagramRepurposeResult, SeoTrendsResult, ChannelIdentityResult } from "../types";

// Initialize the API client
// CRITICAL: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a thumbnail using Gemini 2.5 Flash Image
 */
export const generateThumbnail = async (
  userImage: { data: string; mimeType: string },
  referenceImage: { data: string; mimeType: string },
  promptText: string
): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image';
    
    const parts = [
      { text: "Task: Create a high-quality YouTube thumbnail." },
      { text: "Instructions: You are a professional thumbnail editor. Take the 'Reference Image' and recreate its exact composition, lighting, background, and vibe. However, REPLACE the main person/character in the reference with the person provided in the 'User Photo'. The result must look seamless and high-quality." },
      { text: `User Description/Tweaks: ${promptText}` },
      { text: "User Photo (The person to insert):" },
      {
        inlineData: {
          mimeType: userImage.mimeType,
          data: userImage.data,
        },
      },
      { text: "Reference Image (The style/scene to copy):" },
      {
        inlineData: {
          mimeType: referenceImage.mimeType,
          data: referenceImage.data,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ]
      }
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("Sem resposta do modelo.");
    }

    if (!candidate.content) {
      if (candidate.finishReason) {
        if (candidate.finishReason === 'IMAGE_OTHER') {
             throw new Error("Geração bloqueada pelos filtros de segurança. Tente uma foto diferente ou uma descrição mais simples.");
        }
        throw new Error(`Geração bloqueada. Motivo: ${candidate.finishReason}`);
      }
      throw new Error("O modelo não retornou conteúdo.");
    }

    if (candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      const textPart = candidate.content.parts.find(p => p.text);
      if (textPart?.text) {
        console.warn("AI returned text:", textPart.text);
        throw new Error(`Mensagem da IA: ${textPart.text}`);
      }
    }
    
    throw new Error("Nenhuma imagem encontrada na resposta.");

  } catch (error: any) {
    console.error("Thumbnail Generation Error:", error);
    throw new Error(error.message || "Falha ao gerar thumbnail");
  }
};

/**
 * Analyzes channel data using URL and Search Grounding
 */
export const analyzeChannel = async (
  channelUrl: string
): Promise<AnalysisResult> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    Acesse e pesquise dados sobre este canal do YouTube: ${channelUrl}
    
    1. Descubra o Nome do Canal, Número aproximado de Inscritos, Média de Visualizações e Nicho.
    2. Com base nesses dados, faça uma análise profissional em PORTUGUÊS.
    
    Retorne APENAS um objeto JSON (sem formatação markdown \`\`\`json ... \`\`\`) com a seguinte estrutura:
    {
      "estimatedMonthlyRevenue": "Estimativa de receita mensal (ex: $500 - $1.200)",
      "pros": ["Ponto positivo 1", "Ponto positivo 2", ...],
      "cons": ["Ponto negativo 1", "Ponto negativo 2", ...],
      "audiencePersona": "Descrição do público alvo",
      "contentStrategy": ["Ideia de vídeo 1", "Melhoria 2", ...],
      "growthScore": 85 (número de 0 a 100)
    }
  `;

  // We use googleSearch to find the channel stats
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // We cannot use responseMimeType: 'application/json' with tools efficiently in all cases, 
      // so we rely on the prompt instructions and manual parsing.
    }
  });

  const text = response.text;
  if (!text) throw new Error("Não foi possível analisar o canal.");

  // Clean up markdown code blocks if present to extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as AnalysisResult;
  }
  
  // Fallback if no JSON found (unlikely with strict prompt)
  throw new Error("A IA não retornou os dados no formato correto. Tente novamente.");
};

/**
 * Generates a script and posting plan in Portuguese
 */
export const generateScriptAndPlan = async (
  topic: string,
  references: string
): Promise<ScriptResult> => {
  const model = 'gemini-3-pro-preview';

  const prompt = `
    Atue como um roteirista expert de YouTube.
    Tópico: ${topic}
    Referências do usuário: ${references}

    1. Sintetize as melhores partes das referências e do tópico.
    2. Crie um roteiro altamente engajador em PORTUGUÊS (Título, Gancho, Corpo, Chamada para Ação).
    3. Crie um plano de postagem de 7 dias.

    Retorne em JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING, description: "Gancho verbal dos primeiros 30 segundos" },
          body: { type: Type.STRING, description: "Estrutura do conteúdo e pontos chave (markdown permitido)" },
          cta: { type: Type.STRING, description: "Chamada para ação (CTA)" },
          postingPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "ex: Dia 1 (Lançamento)" },
                action: { type: Type.STRING, description: "Ação nas redes sociais/comunidade" }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Nenhum roteiro gerado.");
  return JSON.parse(text) as ScriptResult;
};

/**
 * Repurposes content for Instagram (Reels/Carousel) from Link OR Image
 */
export const repurposeInstagramContent = async (
  input: {
    link?: string;
    image?: { data: string; mimeType: string };
    userInstructions: string;
  },
  myNiche: string
): Promise<InstagramRepurposeResult> => {
  const model = 'gemini-2.5-flash';
  const contents: any[] = [];
  const isUsingSearch = !!input.link;
  
  let contextPrompt = `
    Aja como um estrategista de Instagram Viral.
    ESTE É O CONTEÚDO DE REFERÊNCIA (Analise o Link ou a Imagem fornecida):
  `;
  
  if (input.link) {
    contextPrompt += `\nLINK PARA PESQUISAR: ${input.link}\n(Use a ferramenta de busca para entender do que se trata o post, leia a legenda e o contexto).`;
  }
  
  if (input.image) {
    contextPrompt += `\n(Analise a imagem anexada visualmente: cores, estilo, textos na imagem, pose, elementos virais).`;
  }

  contextPrompt += `
    \nMINHA INSTRUÇÃO DE ALTERAÇÃO: "${input.userInstructions}"
    \nMEU NICHO ALVO: "${myNiche}"

    TAREFA:
    1. Entenda o "DNA Viral" do conteúdo original.
    2. REESCREVA e ADAPTE para o meu nicho.
    
    Retorne um JSON com:
    - Reel Script.
    - Carousel Plan.
    - Caption.
    - Hashtags.
    - VisualPrompt.
  `;
  
  if (isUsingSearch) {
    contextPrompt += `
      \nIMPORTANTE: Sua resposta DEVE ser APENAS um objeto JSON válido.
      Não use markdown. Não inclua \`\`\`json.
      Estrutura esperada: { "reelScript": {...}, "carouselPlan": [...], "caption": "...", "hashtags": [...], "visualPrompt": "..." }
    `;
  }

  contents.push({ text: contextPrompt });

  if (input.image) {
    contents.push({
      inlineData: {
        mimeType: input.image.mimeType,
        data: input.image.data
      }
    });
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      reelScript: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          scenes: { type: Type.ARRAY, items: { type: Type.STRING } },
          audioSuggestion: { type: Type.STRING }
        }
      },
      carouselPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            slideNumber: { type: Type.INTEGER },
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          }
        }
      },
      caption: { type: Type.STRING },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
      visualPrompt: { type: Type.STRING }
    }
  };

  const response = await ai.models.generateContent({
    model,
    contents: contents, 
    config: {
      tools: isUsingSearch ? [{ googleSearch: {} }] : [], 
      ...(isUsingSearch ? {} : { 
          responseMimeType: "application/json",
          responseSchema: responseSchema
      }),
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao adaptar conteúdo.");
  
  const cleanedText = text.replace(/```json|```/g, '').trim();

  try {
      return JSON.parse(cleanedText) as InstagramRepurposeResult;
  } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error("A IA não retornou um JSON válido.");
  }
};

/**
 * Get SEO Trends and Title Formulas (Requires Search)
 */
export const getSeoTrends = async (niche: string): Promise<SeoTrendsResult> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Faça uma pesquisa atualizada no Google/YouTube sobre o nicho: "${niche}".
    
    1. Identifique 5 Tópicos/Temas que estão em alta (Trending) AGORA (2024/2025).
    2. Crie 3 Estruturas (Fórmulas) de Títulos altamente clicáveis (CTR alto) para este nicho.
    
    Retorne APENAS um JSON válido com esta estrutura:
    {
      "trendingTopics": ["Tópico 1", "Tópico 2", ...],
      "highCtrTitles": [
        { 
          "template": "A fórmula (ex: Como [X] sem [Y])", 
          "example": "Exemplo prático do título",
          "whyItWorks": "Explicação psicológica curta"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], 
      // Manual JSON parsing required when using tools
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao buscar tendências.");
  
  const cleanedText = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleanedText) as SeoTrendsResult;
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Erro ao processar dados de SEO.");
  }
};

/**
 * Get Channel Names and Tags (Logic only)
 */
export const getChannelIdentity = async (
  niche: string, 
  vibe: string
): Promise<ChannelIdentityResult> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    Atue como um especialista em Branding para YouTube.
    Nicho: ${niche}
    Vibe/Estilo: ${vibe}

    1. Crie 5 Nomes de canal estratégicos, memoráveis e disponíveis (teoricamente).
    2. Gere 20 Tags (Palavras-chave) de cauda longa essenciais para o SEO do canal.

    Retorne em JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategicNames: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING, description: "Por que esse nome funciona?" }
              }
            }
          },
          channelTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao gerar identidade.");
  return JSON.parse(text) as ChannelIdentityResult;
};
