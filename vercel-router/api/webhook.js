/**
 * Central Twilio Webhook Router (Vercel Serverless Function)
 * This receives Twilio requests and forwards them to downstream projects
 * 
 * Usage:
 * 1. Deploy this to Vercel at https://twilio-router.vercel.app/api/webhook
 * 2. Update Twilio Console: Phone Numbers → Webhook URL → point to this endpoint
 * 3. This router forwards to the target project (ShramSuraksha, etc.)
 */

import axios from 'axios';
import twilio from 'twilio';

const TARGET_WEBHOOK = process.env.TARGET_WEBHOOK_URL || process.env.TWILIO_ROUTER_DEFAULT_URL || 'https://shramsuraksha-api-production.up.railway.app/api/twilio/whatsapp/webhook';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';

/**
 * Verify Twilio request authenticity
 */
function verifyTwilioRequest(req) {
  if (!TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  TWILIO_AUTH_TOKEN not set — skipping signature validation');
    return true;
  }

  const url = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/webhook`;
  const twilioSignature = req.headers['x-twilio-signature'] || '';

  try {
    const isValid = twilio.validateRequest(TWILIO_AUTH_TOKEN, twilioSignature, url, req.body);
    return isValid;
  } catch (err) {
    console.error('Twilio signature validation error:', err.message);
    return false;
  }
}

/**
 * Route handler for incoming Twilio requests
 */
export default async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Log incoming request
  const from = req.body?.From || 'unknown';
  const body = (req.body?.Body || '').substring(0, 50);
  console.log(`📨 Incoming Twilio request from ${from}: "${body}..."`);

  // Verify authenticity (security first)
  if (!verifyTwilioRequest(req)) {
    console.warn('❌ Twilio signature verification failed');
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  try {
    // Route decision: check channel and body to determine target
    const channel = req.body?.Channels || 'whatsapp';
    let target = TARGET_WEBHOOK;

    // Example: route by keyword (add more logic as needed)
    if (/^HELP\b/i.test(body)) {
      console.log('🔀 Routing to HELP handler...');
      // target = process.env.HELP_PROJECT_URL || target;
    }

    console.log(`➡️  Forwarding to: ${target}`);

    // Forward request to target project
    const response = await axios.post(target, req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-From': 'Twilio-Router',
        'X-Original-From': from,
      },
    });

    const responseData = response.data;

    // Handle response from target project
    let twiml = responseData;

    // If target returns { twiml: '...' }, extract it
    if (typeof responseData === 'object' && responseData.twiml) {
      twiml = responseData.twiml;
    }

    // If response is JSON but not TwiML, assume success and send generic response
    if (typeof responseData === 'object' && !responseData.toString().includes('<Response>')) {
      twiml = '<Response><Message>Message received and processed.</Message></Response>';
    }

    // Return TwiML response to Twilio
    console.log(`✅ Sending response back to Twilio`);
    return res.status(200).type('text/xml').send(twiml);
  } catch (err) {
    console.error('❌ Router error:', err.message);

    // Return error TwiML to Twilio
    const errorTwiml = `
      <Response>
        <Message>Service temporarily unavailable. Please try again later.</Message>
      </Response>
    `.trim();

    return res.status(200).type('text/xml').send(errorTwiml);
  }
};
