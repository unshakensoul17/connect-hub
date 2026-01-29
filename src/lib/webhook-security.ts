import crypto from 'crypto';

/**
 * Generate HMAC signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

/**
 * Verify webhook signature using timing-safe comparison
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = generateWebhookSignature(payload, secret);

    try {
        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        // Signatures have different lengths - definitely don't match
        return false;
    }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Get webhook secret from environment
 */
export function getWebhookSecret(): string {
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret) {
        throw new Error('WEBHOOK_SECRET environment variable is not set');
    }

    return secret;
}
