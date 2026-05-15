export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  retryOn: number[];
}

const DEFAULT_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoffMs: 100,
  retryOn: [500, 502, 503, 504],
};

const retryPolicies = new Map<string, RetryPolicy>();

export function setRetryPolicy(route: string, policy: Partial<RetryPolicy>): RetryPolicy {
  const merged: RetryPolicy = { ...DEFAULT_POLICY, ...policy };
  retryPolicies.set(route, merged);
  return merged;
}

export function getRetryPolicy(route: string): RetryPolicy | undefined {
  return retryPolicies.get(route);
}

export function removeRetryPolicy(route: string): boolean {
  return retryPolicies.delete(route);
}

export function getAllRetryPolicies(): Record<string, RetryPolicy> {
  const result: Record<string, RetryPolicy> = {};
  for (const [route, policy] of retryPolicies.entries()) {
    result[route] = policy;
  }
  return result;
}

export function hasRetryPolicy(route: string): boolean {
  return retryPolicies.has(route);
}

export function shouldRetry(route: string, statusCode: number, attemptCount: number): boolean {
  const policy = retryPolicies.get(route);
  if (!policy) return false;
  return attemptCount < policy.maxRetries && policy.retryOn.includes(statusCode);
}

export function getBackoffDelay(route: string, attemptCount: number): number {
  const policy = retryPolicies.get(route);
  if (!policy) return 0;
  return policy.backoffMs * Math.pow(2, attemptCount);
}

export function resetRetryPolicies(): void {
  retryPolicies.clear();
}
