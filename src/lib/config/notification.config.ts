export const NotificationConfig = {
  defaultProvider: process.env.NOTIFICATION_PROVIDER || 'noop',
  channels: {
    email: {
      enabled: true,
      sender: 'noreply@elitestay.com',
      support: 'support@elitestay.com',
    },
    push: {
      enabled: false,
    },
    sms: {
      enabled: false,
    },
    inApp: {
      enabled: true,
    },
  },
};
