'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useTheme } from '@/shared/hooks/use-theme';
import { AuthService } from '@/core/auth/auth-service';
import { OnboardingService } from '@/core/auth/onboarding-service';
import { Sparkles, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { setTheme: setSystemTheme } = useTheme();

  const [step, setStep] = React.useState(1);
  const [userId, setUserId] = React.useState('11111111-1111-1111-1111-111111111111');
  const [fullName, setFullName] = React.useState('Abdul');
  const [theme, setTheme] = React.useState('dark');
  const [language, setLanguage] = React.useState('ar');
  const [submitting, setSubmitting] = React.useState(false);

  // Load current user details on mount to resolve session
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          if (user.fullName) {
            setFullName(user.fullName);
          }
        }
      } catch (err) {
        console.error('Failed to resolve current user session during onboarding:', err);
      }
    }
    loadUser();
  }, []);

  const handleSelectTheme = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    setSystemTheme(selectedTheme);
  };

  const handleSelectLanguage = (selectedLanguage: 'ar' | 'en') => {
    setLanguage(selectedLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', selectedLanguage);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        // Complete onboarding via production-grade Onboarding Service
        const res = await OnboardingService.completeOnboarding(
          userId,
          {
            fullName,
            avatarUrl: '',
            language,
            timezone: 'Asia/Aden',
            theme,
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '12H',
          },
          {
            name: `${fullName}'s Space`,
            type: 'PERSONAL',
          }
        );

        if (res.success) {
          // Redirect the user to Dashboard - Middleware will now safely authorize entry
          window.location.href = '/app/dashboard';
        } else {
          console.error('Onboarding flow error:', res.error);
          alert(`Onboarding Error: ${res.error}`);
        }
      } catch (err: any) {
        console.error('Unexpected onboarding error:', err.message);
        alert(`Onboarding Error: ${err.message}`);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border border-border bg-card p-8 shadow-md">
        <CardHeader className="text-center p-0 pb-4 border-b border-border mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 select-none animate-bounce">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Welcome to Cortex AI
          </CardTitle>
          <CardDescription className="text-xs">
            Step {step} of 3: Setup your intelligent productivity workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 p-0">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-normal">
                Let's start with your identity. What should we call you every day?
              </p>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-normal">
                Choose your preferred interface theme. You can change this later at any time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectTheme('light')}
                  disabled={submitting}
                  className={`h-20 border rounded-lg flex flex-col items-center justify-center text-xs font-semibold gap-2 cursor-pointer transition-colors ${
                    theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Light Mode
                </button>
                <button
                  onClick={() => handleSelectTheme('dark')}
                  disabled={submitting}
                  className={`h-20 border rounded-lg flex flex-col items-center justify-center text-xs font-semibold gap-2 cursor-pointer transition-colors ${
                    theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Dark Mode
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 select-none">
              <p className="text-xs text-muted-foreground leading-normal">
                Select your default platform language to optimize Arabic and English support.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleSelectLanguage('ar')}
                  disabled={submitting}
                  className={`w-full h-12 px-4 border rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    language === 'ar' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>العربية (Cairo Arabic)</span>
                  {language === 'ar' && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleSelectLanguage('en')}
                  disabled={submitting}
                  className={`w-full h-12 px-4 border rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                    language === 'en' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>English (Inter Sans)</span>
                  {language === 'en' && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-4 border-t border-border mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold">
            {step === 3 ? 'Almost ready!' : 'Configuring...'}
          </span>
          <Button variant="primary" size="sm" onClick={handleNext} disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Launch Platform' : 'Continue'}{' '}
                <ArrowRight className="h-4 w-4 ml-1.5 shrink-0" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
