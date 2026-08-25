import { Request } from 'express';
import { supabase } from './supabase';

interface AuditLogParams {
  req?: Request;
  institution_id?: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

/**
 * Log an auditable action to the audit_logs table.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const { req, ...rest } = params;
    const institutionId = rest.institution_id || req?.user?.institution_id || null;
    const userId = rest.user_id || null;
    const ipAddress = req?.ip || req?.socket?.remoteAddress || null;

    await supabase.from('audit_logs').insert({
      institution_id: institutionId,
      user_id: userId,
      action: rest.action,
      entity_type: rest.entity_type,
      entity_id: rest.entity_id || null,
      old_value: rest.old_value || null,
      new_value: rest.new_value || null,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
