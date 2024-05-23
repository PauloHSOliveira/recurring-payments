import { Request, Response } from 'express';
import stripe from '../services/stripe';
import Stripe from 'stripe';
import { sendEmail } from '../services/emailService';

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { email, paymentMethodId, planId } = req.body;
    console.log(paymentMethodId);
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

export const updateSubscritionPlan = async (req: Request, res: Response) => {
  try {
    const { subscriptionId, planId } = req.body;

    const currentPlan = await stripe.subscriptions.retrieve(subscriptionId);

    if (!currentPlan) {
      res.status(404).json({
        message: 'Subscription not found',
      });
    }

    const currentPlanId = currentPlan.items.data[0].id;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: currentPlanId, plan: planId }],
    });

    res.status(200).json(subscription);
  } catch (error) {
    const typedError = error as Error;
    res.status(500).json({
      message: typedError.message,
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      res.status(404).json({
        message: 'Subscription not found',
      });
    }

    await stripe.subscriptions.cancel(subscriptionId);

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
    return res.status(400).end();
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

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
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};

const handlePaymentSucceeded = (paymentIntent: Stripe.PaymentIntent) => {
  console.log('Payment succeeded', paymentIntent);

  const email = paymentIntent.receipt_email;

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

const handlePaymentFailed = (paymentIntent: Stripe.PaymentIntent) => {
  console.log('Payment failed', paymentIntent);
  const email = paymentIntent.receipt_email;

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

const handlePaymentUpdated = (paymentIntent: Stripe.PaymentIntent) => {
  console.log('Payment updated', paymentIntent);

  const email = paymentIntent.receipt_email;

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
