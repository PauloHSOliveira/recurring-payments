import { Router } from 'express';
import { createSubscription, handleWebhook, updateSubscritionPlan } from '../controllers/paymentControllers';
import verifyWebhook from '../middlewares/verifyWebhook';

const router = Router();

router.post('/subscribe', createSubscription);

router.post('/update-plan', updateSubscritionPlan);

router.post('/webhook', verifyWebhook, handleWebhook);

export default router;
