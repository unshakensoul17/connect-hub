import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not set in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
}

/**
 * Chat with PDF using Gemini API
 * Restricts responses to provided PDF content only
 */
export async function chatWithPDF(
    pdfChunks: string[],
    userQuery: string,
    conversationHistory: Message[] = [],
    options: ChatOptions = {}
): Promise<string> {
    if (!genAI) {
        throw new Error('Gemini API not configured. Please set GEMINI_API_KEY.');
    }

    // Use Gemini Flash for cost efficiency
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context from chunks
    const context = pdfChunks.join('\n\n---\n\n');

    // Build conversation history
    const historyText = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}`)
        .join('\n\n');

    // Construct prompt
    const prompt = `You are an AI tutor helping students understand their course notes. 

IMPORTANT RULES:
1. Answer ONLY based on the provided PDF content below
2. If the answer is not in the content, say "I cannot find this information in the provided notes."
3. Be concise and clear in your explanations
4. Use examples from the notes when helpful
5. If asked about topics not in the notes, politely redirect to the available content

PDF CONTENT:
${context}

${historyText ? `PREVIOUS CONVERSATION:\n${historyText}\n` : ''}

STUDENT QUESTION: ${userQuery}

AI TUTOR RESPONSE:`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log(`🤖 Gemini response generated (${text.length} chars)`);

        return text;
    } catch (error) {
        console.error('❌ Gemini API error:', error);
        throw new Error('Failed to generate response from AI');
    }
}

/**
 * Count tokens in text (approximate)
 */
export function countTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Check if context exceeds token limit
 */
export function validateContextSize(chunks: string[], limit: number = 30000): boolean {
    const totalTokens = chunks.reduce((sum, chunk) => sum + countTokens(chunk), 0);
    return totalTokens <= limit;
}
