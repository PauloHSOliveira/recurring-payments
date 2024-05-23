import { Router } from 'express';
import {
  createSubscription,
  handleWebhook,
  updateSubscritionPlan,
  cancelSubscription,
} from '../controllers/paymentControllers';
import bodyParser from 'body-parser';

const router = Router();

router.post('/subscribe', createSubscription);

router.post('/update-plan', updateSubscritionPlan);

router.post('/cancel-plan', cancelSubscription);

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleWebhook);

export default router;
