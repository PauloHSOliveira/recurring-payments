import { Request, Response } from 'express';
import stripe from '../services/stripe';

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { email, paymentMethodId, planId } = req.body;

    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: planId }],
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json(subscription);
  } catch (error) {
    const typedError = error as Error;
    res.status(500).json({
      message: typedError.message,
    });
  }
};

export const handleWebhook = (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.log(error);
    const typedError = error as Error;
    return res.status(400).send(`Webhook Error: ${typedError.message}`);
  }

  const paymentIntent = event.data.object;

  switch (event.type) {
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(paymentIntent);
      break;
    case 'invoice.payment_failed':
      handlePaymentFailed(paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

const handlePaymentSucceeded = (paymentIntent: unknown) => {
  console.log('Payment succeeded', paymentIntent);
};

const handlePaymentFailed = (paymentIntent: unknown) => {
  console.log('Payment failed', paymentIntent);
};
