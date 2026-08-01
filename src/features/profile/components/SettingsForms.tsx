'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  UserPreferences,
  PreferenceCategory,
  PreferenceSchemas,
} from '../types/preferences';
import { updateUserPreferences } from '../actions/preferences-actions';

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

// Reusable Form Section wrapper
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (form: ReturnType<typeof useForm<any>>) => React.ReactNode;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(PreferenceSchemas[category] as any),
    defaultValues,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSaving(true);
    const { success, error } = await updateUserPreferences(category, data);
    setIsSaving(false);

    if (success) {
      // Reset form with new values so it's considered pristine
      form.reset(data);
      toast({
        title: 'Settings saved',
        description: `Your ${title.toLowerCase()} preferences have been updated.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: error || 'An unknown error occurred.',
      });
    }
  };

  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;

  return (
    <div className="py-8 border-b border-slate-100 last:border-0 first:pt-0">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children(form)}

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={!isDirty || isSaving}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
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
      description="Manage what information is visible to others."
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
            label="Show Profile Photo Publicly"
            description="Allow anyone to see your profile photo."
            checked={form.watch('show_profile_photo')}
            onChange={(val) =>
              form.setValue('show_profile_photo', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Show Reviews Publicly"
            description="Allow your reviews to be visible on public listing pages."
            checked={form.watch('show_reviews')}
            onChange={(val) =>
              form.setValue('show_reviews', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Allow Search Indexing"
            description="Let search engines (like Google) index your public profile."
            checked={form.watch('allow_search_indexing')}
            onChange={(val) =>
              form.setValue('allow_search_indexing', val, { shouldDirty: true })
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
    <FormSection
      title="Security"
      description="Keep your account secure."
      category="security"
      defaultValues={data}
    >
      {(form) => (
        <div className="space-y-4">
          <ToggleRow
            label="Two-Factor Authentication"
            description="Require an extra code when logging in."
            checked={form.watch('two_factor_auth')}
            onChange={(val) =>
              form.setValue('two_factor_auth', val, { shouldDirty: true })
            }
          />
          <ToggleRow
            label="Allow New Device Login"
            description="Allow logins from new devices and browsers."
            checked={form.watch('allow_new_device_login')}
            onChange={(val) =>
              form.setValue('allow_new_device_login', val, {
                shouldDirty: true,
              })
            }
          />
          <ToggleRow
            label="Remember this Device"
            description="Keep me logged in on this device."
            checked={form.watch('remember_device')}
            onChange={(val) =>
              form.setValue('remember_device', val, { shouldDirty: true })
            }
          />
        </div>
      )}
    </FormSection>
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
                  form.setValue('cookie_preferences', val, {
                    shouldDirty: true,
                  })
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
