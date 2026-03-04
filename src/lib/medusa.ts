import Medusa from "@medusajs/js-sdk"

// Initialize Medusa client
export const medusa = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_URL || "http://localhost:9000",
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ""
})

export default medusa

