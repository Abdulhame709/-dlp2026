'use client';

import * as React from 'react';
import { ConversationSession, ChatMessage } from '@/features/ai/chat/conversation-types';
import { ConversationService } from '@/features/ai/chat/conversation-service';
import { AIAssistantService } from '@/features/ai/core/AIAssistantService';
import { AuthService } from '@/core/auth/auth-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { AIMemoryRecord } from '@/features/ai/memory/memory-types';
import { LongTermMemoryManager } from '@/features/ai/memory/long-term-memory';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Info, 
  TrendingUp,
  CheckCircle,
  User,
  Building,
  Calendar,
  Layers,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export default function AIAssistantPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string>('11111111-1111-1111-1111-111111111111');

  // 1. Core State
  const [sessions, setSessions] = React.useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = React.useState<ConversationSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isThinking, setIsThinking] = React.useState(false);
  const [promptInput, setPromptInput] = React.useState('');

  // AI Memories state
  const [memories, setMemories] = React.useState<AIMemoryRecord[]>([]);

  // 2. Intelligent AI Features States
  const [aiPrioritization, setAiPrioritization] = React.useState<any>(null);
  const [aiDailyPlan, setAiDailyPlan] = React.useState<any>(null);
  const [aiCoachAdvice, setAiCoachAdvice] = React.useState<any>(null);
  const [aiBreakdown, setAiBreakdown] = React.useState<any>(null);
  const [isFeatureLoading, setIsFeatureLoading] = React.useState<string | null>(null);

  // 3. Context Visualization State
  const [showContextVisualizer, setShowContextVisualizer] = React.useState(true);

  // 4. Dynamic task context for AI features (replaces hardcoded task ID)
  const [contextTaskId, setContextTaskId] = React.useState<string>('');
  const [contextTaskTitle, setContextTaskTitle] = React.useState<string>('');

  // Load first task for AI feature context
  React.useEffect(() => {
    async function loadTaskContext() {
      try {
        const { TaskService } = await import('@/features/tasks/services/task-service');
        const tasks = await TaskService.getUserTasks(userId);
        if (tasks.length > 0) {
          setContextTaskId(tasks[0].id);
          setContextTaskTitle(tasks[0].title);
        }
      } catch {
        // No tasks available — features will use empty context
      }
    }
    if (userId && userId !== '11111111-1111-1111-1111-111111111111') {
      loadTaskContext();
    }
  }, [userId]);

  // Load current user details on mount to resolve session dynamically
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session during AI Assistant mount:', err);
      }
    }
    loadUser();
  }, []);

  // Load Sessions and Memories on Mount dynamically based on the resolved user ID
  const loadSessionsAndMemories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await ConversationService.getUserSessions(userId);
      setSessions(list);
      if (list.length > 0) {
        const detailed = await ConversationService.getSession(list[0].id);
        setActiveSession(detailed);
      }

      // Load or Seed long-term memories
      let activeMemories = await LongTermMemoryManager.getMemories(userId);
      if (activeMemories.length === 0) {
        await LongTermMemoryManager.saveMemory(userId, 'WORK_PATTERN', 'Prefers morning deep focus slots (09:00 - 12:00)', 8);
        await LongTermMemoryManager.saveMemory(userId, 'PREFERENCE', 'Works significantly better with detailed checklists', 7);
        await LongTermMemoryManager.saveMemory(userId, 'BEHAVIOR', 'Focuses best inside 90-minute blocks', 6);
        activeMemories = await LongTermMemoryManager.getMemories(userId);
      }
      setMemories(activeMemories);
    } catch (err) {
      console.error('Failed to load conversations or memories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadSessionsAndMemories();
  }, [loadSessionsAndMemories]);

  // Create New Conversation Session
  const handleStartNewSession = async () => {
    try {
      const newSession = await ConversationService.startNewSession(
        userId,
        `AI Chat Session #${sessions.length + 1}`,
        'General'
      );
      setSessions(prev => [newSession, ...prev]);
      setActiveSession({ ...newSession, messages: [] });
    } catch (err) {
      console.error('Failed to start new chat:', err);
    }
  };

  // Submit Prompt in Active Session
  const handleSendPrompt = async () => {
    if (!promptInput.trim() || !activeSession || isThinking) return;

    const userMessageContent = promptInput;
    setPromptInput('');
    setIsThinking(true);

    try {
      // 1. Save user prompt locally and inside DB
      const userMsg = await ConversationService.saveMessage(activeSession.id, 'USER', userMessageContent);
      setActiveSession(prev => prev ? { ...prev, messages: [...(prev.messages || []), userMsg] } : null);

      // 2. Dispatch query to AI Assistant Service
      const response = await AIAssistantService.getCoachingAdvice(userId);
      
      // 3. Save AI Response
      const aiMsg = await ConversationService.saveMessage(activeSession.id, 'ASSISTANT', response.coachingAdvice);
      setActiveSession(prev => prev ? { ...prev, messages: [...(prev.messages || []), aiMsg] } : null);
    } catch (err: any) {
      console.error('AI Request Failed:', err.message);
    } finally {
      setIsThinking(false);
    }
  };

  // Soft Delete Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ConversationService.softDeleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // Delete Memory item
  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const success = await LongTermMemoryManager.deleteMemory(userId, memoryId);
      if (success) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      }
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  // Thumbs up/down Rating system trigger
  const handleRateMessage = async (messageId: string, rating: 'LIKE' | 'DISLIKE') => {
    try {
      await ConversationService.rateMessage(messageId, rating);
      // Elevate rating local state
      setActiveSession(prev => {
        if (!prev) return null;
        const updated = (prev.messages || []).map(m => 
          m.id === messageId ? { ...m, rating } : m
        );
        return { ...prev, messages: updated };
      });
    } catch (err) {
      console.error('Failed to rate message:', err);
    }
  };

  // AI Feature Trigger: Prioritize My Tasks
  const triggerPrioritize = async () => {
    if (!contextTaskId) return; // No task context available
    setIsFeatureLoading('PRIORITIZE');
    try {
      const response = await AIAssistantService.prioritizeTask(
        userId,
        contextTaskId,
        contextTaskTitle,
        'Analyzing task priority'
      );
      setAiPrioritization(response);
    } finally {
      setIsFeatureLoading(null);
    }
  };

  // AI Feature Trigger: Daily Planner
  const triggerPlanner = async () => {
    setIsFeatureLoading('PLANNER');
    try {
      const response = await AIAssistantService.generateDailyPlan(userId);
      setAiDailyPlan(response);
    } finally {
      setIsFeatureLoading(null);
    }
  };

  // AI Feature Trigger: Task Breakdown
  const triggerBreakdown = async () => {
    if (!contextTaskId) return; // No task context available
    setIsFeatureLoading('BREAKDOWN');
    try {
      const response = await AIAssistantService.breakdownTask(
        userId,
        contextTaskId,
        contextTaskTitle,
        'Breakdown into subtasks'
      );
      setAiBreakdown(response);
    } finally {
      setIsFeatureLoading(null);
    }
  };

  // AI Feature Trigger: Ask Coach
  const triggerCoach = async () => {
    setIsFeatureLoading('COACH');
    try {
      const response = await AIAssistantService.getCoachingAdvice(userId);
      setAiCoachAdvice(response);
    } finally {
      setIsFeatureLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[82vh] max-w-7xl mx-auto overflow-hidden animate-fade-in">
      
      {/* ========================================== */}
      {/* SIDEBAR: Conversation Session List (Left)  */}
      {/* ========================================== */}
      <div className="border border-border bg-card rounded-xl flex flex-col overflow-hidden h-full select-none shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-bold">{t('aiAssistant.conversations')}</span>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleStartNewSession}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">{t('aiAssistant.noChats')}</div>
          ) : (
            sessions.map(session => {
              const isActive = activeSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={async () => {
                    const detailed = await ConversationService.getSession(session.id);
                    setActiveSession(detailed);
                  }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold',
                    {
                      'bg-primary/10 text-primary border border-primary/20': isActive,
                      'hover:bg-muted text-muted-foreground hover:text-foreground': !isActive,
                    }
                  )}
                >
                  <span className="truncate flex-1 pr-2">{session.title}</span>
                  <button 
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="text-muted-foreground hover:text-error opacity-60 hover:opacity-100 p-1 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* CHAT AREA: User & AI messages (Center)     */}
      {/* ========================================== */}
      <div className="lg:col-span-2 border border-border bg-card rounded-xl flex flex-col overflow-hidden h-full shadow-sm">
        {/* Chat Title bar */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between select-none bg-muted/25">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-primary shrink-0" />
            <span className="text-xs font-bold text-foreground">
              {activeSession ? activeSession.title : t('aiAssistant.title')}
            </span>
          </div>
        </div>

        {/* Chat Message list wrapper */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
              <BrainCircuit className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold">{t('aiAssistant.selectOrStart')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('aiAssistant.selectOrStartDesc')}</p>
            </div>
          ) : (activeSession.messages || []).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
              <Sparkles className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-xs font-bold">{t('aiAssistant.emptyChat')}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{t('aiAssistant.emptyChatDesc')}</p>
            </div>
          ) : (
            (activeSession.messages || []).map(message => {
              const isAssistant = message.role === 'ASSISTANT';
              return (
                <div
                  key={message.id}
                  className={cn('flex flex-col max-w-[85%] rounded-xl p-4 text-xs font-medium space-y-2 leading-relaxed shadow-sm', {
                    'self-end bg-primary text-primary-foreground ml-auto': !isAssistant,
                    'self-start bg-muted border border-border text-foreground mr-auto': isAssistant,
                  })}
                >
                  <p>{message.content}</p>
                  
                  {/* Assistant Thumbs Rating widgets */}
                  {isAssistant && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/40 select-none">
                      <button 
                        onClick={() => handleRateMessage(message.id, 'LIKE')}
                        className={cn('p-1 rounded text-muted-foreground hover:text-secondary cursor-pointer', {
                          'text-secondary': message.rating === 'LIKE'
                        })}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRateMessage(message.id, 'DISLIKE')}
                        className={cn('p-1 rounded text-muted-foreground hover:text-error cursor-pointer', {
                          'text-error': message.rating === 'DISLIKE'
                        })}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Thinking animation state */}
          {isThinking && (
            <div className="flex items-center space-x-2.5 p-3 border border-border bg-muted/30 rounded-xl max-w-xs text-xs font-semibold text-muted-foreground animate-pulse select-none">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300" />
              <span>{t('aiAssistant.thinking')}</span>
            </div>
          )}
        </div>

        {/* Input prompt tray */}
        <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
          <Input
            placeholder={t('aiAssistant.inputPlaceholder')}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value.slice(0, 1000))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt();
            }}
            className="text-xs bg-card"
            disabled={!activeSession || isThinking}
          />
          <Button variant="primary" size="sm" className="h-10 px-4 cursor-pointer shrink-0" onClick={handleSendPrompt} disabled={!activeSession || isThinking}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ========================================== */}
      {/* PANEL: 4 Intelligent AI Tools (Right)      */}
      {/* ========================================== */}
      <div className="border border-border bg-card rounded-xl flex flex-col overflow-hidden h-full overflow-y-auto p-4 space-y-6 shadow-sm select-none">
        
        {/* Personal AI Memory Section (SaaS Upgrade) */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
              <BrainCircuit className="h-4 w-4 text-primary animate-pulse" /> {t('aiAssistant.personalMemory')}
            </span>
          </div>
          <div className="space-y-2 pt-2">
            {memories.map(mem => (
              <div key={mem.id} className="p-2.5 border border-border bg-muted/35 rounded-lg flex items-start justify-between gap-1 text-[10px] leading-relaxed">
                <span>{mem.content}</span>
                <button 
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="text-muted-foreground hover:text-error opacity-60 hover:opacity-100 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-tight">{t('aiAssistant.workspaceTools')}</h2>
          <p className="text-[10px] text-muted-foreground font-arabic">{t('aiAssistant.workspaceToolsDesc')}</p>
        </div>

        <div className="space-y-4">
          {/* Tool A: AI Task Prioritizer */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-primary">
              <Sparkles className="h-4 w-4" /> {t('aiAssistant.prioritizer')}
            </h3>
            <p className="text-[10px] text-muted-foreground">{t('aiAssistant.prioritizerDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[11px]"
              onClick={triggerPrioritize}
              isLoading={isFeatureLoading === 'PRIORITIZE'}
            >
              {t('aiAssistant.analyzeMyTasks')}
            </Button>
            {aiPrioritization && (
              <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-[10px] space-y-1.5 animate-fade-in leading-relaxed">
                <div className="flex justify-between font-bold">
                  <span>Suggested: <strong className="text-error uppercase">{aiPrioritization.suggestedPriority}</strong></span>
                  <span className="text-primary">Score: {aiPrioritization.score}%</span>
                </div>
                <p className="text-muted-foreground text-[10px]">{aiPrioritization.reasoning}</p>
              </div>
            )}
          </Card>

          {/* Tool B: AI Daily Planner */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-accent">
              <Calendar className="h-4 w-4" /> {t('aiAssistant.dailyPlanner')}
            </h3>
            <p className="text-[10px] text-muted-foreground">{t('aiAssistant.dailyPlannerDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[11px]"
              onClick={triggerPlanner}
              isLoading={isFeatureLoading === 'PLANNER'}
            >
              {t('aiAssistant.generateSchedule')}
            </Button>
            {aiDailyPlan && (
              <div className="p-2.5 bg-accent/5 border border-accent/20 rounded-lg text-[10px] space-y-2 animate-fade-in leading-relaxed">
                <div className="font-bold text-accent">Timeline: {aiDailyPlan.date}</div>
                {aiDailyPlan.scheduleBlocks.map((block: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-1 bg-card rounded border border-border">
                    <span>{block.time} - {block.taskTitle}</span>
                    <span className="font-bold">{block.focusLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tool C: AI Productivity Coach */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-secondary">
              <TrendingUp className="h-4.5 w-4.5 text-secondary" /> {t('aiAssistant.productivityCoach')}
            </h3>
            <p className="text-[10px] text-muted-foreground">{t('aiAssistant.productivityCoachDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[11px]"
              onClick={triggerCoach}
              isLoading={isFeatureLoading === 'COACH'}
            >
              {t('aiAssistant.askCoach')}
            </Button>
            {aiCoachAdvice && (
              <div className="p-2.5 bg-secondary/5 border border-secondary/20 rounded-lg text-[10px] space-y-1.5 animate-fade-in leading-relaxed">
                <p className="font-bold text-secondary">Behavioral Advice:</p>
                <p className="text-muted-foreground">{aiCoachAdvice.coachingAdvice}</p>
              </div>
            )}
          </Card>

          {/* Tool D: AI Task Breakdown */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-purple-500">
              <Layers className="h-4 w-4" /> {t('aiAssistant.taskBreakdown')}
            </h3>
            <p className="text-[10px] text-muted-foreground">{t('aiAssistant.taskBreakdownDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[11px]"
              onClick={triggerBreakdown}
              isLoading={isFeatureLoading === 'BREAKDOWN'}
            >
              {t('aiAssistant.breakdownTask')}
            </Button>
            {aiBreakdown && (
              <div className="p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-lg text-[10px] space-y-2 animate-fade-in leading-relaxed">
                <p className="font-bold text-purple-500">Subtask Items:</p>
                {aiBreakdown.subtasks.map((st: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-1 bg-card rounded border border-border">
                    <span>{st.title}</span>
                    <span className="font-bold uppercase text-purple-500">{st.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ========================================== */}
        {/* CONTEXT VISUALIZATION PANEL (Privacy)      */}
        {/* ========================================== */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-primary" /> {t('aiAssistant.activeContext')}
            </span>
            <Button variant="ghost" className="h-4 px-1 text-[9px] text-muted-foreground" onClick={() => setShowContextVisualizer(!showContextVisualizer)}>
              {showContextVisualizer ? t('aiAssistant.hide') : t('aiAssistant.show')}
            </Button>
          </div>

          {showContextVisualizer && (
            <div className="p-3 bg-muted/40 border border-border rounded-lg text-[9px] space-y-1.5 leading-normal font-medium text-muted-foreground select-none animate-fade-in">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-primary" /> <strong>{t('aiAssistant.userContext')}</strong> {sessions.length} active sessions
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-secondary" /> <strong>{t('aiAssistant.taskContext')}</strong> {contextTaskTitle || 'No active task'}
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3 text-accent" /> <strong>{t('aiAssistant.orgContext')}</strong> Multi-tenant RLS active
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
