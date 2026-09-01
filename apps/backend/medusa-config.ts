import { defineConfig, Modules } from '@medusajs/framework/utils';

export default defineConfig({
  modules: {
    translation: {
      resolve: "@medusajs/translation",
    },
    // NOTE: Redis-backed cache/event-bus/workflow modules caused a deterministic
    // startup deadlock (server hung after "Connection to Redis established" and
    // never bound port 9000). Reverted to Medusa's default in-memory modules to
    // restore a healthy server. Re-add these one at a time once the deadlock is
    // diagnosed. Storefront caching is handled at the Next.js layer (force-cache).
    // [Modules.CACHE]: {
    //   resolve: "@medusajs/cache-redis",
    //   options: { redisUrl: process.env.REDIS_URL },
    // },
    // [Modules.EVENT_BUS]: {
    //   resolve: "@medusajs/event-bus-redis",
    //   options: { redisUrl: process.env.REDIS_URL },
    // },
    // [Modules.WORKFLOW_ENGINE]: {
    //   resolve: "@medusajs/workflow-engine-redis",
    //   options: { redis: { redisUrl: process.env.REDIS_URL } },
    // },
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
    redisUrl: process.env.REDIS_URL,
    cookieOptions: {
      secure: false,
      sameSite: "lax",
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
});
