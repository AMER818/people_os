import React, { useState, useRef } from 'react';
import {
  BrainCircuit,
  Dna,
  Database,
  TrendingUp,
  Activity,
  ShieldCheck,
  Globe,
  Zap as ZapIcon,
  Send,
  Box,
  TrendingDown,
  Bot,
  Maximize2,
  Settings,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { useOrgStore } from '../../store/orgStore';

const intelligenceFlux = [
  { time: '00:00', load: 12, accuracy: 98, tokens: 450 },
  { time: '04:00', load: 8, accuracy: 99, tokens: 320 },
  { time: '08:00', load: 45, accuracy: 94, tokens: 1200 },
  { time: '12:00', load: 88, accuracy: 92, tokens: 2800 },
  { time: '16:00', load: 65, accuracy: 96, tokens: 1900 },
  { time: '20:00', load: 32, accuracy: 98, tokens: 850 },
];

const NeuralModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { aiSettings } = useOrgStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!prompt.trim()) {
      return;
    }

    const userMsg = prompt;
    // Update log immediately for UI responsiveness
    const newLog = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newLog);
    setPrompt('');
    setIsProcessing(true);

    try {
      if (!aiSettings.agents.chat_assistant) {
        throw new Error('AI Assistant is disabled. Enable it in System Settings > AI Core.');
      }

      // Import dynamically based on provider
      let getChatResponse;

      if (aiSettings.provider === 'openai') {
        // Fallback or remove since service is deleted
        throw new Error('OpenAI provider is currently not supported. Please switch to Gemini.');
      } else {
        const service = await import('../../services/geminiService');
        getChatResponse = service.getChatResponse;
      }

      // Convert chat log to history format for service
      const history = chatHistory.map((l) => ({
        role: l.role,
        parts: [{ text: l.content }],
      }));

      const response = await getChatResponse(history, userMsg);
      setChatHistory((prev) => [...prev, { role: 'ai', content: response }]);
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', content: `Error: ${error.message || 'Connection Failed'}` },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderChat = () => (
    <div className="h-[37.5rem] flex flex-col bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      {/* Chat Header */}
      <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/30 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase leading-none">
              PeopleOS AI
            </h3>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-ping"></span>
              AI Engine Active • v4.2.0
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Open AI settings"
            className="p-4 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={20} />
          </button>
          <button
            aria-label="Maximize chat window"
            className="p-4 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth no-scrollbar">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
          >
            <div
              className={`max-w-[80%] p-6 rounded-[2rem] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/20'
                  : 'bg-secondary text-foreground rounded-tl-none border border-border shadow-sm'
              }`}
            >
              <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
              <p
                className={`text-[0.5625rem] font-black uppercase tracking-widest mt-3 ${
                  msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                }`}
              >
                {msg.role === 'user' ? 'You' : 'PeopleOS'} • Just now
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-secondary p-6 rounded-[2rem] rounded-tl-none border border-border flex gap-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-secondary/30 border-t border-border backdrop-blur-md">
        <div className="flex gap-4">
          <input
            type="text"
            aria-label="Chat input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about workforce metrics, prediction models, or compliance..."
            className="flex-1 bg-card border-none rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none shadow-inner transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isProcessing}
            className="bg-primary text-primary-foreground p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
            aria-label="Send message"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderModelStats = () => (
    <div className="bg-card p-12 rounded-[4rem] border border-border shadow-sm">
      <h3 className="text-2xl font-black text-foreground tracking-tight mb-12 uppercase">
        AI Models
      </h3>
      <div className="space-y-8">
        {[
          {
            name: 'Gemini 3 Pro',
            desc: 'Strategic Reasoning',
            load: 82,
            icon: BrainCircuit,
            color: 'blue',
          },
          {
            name: 'Gemini 2.5 Flash',
            desc: 'Real-time Inference',
            load: 45,
            icon: ZapIcon,
            color: 'indigo',
          },
          { name: 'Embedding Model', desc: 'Vector Search', load: 12, icon: Dna, color: 'emerald' },
        ].map((m, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl bg-${m.color}-50 dark:bg-${m.color}-900/20 text-${m.color}-600 dark:text-${m.color}-400 shadow-inner`}
              >
                <m.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground leading-none">{m.name}</p>
                <p className="text-[0.5625rem] text-muted-foreground font-bold uppercase mt-1 tracking-widest">
                  {m.desc}
                </p>
              </div>
            </div>
            <div className="flex justify-between text-[0.5625rem] font-black uppercase tracking-widest text-muted-foreground">
              <span>Allocation</span>
              <span>{m.load}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full bg-${m.color}-500 transition-all duration-1000`}
                style={{ width: `${m.load}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase antialiased">
            AI Analytics
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary"></span>
            Predictive Analytics & Workforce Intelligence
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-8 py-4 bg-card rounded-[1.5rem] border border-border shadow-lg flex items-center gap-4">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-[0.625rem] font-black uppercase tracking-widest text-muted-foreground">
              System Optimal
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'System Load', val: '64%', icon: Activity, color: 'blue' },
          { label: 'AI Accuracy', val: `99.8%`, icon: ShieldCheck, color: 'emerald' },
          { label: 'Processed Data', val: '4.2M', icon: Database, color: 'indigo' },
          { label: 'Uptime Score', val: '99.9%', icon: Globe, color: 'orange' },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div
              className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${s.color}-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`}
            ></div>
            <div className="flex items-center justify-between mb-8">
              <div
                className={`p-4 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 dark:text-${s.color}-400 shadow-inner group-hover:scale-110 transition-transform`}
              >
                <s.icon size={24} />
              </div>
              <span className="text-[0.625rem] font-black px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground uppercase tracking-widest">
                Active
              </span>
            </div>
            <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
              {s.val}
            </h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-card rounded-[4rem] border border-border shadow-2xl overflow-hidden min-h-[31.25rem] flex flex-col">
            <div className="p-12 border-b border-border flex items-center justify-between bg-secondary/30">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">
                  AI Activity
                </h3>
                <p className="text-[0.625rem] font-black text-muted-foreground uppercase tracking-widest mt-2">
                  Real-time System Performance
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_0.625rem_rgba(59,130,246,0.5)]"></div>
                  <span className="text-[0.625rem] font-black uppercase text-muted-foreground">
                    System Load
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_0.625rem_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[0.625rem] font-black uppercase text-muted-foreground">
                    Accuracy
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intelligenceFlux}>
                  <defs>
                    <linearGradient id="fluxLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fluxAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success-500))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success-500))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fontWeight: 'black',
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fontWeight: 'black',
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '1.5rem',
                      border: '0.0625rem solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      boxShadow: '0 2.5rem 6.25rem -1.25rem rgba(0,0,0,0.3)',
                      fontWeight: 'bold',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="load"
                    stroke="hsl(var(--primary))"
                    strokeWidth={5}
                    fill="url(#fluxLoad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--success-500))"
                    strokeWidth={5}
                    fill="url(#fluxAcc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {renderChat()}
        </div>

        <div className="lg:col-span-4 space-y-10">
          {renderModelStats()}

          <div className="bg-card p-10 rounded-[3rem] border border-border shadow-2xl">
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase mb-8">
              System Health
            </h3>
            <div className="space-y-8">
              {[
                { label: 'API Latency', val: '45ms', status: 'optimal', color: 'success-500' },
                { label: 'Error Rate', val: '0.02%', status: 'optimal', color: 'success-500' },
                { label: 'CPU Usage', val: '78%', status: 'high', color: 'warning-500' },
                { label: 'Memory', val: '12GB', status: 'optimal', color: 'success-500' },
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full bg-${metric.color}`}></div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-lg font-black text-foreground font-mono">{metric.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button
                aria-label="View system logs"
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[0.625rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                View System Logs
              </button>
            </div>
          </div>

          <div className="bg-card p-8 rounded-3xl text-card-foreground shadow-xl relative overflow-hidden group border border-border">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Box className="w-48 h-48" />
            </div>
            <h4 className="text-[0.625rem] font-black uppercase tracking-[0.4em] text-primary mb-6">
              Regional Activity
            </h4>
            <div className="space-y-4">
              {[
                { name: 'Lahore Ops', stability: 94, trend: 'up' },
                { name: 'Karachi Tech', stability: 82, trend: 'down' },
                { name: 'Global Supply', stability: 98, trend: 'up' },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-black uppercase">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[0.5625rem] font-bold text-muted-foreground">
                        {c.stability}% Stability
                      </span>
                    </div>
                  </div>
                  {c.trend === 'up' ? (
                    <TrendingUp size={14} className="text-success-500" />
                  ) : (
                    <TrendingDown size={14} className="text-destructive" />
                  )}
                </div>
              ))}
            </div>
            <button
              aria-label="View regional activity details"
              className="w-full mt-6 py-4 bg-foreground text-background rounded-xl font-black uppercase text-[0.625rem] tracking-widest shadow-lg hover:scale-105 transition-all"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralModule;
