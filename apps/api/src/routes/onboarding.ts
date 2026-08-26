import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/v1/onboarding/status
 * Check if the current user has completed onboarding
 * (has an institution_id and is institution_admin)
 */
router.get('/status', async (req: Request, res: Response) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, institution_id, role, full_name, email')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (error || !user) {
    // User not synced yet — needs onboarding
    res.json({ data: { onboarded: false, user: null }, error: null });
    return;
  }

  const onboarded = !!user.institution_id && user.role === 'institution_admin';
  res.json({ data: { onboarded, user }, error: null });
});

/**
 * POST /api/v1/onboarding/complete
 * Complete onboarding: create institution, create/update user as institution_admin
 */
router.post('/complete', async (req: Request, res: Response) => {
  const body = z.object({
    institution_name: z.string().min(2, 'Institution name is required'),
    institution_type: z.enum(['government', 'private', 'deemed']),
    short_name: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }).parse(req.body);

  // Check if user already has an institution
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, institution_id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (existingUser?.institution_id) {
    throw new AppError(400, 'ALREADY_ONBOARDED', 'You have already set up an institution');
  }

  // Create institution
  const { data: institution, error: instError } = await supabase
    .from('institutions')
    .insert({
      name: body.institution_name,
      short_name: body.short_name || null,
      type: body.institution_type,
      address: body.address || null,
      settings: body.website ? { website: body.website } : {},
    })
    .select()
    .single();

  if (instError) throw new AppError(500, 'DB_ERROR', instError.message);

  // Create or update user as institution_admin
  if (existingUser) {
    // Update existing user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        institution_id: institution.id,
        role: 'institution_admin',
      })
      .eq('id', existingUser.id);

    if (userError) {
      console.error('Failed to update user:', userError);
      // Try to clean up the institution
      await supabase.from('institutions').delete().eq('id', institution.id);
      throw new AppError(500, 'DB_ERROR', userError.message);
    }
  } else {
    // Create new user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: req.user!.sub,
        institution_id: institution.id,
        role: 'institution_admin',
        email: req.user!.email || '',
        full_name: req.user!.sub,
      });

    if (userError) {
      console.error('Failed to create user:', userError);
      await supabase.from('institutions').delete().eq('id', institution.id);
      throw new AppError(500, 'DB_ERROR', userError.message);
    }
  }

  await logAudit({
    req,
    action: 'onboarding_completed',
    entity_type: 'institution',
    entity_id: institution.id,
    new_value: { name: body.institution_name, type: body.institution_type },
  });

  res.status(201).json({
    data: { institution },
    error: null,
  });
});

export default router;
