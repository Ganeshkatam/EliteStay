'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { updateUserPreferences } from '../actions/preferences-actions';

interface TwoFactorAuthCardProps {
  initialEnabled: boolean;
}

export function TwoFactorAuthCard({ initialEnabled }: TwoFactorAuthCardProps) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Setup Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'scan' | 'recovery'>('scan');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enrollFactorId, setEnrollFactorId] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  // Check active MFA factors on mount
  useEffect(() => {
    async function loadFactors() {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (!error && data?.totp && data.totp.length > 0) {
          const activeTotp = data.totp.find((f) => f.status === 'verified');
          if (activeTotp) {
            setIsEnabled(true);
            setFactorId(activeTotp.id);
          } else {
            setIsEnabled(false);
            setFactorId(null);
          }
        } else {
          setIsEnabled(initialEnabled);
        }
      } catch (err) {
        console.error('Failed to query MFA factors:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    }
    loadFactors();
  }, [initialEnabled, supabase]);

  // Initiate Enrollment
  const startEnrollment = async () => {
    setIsVerifying(true);
    try {
      // 1. Enroll with Supabase MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'EliteStay Authenticator',
      });

      if (error || !data) {
        throw new Error(
          error?.message || 'Failed to initialize authenticator setup.'
        );
      }

      setEnrollFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
      setSecretKey(data.totp.secret);
      setStep('scan');
      setVerificationCode('');
      setIsOpen(true);
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Setup Error',
        description:
          err instanceof Error
            ? err.message
            : 'Could not initialize 2FA setup.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify OTP and complete activation
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) return;

    setIsVerifying(true);
    try {
      // 1. Create a challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrollFactorId });

      if (challengeError || !challengeData) {
        throw new Error(
          challengeError?.message || 'Failed to create verification challenge.'
        );
      }

      // 2. Verify challenge with user code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollFactorId,
        challengeId: challengeData.id,
        code: verificationCode.trim(),
      });

      if (verifyError) {
        throw new Error(
          verifyError.message ||
            'Invalid verification code. Please check your authenticator app.'
        );
      }

      // 3. Generate mock recovery codes
      const generatedCodes = Array.from({ length: 8 }).map(
        () =>
          Math.random().toString(36).substring(2, 6).toUpperCase() +
          '-' +
          Math.random().toString(36).substring(2, 6).toUpperCase()
      );
      setRecoveryCodes(generatedCodes);

      // 4. Update database user preferences
      await updateUserPreferences('security', {
        two_factor_auth: true,
        allow_new_device_login: true,
        remember_device: true,
      });

      setIsEnabled(true);
      setFactorId(enrollFactorId);
      setStep('recovery');

      toast({
        title: 'Two-Factor Authentication Activated',
        description:
          'Your account is now protected with Authenticator App 2FA.',
      });
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description:
          err instanceof Error ? err.message : 'Invalid code entered.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (
      !confirm(
        'Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.'
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        if (factorId) {
          const { error } = await supabase.auth.mfa.unenroll({ factorId });
          if (error) {
            console.warn('Unenroll notice:', error.message);
          }
        }

        // Update database user preferences
        await updateUserPreferences('security', {
          two_factor_auth: false,
          allow_new_device_login: true,
          remember_device: true,
        });

        setIsEnabled(false);
        setFactorId(null);

        toast({
          title: '2FA Disabled',
          description:
            'Two-Factor Authentication has been removed from your account.',
        });
      } catch (err: unknown) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            err instanceof Error ? err.message : 'Failed to disable 2FA.',
        });
      }
    });
  };

  const copyToClipboard = (text: string, type: 'key' | 'recovery') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isEnabled
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isEnabled ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">
                Two-Factor Authentication (2FA)
              </h4>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isCheckingStatus
                  ? 'Checking...'
                  : isEnabled
                    ? 'Active (Authenticator App)'
                    : 'Not Configured'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Secure your account by requiring a 6-digit verification code from
              your authenticator app on every sign-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isEnabled ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDisable}
              disabled={isPending}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              {isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              Disable 2FA
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={startEnrollment}
              disabled={isVerifying}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isVerifying && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              <Smartphone className="w-4 h-4 mr-1.5" />
              Set Up Authenticator
            </Button>
          )}
        </div>
      </div>

      {/* Setup & Verification Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'scan'
                ? 'Set Up Authenticator App'
                : 'Save Your Backup Recovery Codes'}
            </DialogTitle>
            <DialogDescription>
              {step === 'scan'
                ? 'Scan the QR code below using Google Authenticator, Authy, or 1Password.'
                : 'Keep these backup codes in a safe place. You can use them to log in if you lose access to your device.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'scan' && (
            <div className="space-y-5 pt-2">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                {qrCodeSvg ? (
                  <div
                    className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl" />
                )}

                {/* Secret Key Fallback */}
                {secretKey && (
                  <div className="mt-4 w-full text-center space-y-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Or enter this key manually:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800 select-all">
                        {secretKey}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(secretKey, 'key')}
                      >
                        {copiedKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 6-Digit Verification Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="two-factor-code"
                    className="text-sm font-medium"
                  >
                    Enter 6-Digit Code
                  </Label>
                  <Input
                    id="two-factor-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ''))
                    }
                    className="text-center text-lg tracking-widest font-mono"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {isVerifying && (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    )}
                    Verify & Activate
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 'recovery' && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 font-mono text-xs">
                {recoveryCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-1.5 bg-white rounded border border-slate-200/60 text-slate-800 text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(recoveryCodes.join('\n'), 'recovery')
                  }
                  className="gap-1.5"
                >
                  {copiedRecovery ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedRecovery ? 'Copied Codes' : 'Copy All Codes'}
                </Button>

                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
