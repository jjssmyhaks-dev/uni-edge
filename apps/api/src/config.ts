import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.EXPRESS_API_PORT || '4001', 10),
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  },
  newRelic: {
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  },
} as const;
