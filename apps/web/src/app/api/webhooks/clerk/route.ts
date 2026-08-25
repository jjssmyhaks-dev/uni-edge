import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, unknown>;
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  // Verify webhook signature
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = event.type;
  const { id, email_addresses, first_name, last_name, public_metadata } = event.data;

  const email = email_addresses?.[0]?.email_address;
  const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;

  try {
    switch (eventType) {
      case 'user.created': {
        const role = (public_metadata?.role as string) || 'applicant';
        const institutionId = (public_metadata?.institution_id as string) || null;
        const departmentId = (public_metadata?.department_id as string) || null;

        const { error } = await supabase.from('users').insert({
          clerk_user_id: id,
          email: email!,
          full_name: fullName,
          role,
          institution_id: institutionId,
          department_id: departmentId,
        });

        if (error) {
          console.error('Error creating user in Supabase:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case 'user.updated': {
        const { error } = await supabase
          .from('users')
          .update({
            email: email!,
            full_name: fullName,
            role: (public_metadata?.role as string) || undefined,
            institution_id: (public_metadata?.institution_id as string) || undefined,
            department_id: (public_metadata?.department_id as string) || undefined,
          })
          .eq('clerk_user_id', id);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case 'user.deleted': {
        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('clerk_user_id', id);

        if (error) {
          console.error('Error deactivating user in Supabase:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
