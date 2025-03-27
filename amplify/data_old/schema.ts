// amplify/data/schema.ts
import { a } from '@aws-amplify/backend';

// Define your schema using the 'a' object
export const schema = a.schema({
  SVGTexture: a.model({
    id: a.id().required(),
    name: a.string().required(),
    url: a.string().required(),
    description: a.string()
  }).authorization(allow => allow.publicApiKey())
});