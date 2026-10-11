import {z} from 'zod';

// The named campaign themes from DESIGN.md. Kept apart from theme.ts, which imports Remotion, so
// the definition schema can be read on the server by the /motion wizard and its API.
export const campaignSchema = z.enum(['ink', 'paper', 'blueprint', 'warm-stage']);
export type Campaign = z.infer<typeof campaignSchema>;
