
/**
 * Reads credentials lazily (at resolve time, same as before), so dotenv
 * only needs to be loaded before the first resolve, not before import.
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}


export const razorpayConfigFactory = (): RazorpayConfig => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in the environment");
  }

  return { keyId, keySecret };
};