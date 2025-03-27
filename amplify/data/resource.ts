// amplify/data/resource.ts
import { defineData } from '@aws-amplify/backend';
import { schema } from './schema';

export const data = defineData({
  schema,
});