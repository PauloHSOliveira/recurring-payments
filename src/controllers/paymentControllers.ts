import { Request, Response } from 'express';
import stripe from '../services/stripe';
import { sendEmail } from '../services/emailService';
import logger from '../middleware/logger';

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
    logger.error(typedError.message);
    res.status(500).json({
      message: typedError.message,
    });
  }
};

export const updateSubscritionPlan = async (req: Request, res: Response) => {
  try {
    const { subscriptionId, planId } = req.body;

    const currentPlan = await stripe.subscriptions.retrieve(subscriptionId);

    const currentPlanId = currentPlan.items.data[0].id;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: currentPlanId, plan: planId }],
    });

    res.status(200).json(subscription);
  } catch (error) {
    const typedError = error as Error;

    logger.error(typedError.message);

    res.status(500).json({
      message: typedError.message,
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await stripe.subscriptions.cancel(subscriptionId);

    res.status(200).json(subscription);
  } catch (error) {
    const typedError = error as Error;
    logger.error(typedError.message);
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
    return res.status(400).end();
  }

  const paymentIntent = event.data.object;

  switch (event.type) {
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(paymentIntent);
      break;
    case 'invoice.payment_failed':
      handlePaymentFailed(paymentIntent);
      break;
    case 'invoice.updated':
      handlePaymentUpdated(paymentIntent);
      break;
    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePaymentSucceeded = (paymentIntent: any) => {
  const email = paymentIntent.customer_email;

  if (!email) {
    throw new Error('Payment Success Email: User email not found');
  }

  sendEmail({
    to: email,
    subject: 'Payment succeeded',
    text: 'Your payment was successful.',
    html: '<strong>Your payment was successful.</strong>',
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePaymentFailed = (paymentIntent: any) => {
  const email = paymentIntent.customer_email;

  if (!email) {
    throw new Error('Payment Failed Email: User email not found');
  }

  sendEmail({
    to: email,
    subject: 'Payment failed',
    text: 'Your payment has failed.',
    html: '<strong>Your payment has failed.</strong>',
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePaymentUpdated = (paymentIntent: any) => {
  const email = paymentIntent.customer_email;

  if (!email) {
    throw new Error('Payment Updated Email: User email not found');
  }

  sendEmail({
    to: email,
    subject: 'Payment updated',
    text: 'Your payment was updated.',
    html: '<strong>Your payment was updated.</strong>',
  });
};
