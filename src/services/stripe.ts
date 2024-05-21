import Stripe from 'stripe';

console.log(process.env.STRIPE_SECRET_KEY!);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export default stripe;
