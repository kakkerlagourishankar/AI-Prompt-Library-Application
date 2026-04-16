import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Eye, Copy, X, Calendar, Trash2, Star } from 'lucide-react';
import { cn } from './utils/cn';

interface Prompt {
  id: string;
  title: string;
  content: string;
  complexity: number;
  createdAt: string;
  views: number;
}

const INITIAL_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Neon Cyberpunk Street',
    content: 'A bustling cyberpunk street at night, heavy rain, vibrant neon signs in pink and cyan, flying cars in the distance, reflections on wet pavement, cinematic lighting, ultra detailed, 8k --ar 16:9 --v 5',
    complexity: 8,
    createdAt: '2025-01-15T10:30:00Z',
    views: 24,
  },
  {
    id: '2',
    title: 'Enchanted Forest Portal',
    content: 'Mystical enchanted forest with glowing mushrooms, ancient trees with bioluminescent leaves, a magical portal swirling with purple energy in the center, ethereal fog, fantasy style, intricate details, dreamy atmosphere',
    complexity: 6,
    createdAt: '2025-01-16T14:20:00Z',
    views: 17,
  },
  {
    id: '3',
    title: 'Futuristic Tokyo Skyline',
    content: 'Hyper realistic futuristic Tokyo at sunset, towering megastructures with holographic billboards, flying vehicles, cherry blossoms mixed with technology, dramatic clouds, volumetric lighting, photorealistic, masterpiece',
    complexity: 9,
    createdAt: '2025-01-17T09:15:00Z',
    views: 42,
  },
  {
    id: '4',
    title: 'Underwater Atlantis Ruins',
    content: 'Ancient ruins of Atlantis deep underwater, bioluminescent sea creatures, marble columns covered in coral, shafts of light piercing the ocean, mysterious and majestic, cinematic underwater photography style',
    complexity: 7,
    createdAt: '2025-01-18T16:45:00Z',
    views: 12,
  },
  {
    id: '5',
    title: 'Steampunk Airship Fleet',
    content: 'Victorian steampunk airships flying over dramatic mountains at dawn, brass and copper details, billowing steam, intricate gears and mechanisms visible, warm golden hour lighting, highly detailed illustration',
    complexity: 5,
    createdAt: '2025-01-19T11:10:00Z',
    views: 31,
  },
  {
    id: '6',
    title: 'Surreal Dreamscape Portrait',
    content: 'Surreal portrait of a woman with galaxy hair, floating in cosmic space, melting clocks and floating books around her, vibrant colors with deep space nebulae background, in the style of Salvador Dali meets modern digital art',
    complexity: 4,
    createdAt: '2025-01-20T08:55:00Z',
    views: 28,
  },
];

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    complexity: 5,
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Load from localStorage (simulating PostgreSQL persistence)
  useEffect(() => {
    const savedPrompts = localStorage.getItem('prompts');
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    } else {
      setPrompts(INITIAL_PROMPTS);
      localStorage.setItem('prompts', JSON.stringify(INITIAL_PROMPTS));
    }
  }, []);

  // Save to localStorage whenever prompts change
  useEffect(() => {
    if (prompts.length > 0) {
      localStorage.setItem('prompts', JSON.stringify(prompts));
    }
  }, [prompts]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'bg-emerald-500 text-white';
    if (complexity <= 6) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getComplexityLabel = (complexity: number) => {
    if (complexity <= 3) return 'LOW';
    if (complexity <= 6) return 'MEDIUM';
    return 'HIGH';
  };

  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterLevel === 'all') return true;
      if (filterLevel === 'low') return prompt.complexity <= 4;
      if (filterLevel === 'medium') return prompt.complexity >= 5 && prompt.complexity <= 7;
      if (filterLevel === 'high') return prompt.complexity >= 8;
      return true;
    })
    .sort((a, b) => b.views - a.views); // Sort by popularity

  const openDetail = (prompt: Prompt) => {
    // Simulate Redis view counter increment
    const updatedPrompts = prompts.map(p => {
      if (p.id === prompt.id) {
        return { ...p, views: p.views + 1 };
      }
      return p;
    });
    setPrompts(updatedPrompts);
    
    const updatedPrompt = { ...prompt, views: prompt.views + 1 };
    setSelectedPrompt(updatedPrompt);
    setIsDetailOpen(true);
    
    // Simulate API call
    console.log(`[SIMULATED API] GET /prompts/${prompt.id}/ - View count incremented in Redis`);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedPrompt(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newPrompt.title.trim() || newPrompt.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!newPrompt.content.trim() || newPrompt.content.length < 30) {
      errors.content = 'Content must be at least 30 characters (full prompt)';
    }
    
    if (newPrompt.complexity < 1 || newPrompt.complexity > 10) {
      errors.complexity = 'Complexity must be between 1 and 10';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addNewPrompt = () => {
    if (!validateForm()) {
      showToast('Please fix the validation errors', 'error');
      return;
    }

    const prompt: Prompt = {
      id: Date.now().toString(36),
      title: newPrompt.title.trim(),
      content: newPrompt.content.trim(),
      complexity: newPrompt.complexity,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    setPrompts(prev => [prompt, ...prev]);
    setNewPrompt({ title: '', content: '', complexity: 5 });
    setFormErrors({});
    setIsAddOpen(false);
    showToast('Prompt added successfully! (Saved to localStorage)');
    
    console.log('[SIMULATED API] POST /prompts/ - New prompt saved to PostgreSQL');
  };

  const deletePrompt = (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (selectedPrompt?.id === id) {
      closeDetail();
    }
    showToast('Prompt deleted');
    console.log(`[SIMULATED API] DELETE /prompts/${id}/`);
  };

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Prompt copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalViews = prompts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tighter">
                promptvault
              </div>
              <div className="text-[10px] text-zinc-500 -mt-1">
                AI IMAGE LIBRARY
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-8 text-sm">
            <div className="flex items-center gap-x-8">
              <a
                href="#library"
                className="hover:text-violet-400 transition-colors"
              >
                Library
              </a>
              <a
                href="#stats"
                className="hover:text-violet-400 transition-colors"
              >
                Stats
              </a>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-x-2 bg-white text-zinc-900 px-5 py-2 rounded-2xl font-medium hover:bg-white/90 transition-all active:scale-[0.985]"
              >
                <Plus className="w-4 h-4" />
                NEW PROMPT
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 max-w-7xl mx-auto px-6">
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center pt-12 pb-16 border-b border-zinc-800">
          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 bg-zinc-900 border border-zinc-700 rounded-3xl text-xs mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            SIMULATED FULL-STACK • REACT
          </div>

          <h1 className="text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-white">
            Your AI Prompt Library
          </h1>
          <p className="max-w-md text-zinc-400 text-lg">
            Store, organize, and reuse your best image generation prompts.
            <br />
            View counts powered by localStorage + INCR simulation.
          </p>

          <div className="flex gap-8 mt-10">
            <div className="text-center">
              <div className="text-4xl font-mono font-semibold text-violet-400">
                {prompts.length}
              </div>
              <div className="text-xs text-zinc-500 tracking-widest mt-1">
                PROMPTS
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-semibold text-fuchsia-400">
                {totalViews}
              </div>
              <div className="text-xs text-zinc-500 tracking-widest mt-1">
                TOTAL VIEWS
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-semibold text-cyan-400">
                3
              </div>
              <div className="text-xs text-zinc-500 tracking-widest mt-1">
                API ENDPOINTS
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between py-8 sticky top-16 bg-zinc-950 z-40 border-b border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-4 top-3 text-zinc-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search prompts or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-violet-500 pl-12 py-3 rounded-3xl text-sm placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-x-2 bg-zinc-900 border border-zinc-700 rounded-3xl p-1">
            {(["all", "low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={cn(
                  "px-5 py-2 text-xs font-medium rounded-[14px] transition-all",
                  filterLevel === level
                    ? "bg-white text-zinc-900 shadow"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                {level === "all" ? "ALL" : level.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-x-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-3xl text-sm font-medium transition-colors md:hidden"
          >
            <Plus className="w-4 h-4" /> ADD PROMPT
          </button>
        </div>

        {/* Prompt Grid */}
        <div id="library" className="pb-12">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-6 opacity-40">📚</div>
              <p className="text-xl text-zinc-400">No prompts found</p>
              <p className="text-zinc-500 mt-2">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => openDetail(prompt)}
                  className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-violet-500/50 transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={cn(
                          "text-[10px] font-mono tracking-[1px] px-3 py-1 rounded-full",
                          getComplexityColor(prompt.complexity),
                        )}
                      >
                        {getComplexityLabel(prompt.complexity)} •{" "}
                        {prompt.complexity}/10
                      </div>
                      <div className="flex items-center gap-x-1 text-xs text-zinc-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{prompt.views}</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-xl leading-tight mb-3 line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {prompt.title}
                    </h3>

                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6">
                      {prompt.content.length > 135
                        ? prompt.content.substring(0, 132) + "..."
                        : prompt.content}
                    </p>
                  </div>

                  <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between text-xs bg-black/30">
                    <div className="flex items-center gap-x-2 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(prompt.createdAt)}
                    </div>

                    <div className="flex items-center gap-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(prompt.content);
                        }}
                        className="text-zinc-400 hover:text-white p-1 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePrompt(prompt.id);
                        }}
                        className="text-zinc-400 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedPrompt && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-zinc-900 w-full max-w-2xl rounded-3xl border border-zinc-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 pt-8 pb-6 border-b border-zinc-700 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-x-3">
                  <div
                    className={cn(
                      "px-4 py-1 text-xs font-mono rounded-2xl",
                      getComplexityColor(selectedPrompt.complexity),
                    )}
                  >
                    {getComplexityLabel(selectedPrompt.complexity)} •{" "}
                    {selectedPrompt.complexity}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    <Star className="w-4 h-4 fill-current" />{" "}
                    {selectedPrompt.views} VIEWS
                    <span className="text-[10px] text-zinc-500">
                      (REDIS COUNTER)
                    </span>
                  </div>
                </div>
                <h2 className="text-3xl font-semibold mt-4 leading-none tracking-tight">
                  {selectedPrompt.title}
                </h2>
              </div>
              <button
                onClick={closeDetail}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 font-mono text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                {selectedPrompt.content}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-500 text-xs mb-1 tracking-widest">
                    CREATED
                  </div>
                  <div className="font-medium">
                    {formatDate(selectedPrompt.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 tracking-widest">
                    VIEW COUNT
                  </div>
                  <div className="font-mono text-4xl font-semibold text-white tabular-nums">
                    {selectedPrompt.views}
                  </div>
                  <div className="text-xs text-emerald-400">
                    +1 on every visit
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex gap-3">
              <button
                onClick={() => copyPrompt(selectedPrompt.content)}
                className="flex-1 flex items-center justify-center gap-x-2 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all"
              >
                <Copy className="w-4 h-4" />
                COPY PROMPT
              </button>

              <button
                onClick={closeDetail}
                className="flex-1 py-4 border border-zinc-700 hover:bg-zinc-800 rounded-2xl transition-colors"
              >
                CLOSE
              </button>
            </div>

            <div className="px-8 py-4 text-[10px] text-center text-zinc-500 border-t border-zinc-800 bg-zinc-950">
              This detail view triggers a simulated Redis INCR command on the
              view counter. Data persists in browser localStorage simulating
              PostgreSQL.
            </div>
          </div>
        </div>
      )}

      {/* Add Prompt Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-7 border-b border-zinc-700 flex items-center justify-between">
              <div className="font-semibold text-2xl">Create New Prompt</div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <label className="block text-xs tracking-widest text-zinc-400 mb-2">
                  TITLE
                </label>
                <input
                  type="text"
                  value={newPrompt.title}
                  onChange={(e) => {
                    setNewPrompt({ ...newPrompt, title: e.target.value });
                    if (formErrors.title)
                      setFormErrors({ ...formErrors, title: "" });
                  }}
                  className={cn(
                    "w-full bg-zinc-950 border rounded-2xl px-5 py-4 text-lg placeholder:text-zinc-600 focus:outline-none",
                    formErrors.title
                      ? "border-red-500"
                      : "border-zinc-700 focus:border-violet-500",
                  )}
                  placeholder="Midjourney style title"
                />
                {formErrors.title && (
                  <p className="text-red-400 text-xs mt-2">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-widest text-zinc-400 mb-2">
                  FULL PROMPT CONTENT
                </label>
                <textarea
                  value={newPrompt.content}
                  onChange={(e) => {
                    setNewPrompt({ ...newPrompt, content: e.target.value });
                    if (formErrors.content)
                      setFormErrors({ ...formErrors, content: "" });
                  }}
                  rows={6}
                  className={cn(
                    "w-full resize-y bg-zinc-950 border rounded-3xl px-5 py-4 font-mono text-sm placeholder:text-zinc-600 focus:outline-none",
                    formErrors.content
                      ? "border-red-500"
                      : "border-zinc-700 focus:border-violet-500",
                  )}
                  placeholder="A beautiful landscape, intricate details, cinematic lighting --ar 3:2"
                />
                {formErrors.content && (
                  <p className="text-red-400 text-xs mt-2">
                    {formErrors.content}
                  </p>
                )}
                <div className="text-right text-[10px] text-zinc-500 mt-1">
                  {newPrompt.content.length} / 30 min
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest text-zinc-400 mb-3">
                  COMPLEXITY (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newPrompt.complexity}
                    onChange={(e) => {
                      setNewPrompt({
                        ...newPrompt,
                        complexity: parseInt(e.target.value),
                      });
                      if (formErrors.complexity)
                        setFormErrors({ ...formErrors, complexity: "" });
                    }}
                    className="flex-1 accent-violet-500"
                  />
                  <div className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded-2xl font-mono text-3xl font-semibold border border-zinc-700">
                    {newPrompt.complexity}
                  </div>
                </div>
                {formErrors.complexity && (
                  <p className="text-red-400 text-xs mt-2">
                    {formErrors.complexity}
                  </p>
                )}
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <div>SIMPLE</div>
                  <div>COMPLEX</div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-zinc-700 flex gap-4">
              <button
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-4 text-sm border border-zinc-700 hover:bg-zinc-950 rounded-2xl transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={addNewPrompt}
                className="flex-1 py-4 text-sm bg-white text-black font-semibold rounded-2xl hover:bg-amber-200 active:bg-white transition-all flex items-center justify-center gap-x-2"
              >
                <Plus className="w-4 h-4" />
                SAVE TO LIBRARY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl text-sm shadow-2xl flex items-center gap-x-3 z-[200]",
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600",
          )}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.message}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-900 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-y-6">
            <div>
              Built as a React + Vite + Tailwind + LocalStorage
            </div>

            <div className="flex items-center gap-x-8">
              <div className="flex items-center gap-x-5">
                <div className="px-3 py-1 bg-zinc-900 rounded-xl">React</div>
                <div className="px-3 py-1 bg-zinc-900 rounded-xl">tailwind</div>
                <div className="px-3 py-1 bg-zinc-900 rounded-xl">counter</div>
              </div>
              <div></div>
              <div className="font-mono text-emerald-300"></div>
            </div>
          </div>

          <div className="mt-10 text-[10px] opacity-50">
            View counts increment on every detail view. Data is saved in
            browser. Refresh to reset to initial state if desired.
          </div>
        </div>
      </footer>
    </div>
  );
}
