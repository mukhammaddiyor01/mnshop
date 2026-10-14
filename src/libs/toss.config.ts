type PaymentEnvironment = Partial<Pick<
  NodeJS.ProcessEnv,
  "FRONTEND_URL" | "BUYER_FRONTEND_URL"
>>;

export function isSupportedTossTestKeyPair(
  clientKey: string,
  secretKey: string,
): boolean {
  const isIndividualKeyPair =
    clientKey.startsWith("test_ck_") && secretKey.startsWith("test_sk_");
  const isPaymentKeyPair =
    clientKey.startsWith("test_gck_") && secretKey.startsWith("test_gsk_");

  return (
    clientKey.length > 20 &&
    secretKey.length > 20 &&
    (isIndividualKeyPair || isPaymentKeyPair)
  );
}

export function getPaymentFrontendUrl(env: PaymentEnvironment): string {
  return String(
    env.FRONTEND_URL || env.BUYER_FRONTEND_URL || "http://localhost:1213",
  ).replace(/\/$/, "");
}
