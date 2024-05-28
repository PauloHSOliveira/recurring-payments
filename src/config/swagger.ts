import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Payment API',
    version: '1.0.0',
    description: 'API for managing payment subscriptions',
  },
  paths: {
    '/api/payments/create-subscription': {
      post: {
        summary: 'Create a new subscription',
        requestBody: {
          description: 'Subscription data',
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    example: 'user@example.com',
                  },
                  paymentMethodId: {
                    type: 'string',
                    example: 'pm_1IYEYQCJsrx12345',
                  },
                  planId: {
                    type: 'string',
                    example: 'plan_1IYEYQ123456',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Subscription created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'sub_1IYEYQCJsrx12345',
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/payments/cancel-subscription': {
      post: {
        summary: 'Cancel a subscription',
        requestBody: {
          description: 'Subscription ID',
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  subscriptionId: {
                    type: 'string',
                    example: 'sub_1IYEYQCJsrx12345',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Subscription canceled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'sub_1IYEYQCJsrx12345',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Subscription not found',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
    '/api/payments/webhook': {
      post: {
        summary: 'Stripe webhook',
        requestBody: {
          description: 'Webhook payload',
          required: true,
          content: {
            'application/json': {},
          },
        },
        responses: {
          '200': {
            description: 'Webhook received',
          },
          '400': {
            description: 'Invalid payload',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [`../routes/paymentRoutes.ts`], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec };
