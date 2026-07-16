import { defineConfig } from "vite"

const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  ".trycloudflare.com",
  ".ngrok-free.app",
]

function parseAllowedHosts(value?: string): string[] {
  if (!value) {
    return DEFAULT_ALLOWED_HOSTS
  }

  const parsed = value
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean)

  return parsed.length ? parsed : DEFAULT_ALLOWED_HOSTS
}

export default defineConfig({
  server: {
    allowedHosts: parseAllowedHosts(process.env.ADMIN_ALLOWED_HOSTS),
  },
})