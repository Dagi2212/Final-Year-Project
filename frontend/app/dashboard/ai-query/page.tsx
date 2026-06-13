'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Bot, Send, User, Database, Loader2, Sparkles, AlertCircle, Plus, MessageSquare, Trash2, History } from 'lucide-react';

interface Citation {
  source: string;
  description: string;
  row_count: number;
}

interface RagStatus {
  rag_status: string;
  llm_provider: string;
  llm_model: string;
  api_key_configured: boolean;
  db_accessible: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  context_summary?: string;
  tokens_used?: number;
  timestamp: Date;
  error?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  datasetType: string;
  createdAt: Date;
}

const EXAMPLE_QUESTIONS = [
  'Which regions have the lowest teff yields and why?',
  'Compare maize production between Oromia and Amhara',
  'What are the seasonal yield trends for wheat?',
  'Which kebeles have the most pest issues?',
  'Show me farmer distribution across regions',
  'What is the average yield for belg season crops?',
];

export default function AiQueryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [datasetType, setDatasetType] = useState<string>('all');
  const [ragStatus, setRagStatus] = useState<RagStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load sessions on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_query_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const revived = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(revived);
        if (revived.length > 0) {
          setActiveSessionId(revived[0].id);
          setMessages(revived[0].messages);
          setDatasetType(revived[0].datasetType || 'all');
        }
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }
    fetchStatus();
  }, []);

  // Save sessions when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ai_query_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update active session when messages change
  useEffect(() => {
    if (activeSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages, datasetType } 
          : s
      ));
    }
  }, [messages, datasetType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const status = await apiClient.get<RagStatus>('/rag/status');
      setRagStatus(status);
    } catch {
      // status endpoint may return 503 if not ready — still set what we can
    } finally {
      setStatusLoading(false);
    }
  };

  const createNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setDatasetType('all');
    setInput('');
    textareaRef.current?.focus();
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setDatasetType(session.datasetType);
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('ai_query_sessions', JSON.stringify(updatedSessions));
    
    if (activeSessionId === sessionId) {
      createNewChat();
    }
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    let currentSessionId = activeSessionId;
    let newMessages = [...messages, userMsg];
    
    // Create new session if none active
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
        messages: [userMsg],
        datasetType,
        createdAt: new Date(),
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
    }

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<any>('/rag/query', {
        question,
        dataset_type: datasetType === 'all' ? undefined : datasetType,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer || 'No answer returned.',
        citations: res.citations || [],
        context_summary: res.context_summary,
        tokens_used: res.tokens_used,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: err.message?.includes('ANTHROPIC_API_KEY')
          ? 'The RAG system is not configured. Please add your ANTHROPIC_API_KEY to the backend .env file.'
          : err.message || 'Query failed. Please try again.',
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
      toast.error('Query failed');
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sourceColor: Record<string, string> = {
    imported_records: 'bg-blue-100 text-blue-800',
    observations: 'bg-green-100 text-green-800',
    farmers: 'bg-amber-100 text-amber-800',
    predictions: 'bg-purple-100 text-purple-800',
    system_summary: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="flex flex-col h-screen p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Data Query
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about agricultural data in plain English
          </p>
        </div>

        {/* Status indicator */}
        {!statusLoading && ragStatus && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                ragStatus.rag_status === 'ready' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-muted-foreground">
              {ragStatus.rag_status === 'ready' ? `${ragStatus.llm_model}` : 'RAG not configured'}
            </span>
          </div>
        )}
      </div>

      {/* Not configured warning */}
      {!statusLoading && ragStatus && !ragStatus.api_key_configured && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <span>
            <strong>ANTHROPIC_API_KEY</strong> is not set in the backend .env file. Add it from{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              console.anthropic.com
            </a>{' '}
            to enable AI queries.
          </span>
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* History Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                History
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNewChat} title="New Chat">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No history yet
                  </div>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => switchSession(s.id)}
                      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                        activeSessionId === s.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1">
                        <MessageSquare className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Messages */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                  <Bot className="w-12 h-12 text-muted-foreground/40" />
                  <div>
                    <p className="text-lg font-medium text-foreground">Ask anything about your data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The AI will query your live agricultural database and give grounded answers.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-lg w-full">
                    {EXAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-left text-xs p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : msg.error
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                          : 'bg-muted rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.citations.map((c, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              sourceColor[c.source] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <Database className="w-3 h-3" />
                            {c.source} ({c.row_count})
                          </span>
                        ))}
                        {msg.tokens_used && (
                          <span className="text-xs text-muted-foreground px-1 flex items-center">
                            {msg.tokens_used} tokens
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Querying database and generating answer…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t p-4 flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask a question about crop yields, farmer data, regional trends…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={loading}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Press Enter to send, Shift+Enter for new line</p>
              </div>
              <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar controls */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Query Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Data Source
                </label>
                <Select value={datasetType} onValueChange={setDatasetType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="imported_records">Imported Records</SelectItem>
                    <SelectItem value="observations">Field Observations</SelectItem>
                    <SelectItem value="farmers">Farmer Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span><strong>Retrieve</strong> — SQL queries pull live data from PostgreSQL based on your question</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span><strong>Augment</strong> — Real database numbers are formatted as context</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span><strong>Generate</strong> — Claude AI reads the actual data and writes a grounded answer</span>
              </div>
            </CardContent>
          </Card>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={createNewChat}
            >
              New conversation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
