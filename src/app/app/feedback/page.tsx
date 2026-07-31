'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AuthService } from '@/core/auth/auth-service';
import { ActivityService } from '@/core/services/domain-services';
import { Send, Sparkles, MessageSquare, AlertTriangle, Lightbulb, Check, Loader2 } from 'lucide-react';

type FeedbackType = 'BUG' | 'FEATURE_REQUEST' | 'USABILITY' | 'OTHER';

export default function FeedbackPage() {
  const [userId, setUserId] = React.useState('11111111-1111-1111-1111-111111111111');
  
  // Form States
  const [type, setType] = React.useState<FeedbackType>('FEATURE_REQUEST');
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [urgency, setUrgency] = React.useState('MEDIUM');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside feedback page:', err);
      }
    }
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);

    try {
      // Log the feedback event to Database Activity Logs for SRE auditing and capture
      await ActivityService.logActivity(userId, 'BETA_FEEDBACK_SUBMITTED', {
        feedbackType: type,
        feedbackTitle: title,
        feedbackDescription: desc,
        feedbackUrgency: urgency,
        timestamp: new Date().toISOString()
      });
      setSuccess(true);
      setTitle('');
      setDesc('');
    } catch (err) {
      console.error('Failed to submit beta feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary animate-pulse" /> Beta Feedback System
        </h1>
        <p className="text-sm text-muted-foreground font-arabic mt-1">نظام رصد البلاغات وطلبات الميزات والملاحظات للنسخة التجريبية</p>
      </div>

      {success ? (
        <Card className="p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4 text-center animate-fade-in">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Thank you for your feedback!</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Your report has been successfully ingested into our security and audit pipelines. Our SRE team will review it shortly.
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setSuccess(false)}>
            Submit Another Report
          </Button>
        </Card>
      ) : (
        <Card className="p-6 border border-border bg-card rounded-xl shadow-lg space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Feedback Type Selection Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase">Feedback Type</span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setType('FEATURE_REQUEST')}
                  className={cn(
                    'h-12 border rounded-lg flex items-center justify-center text-xs font-bold gap-1.5 cursor-pointer transition-colors',
                    type === 'FEATURE_REQUEST' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Lightbulb className="h-4 w-4" /> Feature Request
                </button>
                <button
                  type="button"
                  onClick={() => setType('BUG')}
                  className={cn(
                    'h-12 border rounded-lg flex items-center justify-center text-xs font-bold gap-1.5 cursor-pointer transition-colors',
                    type === 'BUG' ? 'border-error bg-error/5 text-error' : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <AlertTriangle className="h-4 w-4" /> Bug Report
                </button>
              </div>
            </div>

            <Input 
              label="Subject Title"
              placeholder="Summary of your feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Detailed Description</label>
              <textarea
                placeholder="What is your request or issue? Provide steps to reproduce if reporting a bug."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={submitting}
                required
                className="w-full h-24 p-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                disabled={submitting}
                className="w-full h-9 px-3 border border-border rounded-lg bg-card text-xs font-medium text-foreground outline-none cursor-pointer"
              >
                <option value="HIGH">High (حرج)</option>
                <option value="MEDIUM">Medium (متوسط)</option>
                <option value="LOW">Low (منخفض)</option>
              </select>
            </div>

            <Button variant="primary" type="submit" className="w-full h-10 text-xs shrink-0" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Submit Feedback</>}
            </Button>
          </form>
        </Card>
      )}

      {/* Guided product tour helper */}
      <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start space-x-3 select-none">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary uppercase">Cortex AI Private Beta active</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             Thank you for testing our Next-Gen AI Productivity Operating System! All your submissions are securely logged and directly analyzed by our engineering team.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Inline Tailwind cn import helper to satisfy compilation
import { cn } from '@/lib/utils';
