'use client';

import * as React from 'react';
import { Task, TaskStatus, TaskPriority, ChecklistItem, Comment, Activity } from '@/core/types/task-types';
import { TaskService } from '@/features/tasks/services/task-service';
import { TaskStateMachine } from '@/features/tasks/services/task-state-machine';
import { AIAssistantService } from '@/features/ai/core/AIAssistantService';
import { useKeyboardShortcuts } from '@/shared/hooks/use-shortcuts';
import { SyncManager } from '@/core/utils/sync-manager';
import { Widget } from '@/shared/components/dashboard/widget';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  List, 
  Layers, 
  Calendar, 
  GanttChart, 
  Plus, 
  Trash2, 
  Archive, 
  CheckSquare, 
  Sparkles, 
  Filter, 
  X, 
  ChevronRight, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  Activity as ActivityIcon,
  Flame,
  Undo,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

type TaskView = 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE';
type TaskFilterType = 'ALL' | 'TODAY' | 'UPCOMING' | 'PRIORITY' | 'COMPLETED';

export default function TasksPage() {
  // Core Task State
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [activeView, setActiveView] = React.useState<TaskView>('LIST');
  const [activeTabFilter, setActiveTabFilter] = React.useState<TaskFilterType>('ALL');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('ALL');
  const [isAiFilterActive, setIsAiFilterActive] = React.useState(false);

  // Modals & Panels Drawer States
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  
  // AI Task Intelligence States
  const [isAnalyzingTask, setIsAnalyzingTask] = React.useState(false);
  const [aiTaskSuggestions, setAiTaskSuggestions] = React.useState<any>(null);

  // Form bindings for New Task
  const [newTitle, setNewTitle] = React.useState('');
  const [newPriority, setNewPriority] = React.useState<TaskPriority>('MEDIUM');
  const [newStatus, setNewStatus] = React.useState<TaskStatus>('INBOX');
  const [newDesc, setNewDesc] = React.useState('');

  // Checklist / Comment form bindings inside Detail Drawer
  const [checklistInput, setChecklistInput] = React.useState('');
  const [commentInput, setCommentInput] = React.useState('');

  const demoUserId = '11111111-1111-1111-1111-111111111111';

  // Load Tasks on Mount
  const loadTasks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await TaskService.getUserTasks(demoUserId);
      setTasks(fetched);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Execute background sync of offline operations when browser is online
  React.useEffect(() => {
    const handleOnline = async () => {
      await SyncManager.syncPendingOperations(async (op) => {
        if (op.action === 'CREATE') {
          await TaskService.createTask(demoUserId, op.payload);
        } else if (op.action === 'UPDATE') {
          await TaskService.updateTask(op.payload.id, op.payload);
        } else if (op.action === 'DELETE') {
          await TaskService.deleteTask(op.payload.id);
        }
        return true;
      });
      loadTasks();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadTasks]);

  // Keyboard Shortcuts Mapping (N, E, Delete, Ctrl+Enter)
  useKeyboardShortcuts({
    n: () => setIsNewTaskModalOpen(true),
    e: () => { if (selectedTask) setSelectedTask(selectedTask); },
    delete: () => {
      if (selectedTask) {
        handleDeleteTask(selectedTask.id);
      } else if (selectedTasks.length > 0) {
        handleBulkDelete();
      }
    },
    'ctrl+enter': () => {
      if (isNewTaskModalOpen) handleCreateTask();
    }
  });

  // Task Mutators with Optimistic UI updates & Offline Support
  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;

    const payload: Partial<Task> = {
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
    };

    // Optimistic UI state insertion
    const tempId = `task-temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      userId: demoUserId,
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks(prev => [tempTask, ...prev]);
    setIsNewTaskModalOpen(false);
    setNewTitle('');
    setNewDesc('');

    if (!SyncManager.isOnline()) {
      await SyncManager.queueOperation('CREATE', 'TASK', payload);
      return;
    }

    try {
      await TaskService.createTask(demoUserId, payload);
    } catch {
      // Revert on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } finally {
      loadTasks();
    }
  };

  const handleUpdateStatus = async (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Validate transition via state machine before mutating
      TaskStateMachine.transition(task.status, targetStatus);

      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus, updatedAt: new Date() } : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: targetStatus } : null);
      }

      if (!SyncManager.isOnline()) {
        await SyncManager.queueOperation('UPDATE', 'TASK', { id: taskId, status: targetStatus });
        return;
      }

      await TaskService.updateTask(taskId, { status: targetStatus });
    } catch (err: any) {
      alert(`Invalid State Transition: ${err.message}`);
    } finally {
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic Delete
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);

    if (!SyncManager.isOnline()) {
      await SyncManager.queueOperation('DELETE', 'TASK', { id: taskId });
      return;
    }

    try {
      await TaskService.deleteTask(taskId);
    } finally {
      loadTasks();
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    // Optimistic complete
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', completedAt: new Date() } : t));

    try {
      await TaskService.completeTask(taskId);
    } finally {
      loadTasks();
    }
  };

  // AI Task Intelligence Trigger & apply functions
  const triggerTaskAnalysis = async () => {
    if (!selectedTask) return;
    setIsAnalyzingTask(true);
    setAiTaskSuggestions(null);
    try {
      const response = await AIAssistantService.analyzeTaskIntelligence(
        demoUserId,
        selectedTask.title,
        selectedTask.description || ''
      );
      setAiTaskSuggestions(response);
    } catch (err) {
      console.error('AI Task analysis failed:', err);
    } finally {
      setIsAnalyzingTask(false);
    }
  };

  const applyAiDescription = async () => {
    if (!selectedTask || !aiTaskSuggestions) return;
    const betterDesc = aiTaskSuggestions.betterDescription;
    setSelectedTask(prev => prev ? { ...prev, description: betterDesc } : null);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, description: betterDesc } : t));
    await TaskService.updateTask(selectedTask.id, { description: betterDesc });
  };

  const applyAiPriority = async () => {
    if (!selectedTask || !aiTaskSuggestions) return;
    const priority = aiTaskSuggestions.suggestedPriority as TaskPriority;
    setSelectedTask(prev => prev ? { ...prev, priority } : null);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, priority } : t));
    await TaskService.updateTask(selectedTask.id, { priority });
  };

  const applyAiDuration = async () => {
    if (!selectedTask || !aiTaskSuggestions) return;
    const duration = aiTaskSuggestions.suggestedDuration;
    setSelectedTask(prev => prev ? { ...prev, estimatedDuration: duration } : null);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, estimatedDuration: duration } : t));
    await TaskService.updateTask(selectedTask.id, { estimatedDuration: duration });
  };

  // Checklist Mutations
  const handleAddChecklistItem = async () => {
    if (!selectedTask || !checklistInput.trim()) return;

    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      title: checklistInput,
      isCompleted: false,
    };

    const updatedChecklist = [...(selectedTask.checklist || []), newItem];
    const updated = { ...selectedTask, checklist: updatedChecklist };

    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
    setChecklistInput('');

    await TaskService.updateTask(selectedTask.id, { checklist: updatedChecklist } as any);
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!selectedTask) return;

    const updatedChecklist = (selectedTask.checklist || []).map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );

    const updated = { ...selectedTask, checklist: updatedChecklist };
    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));

    await TaskService.updateTask(selectedTask.id, { checklist: updatedChecklist } as any);
  };

  // Comment Mutations
  const handleAddComment = async () => {
    if (!selectedTask || !commentInput.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      taskId: selectedTask.id,
      userId: demoUserId,
      fullName: 'Abdul Hameed',
      content: commentInput,
      createdAt: new Date(),
    };

    const updatedComments = [...(selectedTask.comments || []), newComment];
    const updated = { ...selectedTask, comments: updatedComments };

    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
    setCommentInput('');

    await TaskService.updateTask(selectedTask.id, { comments: updatedComments } as any);
  };

  // Bulk Actions
  const handleBulkComplete = async () => {
    setIsLoading(true);
    for (const id of selectedTasks) {
      await TaskService.completeTask(id);
    }
    setSelectedTasks([]);
    loadTasks();
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    for (const id of selectedTasks) {
      await TaskService.deleteTask(id);
    }
    setSelectedTasks([]);
    loadTasks();
  };

  // Filters application
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

    // Priority filter
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    // AI Filter
    const matchesAi = !isAiFilterActive || task.priority === 'CRITICAL' || task.priority === 'HIGH';

    // Premium Smart Views filter (Today, Upcoming, High Priority, Completed)
    let matchesTab = true;
    if (activeTabFilter === 'TODAY') {
      matchesTab = task.status === 'IN_PROGRESS' || task.priority === 'CRITICAL';
    } else if (activeTabFilter === 'UPCOMING') {
      matchesTab = task.status === 'PLANNED' || task.status === 'INBOX';
    } else if (activeTabFilter === 'PRIORITY') {
      matchesTab = task.priority === 'CRITICAL' || task.priority === 'HIGH';
    } else if (activeTabFilter === 'COMPLETED') {
      matchesTab = task.status === 'COMPLETED';
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesAi && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Tasks</h1>
          <p className="text-xs text-muted-foreground font-arabic">نظام إدارة المهام وجدولة الأولويات الذكي</p>
        </div>
        
        {/* Toggle between List, Kanban, Calendar, and Timeline */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border p-1 bg-card h-10">
          <Button 
            variant={activeView === 'LIST' ? 'primary' : 'ghost'} 
            size="sm" 
            className="h-8 text-xs cursor-pointer"
            onClick={() => setActiveView('LIST')}
          >
            <List className="h-4 w-4 mr-1 shrink-0" /> List
          </Button>
          <Button 
            variant={activeView === 'KANBAN' ? 'primary' : 'ghost'} 
            size="sm" 
            className="h-8 text-xs cursor-pointer"
            onClick={() => setActiveView('KANBAN')}
          >
            <Layers className="h-4 w-4 mr-1 shrink-0" /> Kanban
          </Button>
          <Button 
            variant={activeView === 'CALENDAR' ? 'primary' : 'ghost'} 
            size="sm" 
            className="h-8 text-xs cursor-pointer"
            onClick={() => setActiveView('CALENDAR')}
          >
            <Calendar className="h-4 w-4 mr-1 shrink-0" /> Calendar
          </Button>
          <Button 
            variant={activeView === 'TIMELINE' ? 'primary' : 'ghost'} 
            size="sm" 
            className="h-8 text-xs cursor-pointer"
            onClick={() => setActiveView('TIMELINE')}
          >
            <GanttChart className="h-4 w-4 mr-1 shrink-0" /> Timeline
          </Button>
        </div>
      </div>

      {/* 2. Premium Smart Views Navigation Tab Layout */}
      <div className="flex items-center gap-1.5 border-b border-border pb-1 select-none overflow-x-auto">
        {(['ALL', 'TODAY', 'UPCOMING', 'PRIORITY', 'COMPLETED'] as TaskFilterType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={cn(
              'h-9 px-4 text-xs font-bold transition-all relative border-b-2 border-transparent hover:text-foreground cursor-pointer whitespace-nowrap',
              {
                'text-primary border-primary': activeTabFilter === tab,
                'text-muted-foreground': activeTabFilter !== tab,
              }
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Search, Filters, and Creation Triggers */}
      <div className="flex flex-col md:flex-row gap-4 justify-between select-none">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses (الجميع)</option>
            <option value="INBOX">Inbox (الوارد)</option>
            <option value="PLANNED">Planned (المجدول)</option>
            <option value="IN_PROGRESS">In Progress (قيد العمل)</option>
            <option value="WAITING">Waiting (المعلق)</option>
            <option value="COMPLETED">Completed (المكتمل)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities (الأولويات)</option>
            <option value="CRITICAL">Critical (حرج)</option>
            <option value="HIGH">High (عالي)</option>
            <option value="MEDIUM">Medium (متوسط)</option>
            <option value="LOW">Low (منخفض)</option>
          </select>

          <Button
            variant={isAiFilterActive ? 'secondary' : 'outline'}
            size="sm"
            className="h-9 text-xs cursor-pointer"
            onClick={() => setIsAiFilterActive(!isAiFilterActive)}
          >
            <Sparkles className="h-4 w-4 mr-1 text-primary shrink-0" /> AI Suggested
          </Button>
        </div>

        <div>
          <Button variant="primary" size="sm" className="h-9 text-xs" onClick={() => setIsNewTaskModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1 shrink-0" /> Add Task
          </Button>
        </div>
      </div>

      {/* 4. Bulk Actions Indicator (Fires when items selected) */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl select-none animate-fade-in">
          <span className="text-xs font-semibold text-primary">
            {selectedTasks.length} tasks selected (تم تحديدها)
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-secondary hover:bg-secondary/10" onClick={handleBulkComplete}>
              <CheckSquare className="h-4 w-4 mr-1" /> Complete
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-error hover:bg-error/10" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setSelectedTasks([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* 5. Active Main View Areas */}
      {isLoading ? (
        <div className="space-y-3">
          <Card className="h-20 flex items-center px-4"><Skeleton className="h-6 w-3/4" /></Card>
          <Card className="h-20 flex items-center px-4"><Skeleton className="h-6 w-1/2" /></Card>
          <Card className="h-20 flex items-center px-4"><Skeleton className="h-6 w-5/6" /></Card>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border rounded-xl">
          <CheckSquare className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-bold">No tasks found</h3>
          <p className="text-xs text-muted-foreground mt-1">There are no tasks matching your selected filters.</p>
        </div>
      ) : (
        <div className="w-full">
          
          {/* 5.1 List View */}
          {activeView === 'LIST' && (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setAiTaskSuggestions(null); // Clear previous suggestions on click
                  }}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-all cursor-pointer shadow-sm select-none animate-fade-in"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={selectedTasks.includes(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedTasks(prev => 
                          prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]
                        );
                      }}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    
                    <div className="flex flex-col min-w-0">
                      <span className={cn('text-sm font-semibold truncate', {
                        'line-through text-muted-foreground': task.status === 'COMPLETED'
                      })}>
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground truncate">{task.description}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full select-none uppercase', {
                      'bg-error/10 text-error': task.priority === 'CRITICAL' || task.priority === 'HIGH',
                      'bg-primary/10 text-primary': task.priority === 'MEDIUM',
                      'bg-muted-foreground/10 text-muted-foreground': task.priority === 'LOW',
                    })}>
                      {task.priority}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-muted/60 rounded-lg text-foreground select-none">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5.2 Kanban View */}
          {activeView === 'KANBAN' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(['INBOX', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map(status => {
                const columnTasks = filteredTasks.filter(t => t.status === status);
                return (
                  <div 
                    key={status} 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData('text/plain');
                      handleUpdateStatus(id, status);
                    }}
                    className="flex flex-col bg-muted/30 border border-border rounded-xl p-4 min-h-[500px]"
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-border select-none">
                      <span className="text-xs font-bold text-foreground uppercase">{status}</span>
                      <span className="h-5 w-5 bg-card border border-border text-[10px] font-bold flex items-center justify-center rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {columnTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                          }}
                          onClick={() => {
                            setSelectedTask(task);
                            setAiTaskSuggestions(null);
                          }}
                          className="p-3.5 bg-card border border-border rounded-xl shadow-sm hover:border-primary/20 cursor-grab active:cursor-grabbing select-none transition-all space-y-3"
                        >
                          <h4 className="text-xs font-bold text-foreground leading-snug">{task.title}</h4>
                          {task.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border/60">
                            <span className={cn('text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase', {
                              'bg-error/10 text-error': task.priority === 'CRITICAL' || task.priority === 'HIGH',
                              'bg-primary/10 text-primary': task.priority === 'MEDIUM',
                              'bg-muted-foreground/10 text-muted-foreground': task.priority === 'LOW',
                            })}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5.3 Calendar Grid View */}
          {activeView === 'CALENDAR' && (
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={day} className="flex flex-col border border-border bg-card rounded-xl p-3 min-h-[300px]">
                  <div className="text-xs font-bold text-muted-foreground mb-3 text-center border-b border-border pb-1.5 select-none">{day}</div>
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {filteredTasks.filter((_, idx) => idx % 7 === i).map(task => (
                      <div 
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setAiTaskSuggestions(null);
                        }}
                        className="p-2 border border-border bg-muted/35 hover:border-primary/25 rounded-lg text-[10px] font-semibold cursor-pointer truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5.4 Timeline View */}
          {activeView === 'TIMELINE' && (
            <div className="space-y-4 select-none">
              {filteredTasks.map((task, idx) => (
                <div key={task.id} onClick={() => {
                  setSelectedTask(task);
                  setAiTaskSuggestions(null);
                }} className="flex items-center border border-border rounded-xl bg-card p-4 hover:border-primary/20 cursor-pointer shadow-sm">
                  <span className="text-xs font-bold text-foreground w-48 truncate mr-4">{task.title}</span>
                  <div className="flex-1 h-6 bg-muted/40 rounded-lg relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-primary/15 border-l-2 border-primary"
                      style={{
                        left: `${(idx * 15) % 60}%`,
                        width: '30%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 6. Slide-Out Task Detail Drawer Panel */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex justify-end animate-fade-in" onClick={() => setSelectedTask(null)}>
          <div 
            className="w-full max-w-lg bg-card h-full border-l border-border shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6 select-none bg-muted/20">
              <span className="text-sm font-bold text-foreground">Task Details | تفاصيل المهمة</span>
              <button 
                onClick={() => setSelectedTask(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">{selectedTask.title}</h2>
                <span className="text-[10px] font-semibold text-muted-foreground select-none uppercase">ID: {selectedTask.id}</span>
              </div>

              {selectedTask.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Description</h4>
                  <p className="text-xs text-muted-foreground leading-normal p-3 rounded-lg bg-muted/30 border border-border">{selectedTask.description}</p>
                </div>
              )}

              {/* Status and Priority pills */}
              <div className="grid grid-cols-2 gap-4 select-none">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Status</span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value as TaskStatus)}
                    className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-semibold text-foreground outline-none cursor-pointer"
                  >
                    <option value="INBOX">Inbox</option>
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING">Waiting</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Priority</span>
                  <div className="h-9 border border-border rounded-lg bg-card px-3 flex items-center justify-between text-xs font-bold uppercase text-foreground">
                    {selectedTask.priority}
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* AI TASK INTELLIGENCE WIDGET (SaaS Polish) */}
              {/* ========================================== */}
              <Card className="p-4 border border-primary/20 bg-primary/5 space-y-3.5 select-none">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-4 w-4 animate-bounce text-primary shrink-0" /> AI Task Intelligence
                  </h4>
                  <Button 
                    variant="outline" 
                    className="h-7 px-2 text-[10px] bg-card hover:bg-muted"
                    onClick={triggerTaskAnalysis}
                    isLoading={isAnalyzingTask}
                  >
                    Get AI Advice
                  </Button>
                </div>

                {aiTaskSuggestions && (
                  <div className="space-y-3 animate-fade-in text-[11px] leading-relaxed">
                    {/* Suggestion 1: Better Description */}
                    <div className="p-2 bg-card rounded border border-border space-y-1">
                      <span className="font-bold text-primary block">Suggested Description:</span>
                      <p className="text-muted-foreground">{aiTaskSuggestions.betterDescription}</p>
                      <Button variant="ghost" className="h-5 px-1.5 text-[9px] mt-1 hover:bg-muted" onClick={applyAiDescription}>
                        Apply Description
                      </Button>
                    </div>

                    {/* Suggestion 2: Priority and Duration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-card rounded border border-border space-y-1">
                        <span className="font-bold text-primary block">Priority: {aiTaskSuggestions.suggestedPriority}</span>
                        <Button variant="ghost" className="h-5 px-1.5 text-[9px] hover:bg-muted" onClick={applyAiPriority}>
                          Apply Priority
                        </Button>
                      </div>
                      <div className="p-2 bg-card rounded border border-border space-y-1">
                        <span className="font-bold text-primary block">Duration: {aiTaskSuggestions.suggestedDuration} mins</span>
                        <Button variant="ghost" className="h-5 px-1.5 text-[9px] hover:bg-muted" onClick={applyAiDuration}>
                          Apply Duration
                        </Button>
                      </div>
                    </div>

                    {/* Suggestion 3: Risk Assessment */}
                    <div className="p-2.5 rounded bg-error/5 border border-error/15 flex items-start space-x-1.5 text-xs text-error">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="font-medium">{aiTaskSuggestions.riskAssessment}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Checklist Sub-module */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 select-none">
                  Checklist <CheckSquare className="h-4 w-4 text-primary" />
                </h4>
                
                {/* Checklist Items list */}
                <div className="space-y-2 select-none">
                  {(selectedTask.checklist || []).map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={item.isCompleted} 
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="h-4 w-4 rounded text-primary border-border focus:ring-primary"
                      />
                      <span className={cn('text-xs', {
                        'line-through text-muted-foreground': item.isCompleted
                      })}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Checklist Add form */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add checklist item..."
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={handleAddChecklistItem}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Comment Threads Sub-module */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 select-none">
                  Comments <MessageSquare className="h-4 w-4 text-primary" />
                </h4>

                {/* Comments list */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {(selectedTask.comments || []).map(comment => (
                    <div key={comment.id} className="p-3 border border-border rounded-xl bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground select-none">
                        <span>{comment.fullName}</span>
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-foreground leading-normal">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Write a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button variant="primary" size="sm" className="h-8 text-xs shrink-0" onClick={handleAddComment}>
                    Send
                  </Button>
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-border p-4 bg-muted/10 flex gap-3">
              <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => handleCompleteTask(selectedTask.id)}>
                Complete Task
              </Button>
              <Button variant="danger" className="flex-1 h-9 text-xs" onClick={() => handleDeleteTask(selectedTask.id)}>
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create New Task Modal Dialog Overlay */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsNewTaskModalOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">Add New Task | إضافة مهمة جديدة</h3>
            
            <div className="space-y-4">
              <Input 
                label="Task Title"
                placeholder="Enter task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description</label>
                <textarea
                  placeholder="Task description details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-20 p-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="INBOX">Inbox</option>
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsNewTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple local mock of Search icon to satisfy dependency
function SearchIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.608z"
      />
    </svg>
  );
}
