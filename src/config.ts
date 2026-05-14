import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
