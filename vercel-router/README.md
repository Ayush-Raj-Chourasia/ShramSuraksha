# Twilio Central Router (Vercel)

A lightweight webhook router that centralizes Twilio requests and forwards them to your backend projects.

## Why This?

- **Single Twilio Number**: Use one Twilio phone number across multiple projects
- **Flexible Routing**: Route by channel (WhatsApp, SMS), keyword, or user identity
- **Scalable**: Add more projects without changing your Twilio configuration
- **Security**: Validates Twilio request signatures

## Architecture

```
Twilio API
    ↓
Vercel Router (https://twilio-router.vercel.app/api/webhook)
    ↓
ShramSuraksha (+ other projects)
```

## Setup Instructions

### 1. Deploy to Vercel

```bash
# Clone or navigate to this project
cd vercel-router

# Deploy to Vercel
vercel --prod
```

Your router will be live at: `https://twilio-router.vercel.app/api/webhook`

### 2. Configure Environment Variables in Vercel

Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `TARGET_WEBHOOK_URL` | `https://shramsuraksha-api-production.up.railway.app/api/twilio/whatsapp/webhook` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token (from Twilio Console) |

### 3. Update Twilio Phone Number Webhook

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Select your WhatsApp/SMS number
4. Under **Messaging**, set:
   - **"A Message Comes In" Webhook URL**: `https://twilio-router.vercel.app/api/webhook`
   - **HTTP Method**: `POST`
5. Save

### 4. Verify in ShramSuraksha Project

The existing endpoint remains unchanged:
```
POST https://shramsuraksha-api-production.up.railway.app/api/twilio/whatsapp/webhook
```

The router will forward requests to this endpoint automatically.

---

## How It Works

### Incoming WhatsApp Message Flow

```
User sends WhatsApp → Twilio → Router (verifies signature) → ShramSuraksha → Response back to user
```

### Request Validation

The router validates all incoming requests using Twilio's signature validation before forwarding them.

### Response Handling

- **If target returns TwiML**: Forwarded directly to Twilio
- **If target returns JSON**: Wrapped in a default TwiML response
- **If target is unreachable**: Returns a friendly error message

---

## Advanced Routing (Optional)

To route different keywords to different projects, edit `api/webhook.js`:

```javascript
if (/^HELP\b/i.test(body)) {
  target = process.env.HELP_PROJECT_URL;
} else if (/^BILL\b/i.test(body)) {
  target = process.env.BILLING_PROJECT_URL;
}
```

Then add these to Vercel environment variables:
- `HELP_PROJECT_URL=https://support-project.example/webhook`
- `BILLING_PROJECT_URL=https://billing-project.example/webhook`

---

## Monitoring & Debugging

### View Logs in Vercel

```bash
vercel logs --prod
```

### Local Development

```bash
# Install dependencies
npm install

# Start local Vercel environment
npm run dev
```

Then use ngrok to expose your local server:
```bash
ngrok http 3000
# Use the ngrok URL in Twilio webhook settings for testing
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid Twilio signature" | Ensure `TWILIO_AUTH_TOKEN` is correctly set in Vercel env |
| "Service temporarily unavailable" | Check if `TARGET_WEBHOOK_URL` is reachable and responding |
| No response from Twilio | Verify webhook URL is correct in Twilio Console |
| Logs not showing | Run `vercel logs --prod` to see real-time logs |

---

## Security Best Practices

✅ Always validate Twilio requests (enabled by default)
✅ Use HTTPS for all webhook URLs
✅ Store auth tokens in Vercel environment variables (never in code)
✅ Limit target webhook access to Vercel IP ranges (optional)

---

## Next Steps

1. Deploy this router to Vercel
2. Update Twilio webhook URL
3. Test by sending a WhatsApp message to your Twilio number
4. Monitor logs in Vercel dashboard
5. (Optional) Add more projects to routing logic

For more info on Twilio webhooks: https://www.twilio.com/docs/usage/webhooks/getting-started-twilio-webhooks
