import { defineConfig } from '@medusajs/framework/utils';

export default defineConfig({
  modules: {
    translation: {
      resolve: "@medusajs/translation",
    },
    payment: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            id: "default",
            resolve: "./src/providers/payment/moyasar",
            options: {
              publishableKey: process.env.MOYASAR_PUBLISHABLE_KEY,
              secretKey: process.env.MOYASAR_SECRET_KEY,
              webhookSecret: process.env.MOYASAR_WEBHOOK_SECRET,
              callbackUrl: process.env.MOYASAR_CALLBACK_URL,
            },
          },
        ],
      },
    },
    fulfillment: {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            id: "oto",
            resolve: "./src/providers/fulfillment/oto",
          },
        ],
      },
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
});