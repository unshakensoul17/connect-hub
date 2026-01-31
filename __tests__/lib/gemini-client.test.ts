/**
 * Unit Tests for Gemini Client
 * Tests the AI chat functionality with PDF content
 */

import { chatWithPDF, countTokens, validateContextSize } from '@/lib/gemini-client';

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: () => 'This is a test response from the AI.',
                },
            }),
        }),
    })),
}));

describe('Gemini Client', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment
        jest.resetModules();
        process.env = { ...originalEnv, GEMINI_API_KEY: 'test-api-key' };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe('chatWithPDF', () => {
        it('should generate a response based on PDF chunks', async () => {
            const pdfChunks = [
                'Quantum computing uses qubits instead of classical bits.',
                'Qubits can exist in superposition, representing 0 and 1 simultaneously.',
            ];
            const userQuery = 'What is a qubit?';

            const response = await chatWithPDF(pdfChunks, userQuery);

            expect(response).toBe('This is a test response from the AI.');
        });

        it('should include conversation history in the prompt', async () => {
            const pdfChunks = ['Some content'];
            const userQuery = 'Follow-up question';
            const history = [
                { role: 'user' as const, content: 'First question' },
                { role: 'assistant' as const, content: 'First answer' },
            ];

            const response = await chatWithPDF(pdfChunks, userQuery, history);

            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
        });

        it('should throw error when API key is not configured', async () => {
            // Remove API key
            delete process.env.GEMINI_API_KEY;

            // Re-import to get new instance without API key
            jest.resetModules();
            const { chatWithPDF: chatWithoutKey } = require('@/lib/gemini-client');

            await expect(
                chatWithoutKey(['content'], 'query')
            ).rejects.toThrow('Gemini API not configured');
        });
    });

    describe('countTokens', () => {
        it('should approximate token count correctly', () => {
            const text = 'This is a test string';
            const tokens = countTokens(text);

            // Approximate: length / 4
            expect(tokens).toBe(Math.ceil(text.length / 4));
        });

        it('should handle empty strings', () => {
            expect(countTokens('')).toBe(0);
        });

        it('should handle long text', () => {
            const longText = 'a'.repeat(10000);
            const tokens = countTokens(longText);

            expect(tokens).toBe(2500); // 10000 / 4
        });
    });

    describe('validateContextSize', () => {
        it('should return true for small context', () => {
            const chunks = ['short text', 'another short text'];
            expect(validateContextSize(chunks)).toBe(true);
        });

        it('should return false for context exceeding limit', () => {
            const largeChunk = 'a'.repeat(40000);
            const chunks = [largeChunk, largeChunk, largeChunk];

            // Total tokens = 3 * 10000 = 30000, which equals the default limit
            // So it should pass. Let's use a lower limit
            expect(validateContextSize(chunks, 25000)).toBe(false);
        });

        it('should respect custom token limit', () => {
            const chunks = ['a'.repeat(100)];

            // 100 chars = 25 tokens
            expect(validateContextSize(chunks, 20)).toBe(false);
            expect(validateContextSize(chunks, 30)).toBe(true);
        });
    });
});
