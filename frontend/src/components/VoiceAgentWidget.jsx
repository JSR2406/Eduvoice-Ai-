import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Square, Loader, Volume2, Activity } from 'lucide-react';

export default function VoiceAgentWidget() {
  const [status, setStatus] = useState('disconnected'); // disconnected, connected, listening, speaking, processing
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const wsRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    setStatus('connecting');
    const ws = new WebSocket('ws://localhost:8000/ws/voice-agent');
    
    ws.onopen = () => {
      setStatus('connected');
      setMessages(prev => [...prev, { role: 'system', content: 'Agent connected. Ready for inputs.' }]);
    };

    ws.onmessage = async (event) => {
      // Check if it's text/json or binary
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'status') {
             if (data.status === 'processing') setStatus('processing');
             if (data.status === 'speaking') setStatus('speaking');
          } else if (data.type === 'text') {
             setMessages(prev => [...prev, { role: 'agent', content: data.text }]);
          } else if (data.type === 'error') {
             setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.error}` }]);
             setStatus('connected');
          }
        } catch(e) {
          console.error("Failed to parse message", event.data);
        }
      } else if (event.data instanceof Blob) {
        // We received audio bytes
        const audioUrl = URL.createObjectURL(event.data);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setStatus('connected');
        
        audioRef.current.onended = () => {
            // cleanup object url
            URL.revokeObjectURL(audioUrl);
        };
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      setMessages(prev => [...prev, { role: 'system', content: 'Agent disconnected.' }]);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleSendText = () => {
    if (!inputText.trim() || status === 'disconnected' || status === 'connecting') return;
    
    setMessages(prev => [...prev, { role: 'user', content: inputText }]);
    
    // Send as JSON
    wsRef.current.send(JSON.stringify({ type: 'text', text: inputText }));
    setInputText('');
    setStatus('processing');
  };

  return (
    <div className="card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          <Activity size={18} className="text-indigo-400" />
          Real-Time Voice Agent
        </h2>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-500 capitalize">{status}</span>
           {status === 'disconnected' ? (
              <button onClick={connectWebSocket} className="btn-primary text-xs py-1 px-3">Connect</button>
           ) : (
              <button onClick={disconnectWebSocket} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors">Disconnect</button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 bg-slate-900/50 rounded-xl border border-white/5">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">
            Connect to start interacting with the Sarvam AI voice agent.
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-2 rounded-xl text-sm ${
                msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-br-sm' : 
                msg.role === 'system' ? 'bg-slate-800 text-slate-400 text-xs w-full text-center' :
                'bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {(status === 'processing' || status === 'speaking') && (
           <div className="flex justify-start">
             <div className="bg-white/5 p-2 rounded-xl rounded-bl-sm border border-white/5 text-slate-400 flex items-center gap-2 text-sm">
                {status === 'processing' ? <Loader size={14} className="animate-spin" /> : <Volume2 size={14} className="animate-pulse text-indigo-400" />}
                {status === 'processing' ? 'Thinking...' : 'Speaking...'}
             </div>
           </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="Type a message to the agent..."
          disabled={status === 'disconnected' || status === 'connecting'}
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
        />
        <button 
          onClick={handleSendText}
          disabled={!inputText.trim() || status === 'disconnected' || status === 'connecting'}
          className="btn-primary p-2 shrink-0 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
