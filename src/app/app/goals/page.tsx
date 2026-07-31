'use client';

import * as React from 'react';
import { AIGoalAnalyzer, GoalAnalysis, GeneratedProject, GeneratedTasks, Timeline } from '@/features/ai/core/ai-goal-analyzer';
import { TaskService } from '@/features/tasks/services/task-service';
import { GoalService } from '@/core/services/domain-services';
import { AuthService } from '@/core/auth/auth-service';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Target, 
  Folder, 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  X,
  Trash2
} from 'lucide-react';

export default function GoalsPage() {
  const [userId, setUserId] = React.useState<string>('11111111-1111-1111-1111-111111111111');
  const [goals, setGoals] = React.useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = React.useState(true);

  // State bindings for AI Generator
  const [goalTitle, setGoalTitle] = React.useState('Launch Cortex AI SaaS in 3 months');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');

  // Result States for AI Assistant Roadmap
  const [analysis, setAnalysis] = React.useState<GoalAnalysis | null>(null);
  const [projectsData, setProjectsData] = React.useState<GeneratedProject | null>(null);
  const [tasksData, setTasksData] = React.useState<GeneratedTasks | null>(null);
  const [priorityData, setPriorityData] = React.useState<any>(null);
  const [timelineData, setTimelineData] = React.useState<Timeline | null>(null);

  // Load current user details on mount to resolve session dynamically
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session during goals mount:', err);
      }
    }
    loadUser();
  }, []);

  // Fetch live goals from GoalService
  const loadGoals = React.useCallback(async () => {
    setGoalsLoading(true);
    try {
      const fetched = await GoalService.getGoals(userId);
      setGoals(fetched);
    } catch (err) {
      console.error('Failed to load goals from database:', err);
    } finally {
      setGoalsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Handle run AI product intelligence and automatically create Goals, Projects, and Tasks
  const handleRunProductIntelligence = async () => {
    if (!goalTitle.trim()) return;
    setIsAnalyzing(true);
    setStatusMessage('Analyzing goal objectives...');

    // Reset previous states
    setAnalysis(null);
    setProjectsData(null);
    setTasksData(null);
    setPriorityData(null);
    setTimelineData(null);

    try {
      // 1. Create the Goal persistently in the PostgreSQL Database
      const savedGoal = await GoalService.createGoal(userId, goalTitle, 0, 'Automatically generated via AI Product Intelligence');

      // 2. Execute Goal Analysis
      const goalAnalysis = await AIGoalAnalyzer.analyzeGoal(userId, goalTitle, 'Core SaaS Launch');
      setAnalysis(goalAnalysis);

      // 3. Deconstruct Goal into Projects and Milestones
      setStatusMessage('Deconstructing goal into projects and milestones...');
      const projGen = await AIGoalAnalyzer.generateProjects(userId, goalTitle);
      setProjectsData(projGen);

      // 4. Break down Milestones into Executable Tasks
      setStatusMessage('Breaking down milestones into executable tasks...');
      const taskGen = await AIGoalAnalyzer.breakdownMilestoneTasks(userId, 'Schema Migration');
      setTasksData(taskGen);

      // 5. Save AI-generated tasks persistently to live database
      setStatusMessage('Saving AI-generated tasks to your workspace...');
      for (const t of taskGen.tasks) {
        await TaskService.createTask(userId, {
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: 'INBOX',
          goalId: savedGoal.id,
        });
      }

      // 6. Calculate intelligent priorities
      setStatusMessage('Calculating priority scores and confidence...');
      const priority = await AIGoalAnalyzer.calculatePriority(userId, 'Deploy PostgreSQL tables on Supabase', 9, 10);
      setPriorityData(priority);

      // 7. Generate Timeline
      setStatusMessage('Generating optimal execution timeline...');
      const timeline = await AIGoalAnalyzer.generateTimeline(userId, ['Deploy PostgreSQL tables', 'Setup Auth Provider', 'Audit RLS policies']);
      setTimelineData(timeline);

      setStatusMessage('Roadmap successfully compiled and saved!');
    } catch (err) {
      console.error('SaaS Product Intelligence execution failed:', err);
      setStatusMessage('Execution failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      loadGoals();
    }
  };

  // Handle Goal Deletion (Soft delete / Archive)
  const handleDeleteGoal = async (id: string) => {
    // Optimistic delete
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await GoalService.deleteGoal(id);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      loadGoals();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Goal Input & Core Trigger Panel */}
      <div className="p-6 border border-border bg-card rounded-xl shadow-sm space-y-4 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Product Intelligence Core <Target className="h-5 w-5 text-primary shrink-0 animate-pulse" />
          </h1>
          <p className="text-xs text-muted-foreground font-arabic">محرك الذكاء الاصطناعي لتوليد خطط العمل وإعداد المشاريع التلقائية</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
          <Input 
            placeholder="Type your high-level idea or goal... (e.g. Launch SaaS, learn statistics)"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            className="flex-1 h-11 text-sm font-semibold bg-muted/35"
            disabled={isAnalyzing}
          />
          <Button 
            variant="primary" 
            className="h-11 px-6 text-sm shrink-0 cursor-pointer"
            onClick={handleRunProductIntelligence}
            isLoading={isAnalyzing}
          >
            <Sparkles className="h-4.5 w-4.5 mr-2 animate-bounce shrink-0" /> Transform to Roadmap
          </Button>
        </div>

        {statusMessage && (
          <p className="text-xs font-semibold text-primary select-none animate-pulse">
            ✨ {statusMessage}
          </p>
        )}
      </div>

      {/* 1.5 Live Active Goals Dashboard List */}
      <div className="space-y-4">
        <div className="flex flex-col select-none">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Active Objectives & Goals
          </h2>
          <p className="text-[10px] text-muted-foreground font-arabic">الأهداف الاستراتيجية المسجلة ومؤشرات التقدم</p>
        </div>

        {goalsLoading ? (
          <div className="space-y-2 select-none">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center select-none border border-dashed border-border rounded-xl">
            <Target className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-xs text-muted-foreground">No active goals found. Use the analyzer above to seed your first goal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4 border border-border bg-card rounded-xl flex items-center justify-between gap-4 group">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate block">{goal.title}</span>
                  {goal.description && (
                    <p className="text-[10px] text-muted-foreground truncate">{goal.description}</p>
                  )}
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 pt-1 select-none">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${goal.progress || 0}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-primary shrink-0">{goal.progress || 0}% Done</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. Loading Placeholder Skeletons for AI deconstruction */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 select-none">
          <Card className="p-5 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
          <Card className="p-5 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      )}

      {/* 3. Output Results Board */}
      {(analysis || projectsData || tasksData || timelineData) && (
        <div className="space-y-8">
          
          {/* 3.1 AI Goal Analysis Result */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Objectives & Strategy */}
              <Card className="md:col-span-2 p-5 space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between select-none">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Target className="h-5 w-5 text-primary" /> Goal Objective & Execution Strategy
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase select-none">
                    Difficulty: {analysis.difficulty}/5
                  </span>
                </div>
                
                <div className="space-y-3 leading-relaxed">
                  <div className="text-xs font-semibold">
                    <span className="text-primary block font-bold text-xs uppercase mb-1">Calculated Objective:</span>
                    <p className="text-foreground p-3.5 bg-muted/40 rounded-xl border border-border">{analysis.objective}</p>
                  </div>
                  <div className="text-xs font-semibold">
                    <span className="text-primary block font-bold text-xs uppercase mb-1">Recommended Execution Strategy:</span>
                    <p className="text-muted-foreground leading-relaxed p-3.5 bg-muted/25 rounded-xl">{analysis.executionStrategy}</p>
                  </div>
                </div>
              </Card>

              {/* Right Column: Risks & Mitigations */}
              <Card className="p-5 space-y-4">
                <div className="border-b border-border pb-3 select-none">
                  <span className="text-sm font-bold flex items-center gap-1.5 text-error">
                    <AlertTriangle className="h-5 w-5" /> SRE Risk Audit & Mitigation
                  </span>
                </div>

                <div className="space-y-3.5 overflow-y-auto max-h-72 pr-1 select-none">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className="p-3 border border-border bg-muted/20 rounded-xl space-y-1.5">
                      <div className="text-[10px] font-bold text-error uppercase flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Risk: {risk.risk}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium leading-normal">
                        Mitigation: {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

          {/* 3.2 Automatically Generated Projects & Milestones */}
          {projectsData && (
            <div className="space-y-4">
              <div className="flex flex-col select-none">
                <h2 className="text-lg font-bold tracking-tight">SaaS Projects Deconstructed</h2>
                <p className="text-[10px] text-muted-foreground font-arabic">مجموعات العمل والمعالم البارزة المولدة تلقائياً</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                {projectsData.projects.map((proj, idx) => (
                  <Card key={idx} className="p-5 space-y-4">
                    <div className="flex items-center space-x-3 pb-3 border-b border-border">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground leading-none">{proj.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-xs">{proj.description}</span>
                      </div>
                    </div>

                    {/* Milestones list */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight block">Milestones</span>
                      {proj.milestones.map((ms, mIdx) => (
                        <div key={mIdx} className="p-3 bg-muted/30 border border-border rounded-xl flex items-start space-x-2.5">
                          <CheckSquare className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-foreground">{ms.title}</span>
                            <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">{ms.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3.3 Milestone Task Breakdown & Calculated Priorities */}
          {tasksData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Task Breakdown list (2 cols) */}
              <div className="lg:col-span-2 space-y-4 select-none">
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Milestone Tasks Breakdown</h2>
                  <p className="text-[10px] text-muted-foreground">المهام التنفيذية المقترحة للميلستون</p>
                </div>

                <div className="space-y-3">
                  {tasksData.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-primary/25 cursor-pointer transition-colors">
                      <div className="flex flex-col text-left space-y-0.5">
                        <span className="text-xs font-bold text-foreground">{task.title}</span>
                        <span className="text-[10px] text-muted-foreground">{task.description}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 shrink-0">
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none uppercase', {
                          'bg-error/10 text-error': task.priority === 'CRITICAL' || task.priority === 'HIGH',
                          'bg-primary/10 text-primary': task.priority === 'MEDIUM',
                        })}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                          {task.estimatedDuration} mins
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Engine Verification Panel (1 col) */}
              {priorityData && (
                <div className="space-y-4 select-none">
                  <div className="flex flex-col">
                    <h2 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">AI Priority Engine</h2>
                    <p className="text-[10px] text-muted-foreground">محرك حساب الأهمية والوزن السلوكي</p>
                  </div>

                  <Card className="p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4.5 w-4.5 text-primary" /> Priority Score
                      </span>
                      <span className="text-xs font-extrabold text-primary">{priorityData.priorityScore}%</span>
                    </div>

                    <div className="space-y-3 leading-relaxed">
                      <div className="text-xs font-semibold">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Calculated Reason</span>
                        <p className="text-foreground p-3.5 bg-muted/40 rounded-xl border border-border leading-normal">{priorityData.reason}</p>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Confidence Index:</span>
                        <span className="text-secondary">{priorityData.confidence}%</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

            </div>
          )}

          {/* 3.4 Interactive Execution Timeline Grid */}
          {timelineData && (
            <div className="space-y-4 select-none">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold tracking-tight">Interactive Timeline Grid</h2>
                <p className="text-[10px] text-muted-foreground font-arabic">خطة التوزيع وجدولة التواريخ والأسابيع</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {timelineData.weeks.map(week => (
                  <Card key={week.weekNumber} className="p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                      <span className="text-xs font-bold text-primary">Week {week.weekNumber}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">{week.targetDate}</span>
                    </div>
                    <div className="space-y-2 flex-1">
                      {week.tasks.map((tName, tIdx) => (
                        <div key={tIdx} className="p-2.5 border border-border bg-muted/30 rounded-lg text-xs font-medium truncate">
                          {tName}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
