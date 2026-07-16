import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/hooks/moyasar",
      methods: ["POST"],
      // Required for webhook signature verification.
      bodyParser: {
        preserveRawBody: true,
      },
    },
  ],
})
