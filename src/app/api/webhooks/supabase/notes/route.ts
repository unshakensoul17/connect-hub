import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, extractBearerToken, getWebhookSecret } from '@/lib/webhook-security';
import { syncNoteToMeilisearch, updateNoteInMeilisearch, removeNoteFromMeilisearch } from '@/lib/meilisearch/sync';
import { Note } from '@/types/database';

type WebhookEventType = 'INSERT' | 'UPDATE' | 'DELETE';

interface WebhookPayload {
    type: WebhookEventType;
    table: string;
    schema: string;
    record: Note | null;
    old_record: Note | null;
}

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify webhook signature
        const authHeader = request.headers.get('authorization');
        const signature = extractBearerToken(authHeader);

        if (!signature) {
            console.error('❌ Webhook: Missing authorization header');
            return NextResponse.json(
                { success: false, error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        const webhookSecret = getWebhookSecret();
        const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

        if (!isValid) {
            console.error('❌ Webhook: Invalid signature');
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse payload
        const payload: WebhookPayload = JSON.parse(rawBody);

        console.log(`📫 Webhook received: ${payload.type} on ${payload.table}`);

        // Handle different event types
        switch (payload.type) {
            case 'INSERT':
                if (payload.record) {
                    await syncNoteToMeilisearch(payload.record);
                    console.log(`✅ Webhook: Synced new note ${payload.record.id}`);
                }
                break;

            case 'UPDATE':
                if (payload.record) {
                    await updateNoteInMeilisearch(payload.record);
                    console.log(`✅ Webhook: Updated note ${payload.record.id}`);
                }
                break;

            case 'DELETE':
                if (payload.old_record) {
                    await removeNoteFromMeilisearch(payload.old_record.id);
                    console.log(`✅ Webhook: Deleted note ${payload.old_record.id}`);
                }
                break;

            default:
                console.warn(`⚠️  Webhook: Unknown event type ${payload.type}`);
        }

        return NextResponse.json({
            success: true,
            message: `${payload.type} event processed successfully`,
        });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process webhook',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
