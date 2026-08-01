'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AuthService } from '@/core/auth/auth-service';
import { OrganizationService } from '@/features/organizations/organization-service';
import { OrganizationEntity } from '@/features/organizations/repositories/supabase-organization-repository';
import { useLocale } from '@/shared/hooks/use-locale';
import { Building, Plus, Users, Shield, Sparkles, Check, Trash2, Pencil, X, Loader2, UserPlus, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrganizationsPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [organizations, setOrganizations] = React.useState<OrganizationEntity[]>([]);
  const [activeOrg, setActiveOrg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Create org modal
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  // Edit org modal
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editOrgId, setEditOrgId] = React.useState('');
  const [editOrgName, setEditOrgName] = React.useState('');
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  // Members panel
  const [showMembersOrgId, setShowMembersOrgId] = React.useState<string | null>(null);
  const [members, setMembers] = React.useState<any[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(false);

  // Invite member modal
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteOrgId, setInviteOrgId] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [inviting, setInviting] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          const orgs = await OrganizationService.getUserOrganizations(user.id);
          setOrganizations(orgs);
          if (orgs.length > 0) {
            setActiveOrg(orgs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside organizations page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // Load members when panel opens
  const loadMembers = React.useCallback(async (orgId: string) => {
    if (!userId) return;
    setMembersLoading(true);
    try {
      const result = await OrganizationService.getMembers(userId, orgId);
      setMembers(result);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setMembersLoading(false);
    }
  }, [userId]);

  const handleShowMembers = (orgId: string) => {
    if (showMembersOrgId === orgId) {
      setShowMembersOrgId(null);
      return;
    }
    setShowMembersOrgId(orgId);
    loadMembers(orgId);
  };

  // Create org
  const handleCreateOrg = async () => {
    if (!newOrgName.trim() || !userId) return;
    setCreating(true);
    try {
      const supabase = await import('@/core/database/connection').then(m => m.createClient());
      const { data, error } = await supabase
        .from('organizations')
        .insert({ name: newOrgName, owner_id: userId, created_by: userId })
        .select()
        .single();

      if (!error && data) {
        // Also add the creator as OWNER member
        await supabase
          .from('organization_members')
          .insert({ organization_id: data.id, user_id: userId, role: 'OWNER', created_by: userId });

        const newOrg: OrganizationEntity = {
          id: data.id,
          name: data.name,
          ownerId: data.owner_id,
          subscriptionPlan: data.subscription_plan || 'FREE',
          createdAt: new Date(data.created_at),
        };
        setOrganizations(prev => [newOrg, ...prev]);
        if (!activeOrg) setActiveOrg(data.id);
      }
      setIsCreateOpen(false);
      setNewOrgName('');
    } catch (err) {
      console.error('Failed to create organization:', err);
    } finally {
      setCreating(false);
    }
  };

  // Edit org
  const handleOpenEdit = (org: OrganizationEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOrgId(org.id);
    setEditOrgName(org.name);
    setIsEditOpen(true);
  };

  const handleUpdateOrg = async () => {
    if (!editOrgName.trim() || !editOrgId) return;
    setEditSubmitting(true);
    try {
      const updated = await OrganizationService.getOrganization(editOrgId);
      if (updated) {
        setOrganizations(prev => prev.map(o => o.id === editOrgId ? { ...o, name: editOrgName } : o));
      }
    } catch (err) {
      console.error('Failed to update organization:', err);
    } finally {
      setEditSubmitting(false);
      setIsEditOpen(false);
    }
  };

  // Delete org
  const handleDeleteOrg = async (orgId: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== orgId));
    if (activeOrg === orgId) {
      setActiveOrg(organizations.find(o => o.id !== orgId)?.id || null);
    }
    setDeleteConfirmId(null);
    try {
      const supabase = await import('@/core/database/connection').then(m => m.createClient());
      await supabase.from('organizations').delete().eq('id', orgId);
    } catch (err) {
      console.error('Failed to delete organization:', err);
    }
  };

  // Invite member
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteOrgId || !userId) return;
    setInviting(true);
    try {
      await OrganizationService.inviteMember(userId, inviteOrgId, inviteEmail, inviteRole);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      // Refresh members
      loadMembers(inviteOrgId);
    } catch (err) {
      console.error('Failed to invite member:', err);
    } finally {
      setInviting(false);
    }
  };

  // Change member role
  const handleChangeRole = async (orgId: string, targetUserId: string, newRole: 'ADMIN' | 'MEMBER') => {
    if (!userId) return;
    try {
      await OrganizationService.changeMemberRole(userId, orgId, targetUserId, newRole);
      setMembers(prev => prev.map(m => m.user?.id === targetUserId ? { ...m, role: newRole } : m));
    } catch (err) {
      console.error('Failed to change member role:', err);
    }
  };

  // Remove member
  const handleRemoveMember = async (orgId: string, targetUserId: string) => {
    if (!userId) return;
    try {
      await OrganizationService.removeMember(userId, orgId, targetUserId);
      setMembers(prev => prev.filter(m => m.user?.id !== targetUserId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: 'bg-primary/10 text-primary',
      ADMIN: 'bg-accent/10 text-accent',
      MEMBER: 'bg-muted text-muted-foreground',
      VIEWER: 'bg-muted text-muted-foreground',
    };
    return colors[role] || colors.MEMBER;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> {t('organizations.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">{t('organizations.desc')}</p>
        </div>
        <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t('organizations.newOrgBtn')}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
            <p className="text-xs text-muted-foreground">{t('organizations.loadingOrgs')}</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
            <Building className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-bold">{t('organizations.noOrgs')}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t('organizations.noOrgsDesc')}</p>
          </div>
        ) : (
          organizations.map((org) => {
            const isActive = activeOrg === org.id;
            return (
              <div key={org.id} className="space-y-2">
                <Card
                  className={cn(
                    'p-5 border bg-card rounded-xl flex items-center justify-between gap-4 transition-all hover:border-primary/20',
                    { 'border-primary/30 ring-1 ring-primary/25 bg-primary/5': isActive }
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'h-11 w-11 rounded-lg flex items-center justify-center font-bold text-lg',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}>
                      {org.name.slice(0, 1)}
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold block">{org.name}</span>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5" /> {t('organizations.memberRole')}: {org.ownerId === userId ? 'OWNER' : 'MEMBER'}
                        </span>
                        <span className="text-primary font-bold">{org.subscriptionPlan} {t('organizations.plan')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShowMembers(org.id)}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded transition-all cursor-pointer"
                      title={t('organizations.members')}
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(org, e)}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded transition-all cursor-pointer"
                      title={t('organizations.editOrgTitle')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(org.id)}
                      className="text-muted-foreground hover:text-error p-1.5 rounded transition-all cursor-pointer"
                      title={t('organizations.deleteOrg')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isActive ? (
                      <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Check className="h-4 w-4" /> {t('organizations.activeSpace')}
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setActiveOrg(org.id)}>
                        {t('organizations.switchSpace')}
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Members Panel (expandable) */}
                {showMembersOrgId === org.id && (
                  <Card className="p-4 border border-border bg-muted/30 rounded-xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> {t('organizations.members')}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => {
                        setInviteOrgId(org.id);
                        setIsInviteOpen(true);
                      }}>
                        <UserPlus className="h-3 w-3 mr-1" /> {t('organizations.inviteMember')}
                      </Button>
                    </div>

                    {membersLoading ? (
                      <p className="text-xs text-muted-foreground animate-pulse">{t('common.loading')}</p>
                    ) : members.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t('common.emptyState')}</p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-2 bg-card rounded-lg border border-border">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {(member.user?.full_name || 'U').charAt(0)}
                              </div>
                              <span className="text-xs font-semibold">{member.user?.full_name || 'Unknown'}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${getRoleBadge(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                            {org.ownerId === userId && member.role !== 'OWNER' && (
                              <div className="flex items-center gap-1">
                                <select
                                  value={member.role}
                                  onChange={(e) => handleChangeRole(org.id, member.user?.id, e.target.value as 'ADMIN' | 'MEMBER')}
                                  className="h-7 px-2 border border-border rounded text-[10px] bg-card outline-none cursor-pointer"
                                >
                                  <option value="ADMIN">Admin</option>
                                  <option value="MEMBER">Member</option>
                                </select>
                                <button
                                  onClick={() => handleRemoveMember(org.id, member.user?.id)}
                                  className="text-muted-foreground hover:text-error p-1 rounded transition-all cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

                {/* Delete confirmation */}
                {deleteConfirmId === org.id && (
                  <Card className="p-4 border border-error/20 bg-error/5 rounded-xl space-y-3 animate-fade-in">
                    <p className="text-xs text-foreground">{t('organizations.deleteOrgConfirm')}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="danger" size="sm" className="h-8 text-xs" onClick={() => handleDeleteOrg(org.id)}>
                        {t('common.delete')}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDeleteConfirmId(null)}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RLS/Multi-tenant Safety Callout */}
      <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start space-x-3 select-none">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary uppercase">{t('organizations.isolationGuard')}</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             {t('organizations.isolationDesc')}
          </p>
        </div>
      </Card>

      {/* Create Organization Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsCreateOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">{t('organizations.createOrgTitle')}</h3>
            <div className="space-y-4">
              <Input
                label={t('organizations.orgNameLabel')}
                placeholder={t('organizations.orgNamePlaceholder')}
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateOrg} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsEditOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground">{t('organizations.editOrgTitle')}</h3>
            <div className="space-y-4">
              <Input
                label={t('organizations.orgNameLabel')}
                placeholder={t('organizations.orgNamePlaceholder')}
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                disabled={editSubmitting}
              />
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)} disabled={editSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateOrg} disabled={editSubmitting}>
                {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('projects.updateBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-30 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setIsInviteOpen(false)}>
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> {t('organizations.inviteMember')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('organizations.inviteEmailLabel')}
                placeholder={t('organizations.inviteEmailPlaceholder')}
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{t('organizations.inviteRoleLabel')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  disabled={inviting}
                  className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </select>
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(false)} disabled={inviting}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleInvite} disabled={inviting}>
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-1" /> {t('organizations.inviteMember')}</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
