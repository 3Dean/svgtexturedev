import { defineStorage } from '@aws-amplify/backend-storage';

export const storage = defineStorage({
  name: 'myStorageBucket',
  access: (allow) => ({
    'public/*': [
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});
