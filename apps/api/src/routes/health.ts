import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check Supabase connectivity
    const { error } = await supabase.from('institutions').select('id').limit(1);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: error ? 'unhealthy' : 'healthy',
      },
    });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'unreachable',
      },
    });
  }
});

export default router;
