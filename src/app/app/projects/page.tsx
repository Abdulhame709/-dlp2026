'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProjectService } from '@/core/services/domain-services';
import { AuthService } from '@/core/auth/auth-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { Folder, Plus, Sparkles, Calendar, ListFilter, X, Trash2, Loader2, Pencil } from 'lucide-react';

export default function ProjectsPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string>('11111111-1111-1111-1111-111111111111');
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Create Modal State bindings
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal State bindings
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editProjectId, setEditProjectId] = React.useState<string>('');
  const [editTitle, setEditTitle] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<string>('ACTIVE');
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // Load current user details on mount to resolve session dynamically
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session during projects mount:', err);
      }
    }
    loadUser();
  }, []);

  // Fetch projects dynamically based on the active user ID
  const loadProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await ProjectService.getProjects(userId);
      setProjects(fetched);
    } catch (err) {
      console.error('Failed to load projects from service:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handle Project Creation (with Optimistic UI rendering)
  const handleCreateProject = async () => {
    if (!newTitle.trim()) return;
    setSubmitting(true);

    const tempId = `proj-temp-${Date.now()}`;
    const tempProject = {
      id: tempId,
      name: newTitle,
      description: newDesc,
      status: 'ACTIVE',
      createdAt: new Date(),
    };

    // Optimistically prepend new project to list
    setProjects(prev => [tempProject, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');

    try {
      await ProjectService.createProject(userId, null, tempProject.name, tempProject.description);
    } catch (err) {
      console.error('Failed to save project:', err);
      // Revert optimistic insert on error
      setProjects(prev => prev.filter(p => p.id !== tempId));
    } finally {
      setSubmitting(false);
      loadProjects();
    }
  };

  // Handle Project Edit: Open modal with existing project data
  const handleOpenEditModal = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditProjectId(proj.id);
    setEditTitle(proj.name);
    setEditDesc(proj.description || '');
    setEditStatus(proj.status || 'ACTIVE');
    setIsEditModalOpen(true);
  };

  // Handle Project Edit: Save changes
  const handleUpdateProject = async () => {
    if (!editTitle.trim() || !editProjectId) return;
    setEditSubmitting(true);

    // Optimistic update
    setProjects(prev => prev.map(p =>
      p.id === editProjectId
        ? { ...p, name: editTitle, description: editDesc, status: editStatus }
        : p
    ));
    setIsEditModalOpen(false);

    try {
      await ProjectService.updateProject(editProjectId, editTitle, editDesc, editStatus);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setEditSubmitting(false);
      loadProjects();
    }
  };

  // Handle Project Deletion (Soft delete / Archive)
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic delete
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      await ProjectService.deleteProject(id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      loadProjects();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" /> {t('projects.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">{t('projects.desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs">
            <ListFilter className="h-4 w-4 mr-2" /> {t('common.filter')}
          </Button>
          <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t('projects.newProjectBtn')}
          </Button>
        </div>
      </div>

      {/* Highlights Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-12 w-full" /></Card>
          <Card className="p-6 space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-12 w-full" /></Card>
          <Card className="p-6 space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-12 w-full" /></Card>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border rounded-xl">
          <Folder className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-bold">{t('projects.noProjects')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('projects.noProjectsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="p-6 border border-border bg-card rounded-xl space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between h-48 relative group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                      {proj.status || 'Active'}
                    </span>
                    <button
                      onClick={(e) => handleOpenEditModal(proj, e)}
                      className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer"
                      title={t('projects.editBtn')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold truncate">{proj.name}</h3>
                  {proj.description && (
                    <p className="text-xs text-muted-foreground leading-normal line-clamp-2">{proj.description}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created {new Date(proj.createdAt).toLocaleDateString()}
                </span>
                <span className="font-semibold text-primary">Active Workspace</span>
              </div>
            </Card>
          ))}

          {/* Dynamic Project Assistant helper Card */}
          <Card className="p-6 border border-primary/20 bg-primary/5 rounded-xl flex flex-col justify-between space-y-4 h-48 select-none">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 animate-pulse shrink-0" /> {t('projects.aiProjectCoach')}
              </div>
              <h3 className="text-sm font-bold truncate">{t('projects.schedulingActive')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                 {t('projects.schedulingDesc')}
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-[11px] hover:bg-primary hover:text-primary-foreground border-primary/20">
              {t('projects.askBreakdown')}
            </Button>
          </Card>
        </div>
      )}

      {/* Create New Project Modal Dialog Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">{t('projects.addProjectTitle')}</h3>

            <div className="space-y-4">
              <Input
                label={t('projects.projectTitleLabel')}
                placeholder={t('projects.projectTitlePlaceholder')}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={submitting}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{t('projects.projectDescLabel')}</label>
                <textarea
                  placeholder={t('projects.projectDescPlaceholder')}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  disabled={submitting}
                  className="w-full h-20 p-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateProject} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal Dialog Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">{t('projects.editProjectTitle')}</h3>

            <div className="space-y-4">
              <Input
                label={t('projects.projectTitleLabel')}
                placeholder={t('projects.projectTitlePlaceholder')}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={editSubmitting}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{t('projects.projectDescLabel')}</label>
                <textarea
                  placeholder={t('projects.projectDescPlaceholder')}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  disabled={editSubmitting}
                  className="w-full h-20 p-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{t('common.status')}</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={editSubmitting}
                  className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={editSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateProject} disabled={editSubmitting}>
                {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('projects.updateBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
