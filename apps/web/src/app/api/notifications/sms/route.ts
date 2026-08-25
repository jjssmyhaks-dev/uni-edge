import { NextRequest, NextResponse } from 'next/server';

const MSG91_API_KEY = process.env.MSG91_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { phone, templateId, variables } = await request.json();

    if (!phone || !templateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!MSG91_API_KEY) {
      console.log('SMS skipped (no MSG91_API_KEY):', { phone, templateId });
      return NextResponse.json({ success: true, message: 'SMS queued (no API key configured)' });
    }

    const response = await fetch('https://api.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_API_KEY,
      },
      body: JSON.stringify({
        flow_id: templateId,
        mobiles: phone.replace('+', ''),
        VAR1: variables?.name || '',
        VAR2: variables?.message || '',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MSG91 API error: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
