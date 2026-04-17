import { Router } from 'express';

const router = Router();

router.post('/whatsapp/webhook', async (req, res) => {
  const from = req.body.From || '';
  const body = (req.body.Body || '').trim();

  console.log('Twilio WhatsApp webhook received:', { from, body });

  res.type('text/xml').send(`
    <Response>
      <Message>Thanks for contacting ShramSuraksha. Your WhatsApp message was received.</Message>
    </Response>
  `.trim());
});

export default router;