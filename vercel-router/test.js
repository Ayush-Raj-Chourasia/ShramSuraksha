/**
 * Test script for Twilio Router
 * Simulates incoming Twilio webhook requests
 * 
 * Usage:
 * node test.js
 */

import axios from 'axios';
import twilio from 'twilio';

const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:3000/api/webhook';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'test_token';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'ACtest123456';

/**
 * Create a mock Twilio webhook request
 */
function createTwilioRequest(body = {}) {
  const defaultBody = {
    MessageSid: 'SMtest123456789',
    AccountSid: TWILIO_ACCOUNT_SID,
    From: 'whatsapp:+919876543210',
    To: 'whatsapp:+14155238886',
    Body: 'Hello from test',
    Channels: 'whatsapp',
    NumMedia: '0',
    ...body,
  };

  // Convert to URL-encoded format (like Twilio sends)
  const params = new URLSearchParams(defaultBody);
  const urlString = params.toString();

  // Generate Twilio signature
  const signature = twilio.validateRequest(TWILIO_AUTH_TOKEN, '', ROUTER_URL, defaultBody);

  return {
    body: defaultBody,
    urlEncoded: urlString,
    headers: {
      'X-Twilio-Signature': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
}

/**
 * Send test request to router
 */
async function sendTestRequest(message = 'Test WhatsApp message') {
  try {
    console.log('\n🧪 Testing Twilio Router...\n');
    console.log(`📍 Router URL: ${ROUTER_URL}`);
    console.log(`📨 Test Message: "${message}"\n`);

    const twRequest = createTwilioRequest({
      Body: message,
      From: 'whatsapp:+919876543210',
    });

    console.log('📤 Sending request...');
    const response = await axios.post(ROUTER_URL, twRequest.body, {
      headers: twRequest.headers,
      timeout: 10000,
    });

    console.log('✅ Success!\n');
    console.log('📥 Response:');
    console.log(response.data);
    console.log(`\nStatus: ${response.status}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
}

/**
 * Test different scenarios
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Twilio Central Router - Test Suite');
  console.log('═══════════════════════════════════════════════════════════');

  // Test 1: Simple message
  await sendTestRequest('Hello, testing the router');

  // Test 2: Help keyword
  await sendTestRequest('HELP I need assistance');

  // Test 3: Multiple words
  await sendTestRequest('This is a longer test message with multiple words');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  All tests completed!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
