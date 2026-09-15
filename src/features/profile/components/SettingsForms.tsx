'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useForm,
  type DefaultValues,
  type UseFormReturn,
  type Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import {
  UserPreferences,
  PreferenceCategory,
  PreferenceSchemas,
  type PreferenceFormMap,
} from '../types/preferences';
import { updateUserPreferences } from '../actions/preferences-actions';
import { TwoFactorAuthCard } from './TwoFactorAuthCard';

// Helper component for rendering a single toggle row
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <Label className="flex flex-col space-y-1">
        <span>{label}</span>
        <span className="font-normal text-sm text-gray-500">{description}</span>
      </Label>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Reusable Form Section wrapper with quiet 3-second debounced auto-save
function FormSection<T extends PreferenceCategory>({
  title,
  description,
  category,
  defaultValues,
  children,
}: {
  title: string;
  description: string;
  category: T;
  defaultValues: DefaultValues<PreferenceFormMap[T]>;
  children: (
    form: UseFormReturn<PreferenceFormMap[T], unknown, PreferenceFormMap[T]>
  ) => React.ReactNode;
}) {
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(defaultValues));

  const form = useForm<PreferenceFormMap[T], unknown, PreferenceFormMap[T]>({
    resolver: zodResolver(PreferenceSchemas[category]) as unknown as Resolver<
      PreferenceFormMap[T]
    >,
    defaultValues,
  });

  const onSubmit = useCallback(
    async (data: PreferenceFormMap[T]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setSaveStatus('saving');
      const { success, error } = await updateUserPreferences(category, data);

      if (success) {
        lastSavedRef.current = JSON.stringify(data);
        form.reset(data as DefaultValues<PreferenceFormMap[T]>);
        setSaveStatus('saved');

        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 2500);
      } else {
        setSaveStatus('error');
        toast({
          variant: 'destructive',
          title: 'Failed to save',
          description: error || 'An unknown error occurred.',
        });
      }
    },
    [category, form, toast]
  );

  // Subscribe to form value changes for 3-second debounced auto-save
  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentSerialized = JSON.stringify(values);
      const isChanged = currentSerialized !== lastSavedRef.current;

      if (!isChanged) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Auto-save after 3 seconds of inactivity
      timerRef.current = setTimeout(() => {
        form.handleSubmit((validData) => onSubmit(validData))();
      }, 3000);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [form, onSubmit]);

  return (
    <div className="py-8 border-b border-slate-100 last:border-0 first:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto min-h-[28px]">
          {saveStatus === 'saving' && (
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Failed to save
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">{children(form)}</div>
    </div>
  );
}

export function PrivacySettings({
  data,
}: {
  data: UserPreferences['privacy'];
}) {
  return (
    <FormSection
      title="Privacy"
      description="Manage what information is visible to hosts and other members."
      category="privacy"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Allow Messages from Hosts"
            description="Let hosts send you messages directly before or after booking."
            checked={form.watch('allow_host_messages')}
            onChange={(val) =>
              form.setValue('allow_host_messages', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Show Profile Photo"
            description="Show your profile avatar to hosts during reservations."
            checked={form.watch('show_profile_photo')}
            onChange={(val) =>
              form.setValue('show_profile_photo', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Show Reviews"
            description="Allow your reviews to be visible to verified hosts and guests."
            checked={form.watch('show_reviews')}
            onChange={(val) =>
              form.setValue('show_reviews', val, { shouldDirty: true })
            }
          />
        </div>
      )}
    </FormSection>
  );
}

export function NotificationSettings({
  data,
}: {
  data: UserPreferences['notifications'];
}) {
  return (
    <FormSection
      title="Notifications"
      description="Choose how and when we contact you."
      category="notifications"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Email Notifications"
            description="Receive booking updates and messages via email."
            checked={form.watch('email')}
            onChange={(val) =>
              form.setValue('email', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Push Notifications"
            description="Receive push notifications on your mobile device or browser."
            checked={form.watch('push')}
            onChange={(val) =>
              form.setValue('push', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="SMS Notifications"
            description="Receive important updates via text message."
            checked={form.watch('sms')}
            onChange={(val) => form.setValue('sms', val, { shouldDirty: true })}
          />
          <ToggleRow
            label="Marketing Emails"
            description="Receive promotional offers and recommendations."
            checked={form.watch('marketing')}
            onChange={(val) =>
              form.setValue('marketing', val, { shouldDirty: true })
            }
          />
        </div>
      )}
    </FormSection>
  );
}

export function SecuritySettings({
  data,
}: {
  data: UserPreferences['security'];
}) {
  return (
    <div className="space-y-6">
      {/* Interactive Two-Factor Authentication Setup Card */}
      <TwoFactorAuthCard initialEnabled={Boolean(data?.two_factor_auth)} />

      <FormSection
        title="Session & Device Security"
        description="Manage how and where your account stays signed in."
        category="security"
        defaultValues={data}
      >
        {(form) => (
          <div className="space-y-4">
            <ToggleRow
              label="Allow New Device Login"
              description="Allow logins from new devices and browsers without explicit pre-authorization."
              checked={form.watch('allow_new_device_login')}
              onChange={(val) =>
                form.setValue('allow_new_device_login', val, {
                  shouldDirty: true,
                })
              }
            />
            <ToggleRow
              label="Remember this Device"
              description="Keep me securely logged in on this browser across sessions."
              checked={form.watch('remember_device')}
              onChange={(val) =>
                form.setValue('remember_device', val, { shouldDirty: true })
              }
            />
          </div>
        )}
      </FormSection>
    </div>
  );
}

export function HostingSettings({
  data,
}: {
  data: UserPreferences['hosting'];
}) {
  return (
    <FormSection
      title="Hosting"
      description="Manage your preferences as a host."
      category="hosting"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Accept Booking Requests"
            description="Allow guests to send you booking requests for manual approval."
            checked={form.watch('accept_booking_requests')}
            onChange={(val) =>
              form.setValue('accept_booking_requests', val, {
                shouldDirty: true,
              })
            }
          />
          <ToggleRow
            label="Instant Booking"
            description="Guests who meet all requirements can book without approval."
            checked={form.watch('instant_booking')}
            onChange={(val) =>
              form.setValue('instant_booking', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Auto-Approve Reservations"
            description="Automatically approve reservations from verified guests."
            checked={form.watch('auto_approve_reservations')}
            onChange={(val) =>
              form.setValue('auto_approve_reservations', val, {
                shouldDirty: true,
              })
            }
          />
        </div>
      )}
    </FormSection>
  );
}

export function CommunicationSettings({
  data,
}: {
  data: UserPreferences['communication'];
}) {
  return (
    <FormSection
      title="Communication"
      description="Manage interactions with EliteStay support and third parties."
      category="communication"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Promotional Messages"
            description="Allow third-party partners to send you promotional messages."
            checked={form.watch('promotional_messages')}
            onChange={(val) =>
              form.setValue('promotional_messages', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Support Contact"
            description="Allow EliteStay customer support to proactively contact you."
            checked={form.watch('support_contact')}
            onChange={(val) =>
              form.setValue('support_contact', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Share Contact Details After Booking"
            description="Automatically share your phone number with guests/hosts after a confirmed booking."
            checked={form.watch('share_contact_after_booking')}
            onChange={(val) =>
              form.setValue('share_contact_after_booking', val, {
                shouldDirty: true,
              })
            }
          />
        </div>
      )}
    </FormSection>
  );
}

export function DataSettings({ data }: { data: UserPreferences['data'] }) {
  return (
    <FormSection
      title="Data & Privacy"
      description="Manage how your data is used."
      category="data"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Share Analytics"
            description="Share anonymous usage data to help us improve the app."
            checked={form.watch('share_analytics')}
            onChange={(val) =>
              form.setValue('share_analytics', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Personalized Recommendations"
            description="Allow us to use your data to show you more relevant listings."
            checked={form.watch('personalized_recommendations')}
            onChange={(val) =>
              form.setValue('personalized_recommendations', val, {
                shouldDirty: true,
              })
            }
          />

          <div className="flex items-center justify-between space-x-2 pt-2">
            <Label className="flex flex-col space-y-1">
              <span>Cookie Preferences</span>
              <span className="font-normal text-sm text-gray-500">
                Choose which cookies we can store on your device.
              </span>
            </Label>
            <div className="w-[180px]">
              <Select
                value={form.watch('cookie_preferences')}
                onValueChange={(val) =>
                  form.setValue(
                    'cookie_preferences',
                    val as 'essential' | 'all',
                    {
                      shouldDirty: true,
                    }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">Essential Only</SelectItem>
                  <SelectItem value="all">Accept All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </FormSection>
  );
}
