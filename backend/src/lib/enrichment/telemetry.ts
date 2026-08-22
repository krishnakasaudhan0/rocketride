export interface MockTelemetryData {
  source: string;
  usageHours: number;
  twoFactorUsed: boolean;
  avsMatch: boolean;
  cvvMatch: boolean;
  sessionCount: number;
}

/**
 * Simulates pulling authenticated customer telemetry from merchant product analytics (e.g. Mixpanel, PostHog, Stripe Radar, Datadog).
 */
export function fetchMockTelemetry(customerEmail?: string | null): MockTelemetryData {
  const email = (customerEmail || '').toLowerCase();

  // Known demo accounts return high-confidence verifiable telemetry
  if (email.includes('alex') || email.includes('vance') || email.includes('devmatrix') || email.includes('sarah') || email.includes('chen')) {
    return {
      source: 'mock_analytics_db',
      usageHours: 38.5,
      twoFactorUsed: true,
      avsMatch: true,
      cvvMatch: true,
      sessionCount: 14,
    };
  }

  if (email.includes('fraud') || email.includes('suspicious') || email.includes('fake')) {
    return {
      source: 'mock_analytics_db',
      usageHours: 0.5,
      twoFactorUsed: false,
      avsMatch: false,
      cvvMatch: false,
      sessionCount: 1,
    };
  }

  // Plausible default for real test webhooks
  return {
    source: 'mock_analytics_db',
    usageHours: 24.2,
    twoFactorUsed: true,
    avsMatch: true,
    cvvMatch: true,
    sessionCount: 9,
  };
}
