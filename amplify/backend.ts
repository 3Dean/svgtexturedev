// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

// No data import

export const backend = defineBackend({
  auth,
  // No data here
});