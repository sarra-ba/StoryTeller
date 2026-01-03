import React, { useState } from 'react';
import { Sparkles, User, BookOpen, MessageSquare, Zap, Map, Download, Camera, Loader2, ChevronDown } from 'lucide-react';

const AGENTS = {
  worldbuilder: {
    name: "Atlas",
    icon: Map,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    role: "Worldbuilder",
    tagline: "Master of Settings & Atmosphere",
    systemPrompt: `You are Atlas, the Worldbuilder. Your expertise is creating immersive settings, environments, and atmosphere. Focus on locations, time periods, mood, and sensory details. Be descriptive but concise (2-3 sentences). Make the world feel real and lived-in.`
  },
  character: {
    name: "Iris",
    icon: User,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    role: "Character Weaver",
    tagline: "Architect of Souls & Relationships",
    systemPrompt: `You are Iris, the Character Weaver. You specialize in creating compelling characters with depth, motivations, and emotional arcs. Focus on psychology, relationships, and character development (2-3 sentences). Make characters feel human and relatable.`
  },
  plot: {
    name: "Sage",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    role: "Plot Architect",
    tagline: "Weaver of Conflict & Resolution",
    systemPrompt: `You are Sage, the Plot Architect. You think about story structure, pacing, conflict escalation, and satisfying resolutions (2-3 sentences). Suggest plot points and twists that keep the narrative moving forward with clear stakes.`
  },
  dialogue: {
    name: "Echo",
    icon: MessageSquare,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    role: "Dialogue Master",
    tagline: "Voice of Characters & Conversations",
    systemPrompt: `You are Echo, the Dialogue Master. You craft authentic dialogue and distinct character voices (2-3 sentences). Focus on subtext, rhythm, and making conversations feel natural yet purposeful.`
  },
  chaos: {
    name: "Spark",
    icon: Zap,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    role: "The Wildcard",
    tagline: "Champion of Chaos & Creativity",
    systemPrompt: `You are Spark, the Chaos Agent. Introduce unexpected elements and suggest bold creative risks (2-3 sentences). Challenge conventional choices while keeping suggestions coherent and exciting.`
  }
};

export default function StoryCouncil() {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [storyBeats, setStoryBeats] = useState([]);
  const [agentResponses, setAgentResponses] = useState([]);
  const [agentDebates, setAgentDebates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedAgentForDebate, setSelectedAgentForDebate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState({});
  const [expandedBeat, setExpandedBeat] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const STORY_TEMPLATES = [
    {
      genre: "Mystery",
      icon: "🔍",
      color: "from-amber-500 to-orange-600",
      prompt: "A detective discovers a garden that only exists at midnight",
      description: "Supernatural mystery with time-based elements"
    },
    {
      genre: "Sci-Fi",
      icon: "🚀",
      color: "from-blue-500 to-cyan-600",
      prompt: "Humanity's last colony ship receives a mysterious signal from Earth, which was destroyed 200 years ago",
      description: "Space exploration with cosmic mystery"
    },
    {
      genre: "Fantasy",
      icon: "✨",
      color: "from-purple-500 to-pink-600",
      prompt: "An ordinary librarian discovers a book that writes itself, revealing secrets about people who read it",
      description: "Magical realism with prophecy elements"
    },
    {
      genre: "Romance",
      icon: "💕",
      color: "from-rose-500 to-pink-600",
      prompt: "Two strangers keep meeting during city-wide power outages, but only in the darkness",
      description: "Meet-cute with mysterious circumstances"
    },
    {
      genre: "Horror",
      icon: "👻",
      color: "from-red-500 to-rose-600",
      prompt: "A family moves into their dream house, only to find their own photos on the walls from decades ago",
      description: "Psychological horror with time anomalies"
    },
    {
      genre: "Adventure",
      icon: "🗺️",
      color: "from-emerald-500 to-teal-600",
      prompt: "A cartographer finds a map that shows places that don't exist yet, but will soon appear",
      description: "Treasure hunt with precognition"
    },
    {
      genre: "Thriller",
      icon: "⚡",
      color: "from-yellow-500 to-orange-600",
      prompt: "A cybersecurity expert discovers that someone has been living their entire life online, using their identity",
      description: "Identity theft with digital conspiracy"
    },
    {
      genre: "Drama",
      icon: "🎭",
      color: "from-indigo-500 to-purple-600",
      prompt: "Three estranged siblings inherit their grandmother's bakery, along with a letter revealing a family secret",
      description: "Family drama with hidden truths"
    }
  ];

  const handleSelectTemplate = (template) => {
    setStoryPrompt(template.prompt);
    setShowTemplates(false);
  };

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    const base64Reader = new FileReader();
    base64Reader.onload = (event) => {
      const base64String = event.target.result.split(',')[1];
      setUploadedImage({
        data: base64String,
        mimeType: file.type
      });
    };
    base64Reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const generateImageForBeat = async (beatIndex) => {
    const beat = storyBeats[beatIndex];
    if (!beat) return;

    setGeneratingImage(true);

    try {
      const prompt = `Create a cinematic illustration for this story scene: "${beat.text}". 
Style: atmospheric, detailed, professional book illustration. 
Capture the mood and key visual elements described in the scene.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 1.0,
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Image generation error:', data);
        throw new Error(data.error?.message || 'Image generation failed');
      }

      if (data.candidates && data.candidates[0]) {
        const parts = data.candidates[0].content.parts;
        const imagePart = parts.find(part => part.inlineData);
        
        if (imagePart) {
          const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          setGeneratedImages(prev => ({
            ...prev,
            [beatIndex]: imageUrl
          }));
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. This might be due to API limits.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const callGeminiAgent = async (agentKey, context, userPrompt, isDebateResponse = false, targetSuggestion = '', imageData = null) => {
    const agent = AGENTS[agentKey];
    
    let prompt;
    if (isDebateResponse) {
      prompt = `
Another agent just suggested: "${targetSuggestion}"

As ${agent.name} (the ${agent.role}), provide your reaction to this suggestion.
Do you agree, disagree, or want to build on it? Keep your response to 2-3 sentences.
Be constructive but show your unique perspective.`;
    } else {
      prompt = `
Story so far: ${context || 'Beginning of story'}

User's direction: ${userPrompt}

${imageData ? 'IMPORTANT: Analyze the provided image for storytelling elements (setting, mood, characters, objects, colors, atmosphere). Use what you see in the image to inspire your suggestion.' : ''}

As ${agent.name}, provide your suggestion for what happens next in this story.
Respond with exactly 2-3 sentences that build on the story naturally.
Be creative and specific to your role as the ${agent.role}.
${imageData ? 'Reference specific visual elements from the image in your response.' : ''}`;
    }

    try {
      const contentParts = [{ text: prompt }];
      
      if (imageData && !isDebateResponse) {
        contentParts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: contentParts
            }],
            systemInstruction: {
              parts: [{ text: agent.systemPrompt }]
            },
            generationConfig: {
              temperature: 1.0,
              maxOutputTokens: 250,
            }
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error?.message || 'API request failed');
      }
      
      if (data.candidates && data.candidates[0]) {
        return {
          agent: agentKey,
          agentName: agent.name,
          suggestion: data.candidates[0].content.parts[0].text.trim()
        };
      }
      throw new Error('No response from API');
    } catch (error) {
      console.error(`Error calling ${agent.name}:`, error);
      return {
        agent: agentKey,
        agentName: agent.name,
        suggestion: `[Error: Could not get response from ${agent.name}]`
      };
    }
  };

  const handleGetSuggestions = async () => {
    const prompt = currentPrompt || storyPrompt;
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAgentResponses([]);
    setAgentDebates([]);

    const fullStory = storyBeats.map(beat => beat.text).join('\n\n');

    try {
      const responses = await Promise.all(
        Object.keys(AGENTS).map(key => 
          callGeminiAgent(key, fullStory, prompt, false, '', storyBeats.length === 0 ? uploadedImage : null)
        )
      );

      setAgentResponses(responses);
      
      if (storyBeats.length === 0) {
        setUploadedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerDebate = async (selectedResponse) => {
    setIsDebating(true);
    setSelectedAgentForDebate(selectedResponse.agent);
    
    try {
      const otherAgents = Object.keys(AGENTS).filter(key => key !== selectedResponse.agent);
      
      const debates = await Promise.all(
        otherAgents.slice(0, 2).map(key =>
          callGeminiAgent(key, '', '', true, selectedResponse.suggestion)
        )
      );

      setAgentDebates(debates);
    } catch (error) {
      console.error('Error getting debates:', error);
    } finally {
      setIsDebating(false);
    }
  };

  const handleSelectSuggestion = (response) => {
    const newBeat = {
      text: response.suggestion,
      agent: response.agentName,
      timestamp: Date.now()
    };
    
    setStoryBeats([...storyBeats, newBeat]);
    setAgentResponses([]);
    setAgentDebates([]);
    setSelectedAgentForDebate(null);
    setCurrentPrompt('');
  };

  const handleStartNew = () => {
    setStoryBeats([]);
    setAgentResponses([]);
    setAgentDebates([]);
    setStoryPrompt('');
    setCurrentPrompt('');
    setSelectedAgentForDebate(null);
    setUploadedImage(null);
    setImagePreview(null);
    setGeneratedImages({});
    setShowTemplates(false);
  };

  const handleDownloadStory = () => {
    const story = storyBeats.map(beat => beat.text).join('\n\n');
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isApiKeySet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-purple-500/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 w-10 h-10 bg-purple-500/20 rounded-full blur-xl"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Story Council
              </h1>
              <p className="text-slate-400 text-sm">Multi-Agent AI Storytelling</p>
            </div>
          </div>
          
          <p className="text-slate-300 mb-8 leading-relaxed">
            Enter your <span className="text-purple-400 font-semibold">Gemini API key</span> to begin collaborative storytelling with 5 unique AI agents.
          </p>
          
          <input
            type="password"
            placeholder="AIza••••••••••••••••••••••••••"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-6 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSetApiKey()}
          />
          
          <button
            onClick={handleSetApiKey}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30"
          >
            Start Creating ✨
          </button>
          
          <p className="text-xs text-slate-500 mt-6 text-center">
            Get your API key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-purple-400" />
              <div className="absolute inset-0 w-10 h-10 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Story Council
              </h1>
              <p className="text-slate-400 text-sm">Multi-Agent AI Storytelling Platform</p>
            </div>
          </div>
          <div className="flex gap-3">
            {storyBeats.length > 0 && (
              <button
                onClick={handleDownloadStory}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>
            )}
            <button
              onClick={handleStartNew}
              className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition-all transform hover:scale-105"
            >
              New Story
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Story Display */}
          <div className="space-y-6">
            {/* Story Display */}
            {storyBeats.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 max-h-[600px] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    Your Story
                  </h2>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 font-medium">
                    {storyBeats.length} {storyBeats.length === 1 ? 'beat' : 'beats'}
                  </span>
                </div>
                <div className="space-y-4">
                  {storyBeats.map((beat, index) => (
                    <div key={beat.timestamp} className="group animate-fade-in">
                      <div className="border-l-4 border-purple-500 pl-5 pb-4 hover:border-purple-400 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-500/20 rounded-md text-xs font-bold text-purple-300">
                              {beat.agent}
                            </span>
                            <span className="text-xs text-slate-500">Beat {index + 1}</span>
                          </div>
                          {!generatedImages[index] && (
                            <button
                              onClick={() => generateImageForBeat(index)}
                              disabled={generatingImage}
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-500 text-purple-300 hover:text-white rounded-lg text-xs transition-all disabled:opacity-50 transform hover:scale-105"
                            >
                              <Camera className="w-3 h-3" />
                              Generate
                            </button>
                          )}
                        </div>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words mb-3">
                          {beat.text}
                        </p>
                        
                        {generatedImages[index] && (
                          <div className="mt-4 relative group/img">
                            <img 
                              src={generatedImages[index]} 
                              alt={`Illustration for beat ${index + 1}`}
                              className="w-full rounded-xl border border-purple-500/30 shadow-xl transition-transform transform group-hover/img:scale-[1.02]"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <a
                                href={generatedImages[index]}
                                download={`story-beat-${index + 1}.png`}
                                className="bg-black/70 backdrop-blur-sm hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border border-white/20"
                              >
                                <Download className="w-3 h-3" />
                                Save
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {generatingImage && !generatedImages[index] && index === storyBeats.length - 1 && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating illustration...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-purple-400">
                  {!storyBeats.length ? '✨ Start Your Story' : '📝 What Happens Next?'}
                </h2>
                {!storyBeats.length && (
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-all"
                  >
                    {showTemplates ? 'Hide' : 'Show'} Templates
                  </button>
                )}
              </div>

              {/* Story Templates */}
              {!storyBeats.length && showTemplates && (
                <div className="mb-5 animate-fade-in">
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {STORY_TEMPLATES.map((template) => (
                      <button
                        key={template.genre}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-3xl flex-shrink-0 bg-gradient-to-br ${template.color} p-2 rounded-lg`}>
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white">{template.genre}</h3>
                              <span className="text-xs text-slate-500">{template.description}</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              "{template.prompt}"
                            </p>
                          </div>
                          <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-xs text-slate-500">
                    Click a template to use it, or write your own below
                  </div>
                </div>
              )}
              
              {!storyBeats.length && (
                <div className="mb-5">
                  {!imagePreview ? (
                    <label className="flex items-center justify-center gap-3 px-5 py-4 bg-slate-800/50 hover:bg-slate-700/50 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl cursor-pointer transition-all group">
                      <Sparkles className="w-5 h-5 text-purple-400 group-hover:animate-pulse" />
                      <span className="text-slate-300 group-hover:text-purple-300 font-medium transition-colors">
                        Upload Inspiration Image (Optional)
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative animate-fade-in">
                      <img 
                        src={imagePreview} 
                        alt="Inspiration" 
                        className="w-full h-52 object-cover rounded-xl border-2 border-purple-500/30 shadow-lg"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                      >
                        Remove
                      </button>
                      <div className="mt-3 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Agents will analyze this image for storytelling inspiration</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <textarea
                placeholder={!storyBeats.length 
                  ? "Choose a template above or write your own story idea... (e.g., 'A detective discovers a garden that only exists at midnight')"
                  : "Guide the story... (e.g., 'The detective enters the garden and finds something unexpected')"}
                value={storyBeats.length ? currentPrompt : storyPrompt}
                onChange={(e) => storyBeats.length ? setCurrentPrompt(e.target.value) : setStoryPrompt(e.target.value)}
                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-28 resize-none mb-4 transition-all"
              />
              <button
                onClick={handleGetSuggestions}
                disabled={isLoading || (!storyPrompt.trim() && !currentPrompt.trim())}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none shadow-lg shadow-purple-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Consulting the Council...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Consult the Agent Council
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Agent Responses */}
          <div>
            {agentResponses.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    Council Deliberation
                  </h2>
                  <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {agentResponses.map((response, idx) => {
                    const agent = AGENTS[response.agent];
                    const Icon = agent.icon;
                    const isSelected = selectedAgentForDebate === response.agent;
                    
                    return (
                      <div key={response.agent} style={{ animationDelay: `${idx * 100}ms` }} className="animate-slide-in">
                        <div
                          className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border transition-all transform hover:scale-[1.01] ${
                            isSelected 
                              ? 'border-purple-500 shadow-2xl shadow-purple-500/20 bg-slate-900/80' 
                              : `${agent.borderColor} hover:border-purple-500/50 shadow-xl`
                          }`}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`bg-gradient-to-br ${agent.color} p-3 rounded-xl shadow-lg`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                              <p className="text-xs text-slate-400">{agent.tagline}</p>
                            </div>
                          </div>
                          
                          <p className="text-slate-200 leading-relaxed mb-5 whitespace-pre-wrap break-words">
                            {response.suggestion}
                          </p>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSelectSuggestion(response)}
                              className={`flex-1 bg-gradient-to-r ${agent.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                            >
                              Choose This Path
                            </button>
                            <button 
                              onClick={() => handleTriggerDebate(response)}
                              disabled={isDebating}
                              className="px-5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 transform hover:scale-105"
                            >
                              💬 Debate
                            </button>
                          </div>
                        </div>

                        {isSelected && agentDebates.length > 0 && (
                          <div className="ml-10 mt-3 space-y-2 animate-fade-in">
                            {agentDebates.map((debate) => {
                              const debateAgent = AGENTS[debate.agent];
                              const DebateIcon = debateAgent.icon;
                              return (
                                <div key={debate.agent} className={`bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 border ${debateAgent.borderColor}`}>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`bg-gradient-to-br ${debateAgent.color} p-2 rounded-lg shadow-md`}>
                                      <DebateIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-bold text-sm text-white">{debateAgent.name} responds:</span>
                                  </div>
                                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {debate.suggestion}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isDebating && (
              <div className="text-center py-12 animate-pulse">
                <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
                <p className="text-purple-400 font-medium">Agents are debating...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}