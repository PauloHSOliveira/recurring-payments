import { Router } from 'express';
import {
  createSubscription,
  handleWebhook,
  updateSubscritionPlan,
  cancelSubscription,
} from '../controllers/paymentControllers';
import verifyWebhook from '../middlewares/verifyWebhook';

const router = Router();

router.post('/subscribe', createSubscription);

router.post('/update-plan', verifyWebhook, updateSubscritionPlan);

router.post('/cancel-plan', cancelSubscription);

router.post('/webhook', verifyWebhook, handleWebhook);

export default router;
