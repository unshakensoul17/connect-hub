
const API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-secret-api-key-for-client-auth";

interface IngestResponse {
    document_id: string;
    filename: string;
    message: string;
}

interface QueryResponse {
    answer: string;
    sources: Array<{
        id: string;
        content: string;
        similarity: number;
        metadata: any;
    }>;
}

export const RagApi = {
    /**
     * Uploads a PDF for ingestion.
     */
    async ingestPDF(file: File): Promise<IngestResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/ingest`, {
            method: "POST",
            headers: {
                "X-API-Key": API_KEY,
            },
            body: formData,
        });


        if (response.status === 409) {
            const error = await response.json().catch(() => ({}));
            if (error.document_id) {
                return {
                    document_id: error.document_id,
                    filename: file.name,
                    message: "Document already exists"
                };
            }
            throw new Error(error.detail || "Document already exists");
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Upload failed" }));
            throw new Error(error.detail || "Upload failed");
        }

        return response.json();
    },

    /**
     * Asks a question to the RAG system.
     */
    async query(question: string, filters?: { document_id?: string }): Promise<QueryResponse> {
        const body: any = { query: question, limit: 5 };
        if (filters?.document_id) {
            body.filters = { document_id: filters.document_id };
        }

        const response = await fetch(`${API_URL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Query failed" }));
            throw new Error(error.detail || "Query failed");
        }

        return response.json();
    }
};
