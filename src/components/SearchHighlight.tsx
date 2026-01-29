interface SearchHighlightProps {
    text: string;
    className?: string;
}

/**
 * Component to render text with highlighted search matches
 * Parses <mark> tags from Meilisearch formatted results
 */
export function SearchHighlight({ text, className = '' }: SearchHighlightProps) {
    if (!text) return null;

    // If no highlight tags, return plain text
    if (!text.includes('<mark>')) {
        return <span className={className}>{text}</span>;
    }

    // Parse and render highlighted text
    const parts = text.split(/(<mark>.*?<\/mark>)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('<mark>')) {
                    const highlightedText = part.replace(/<\/?mark>/g, '');
                    return (
                        <mark
                            key={index}
                            className="bg-primary/30 text-primary-foreground font-semibold rounded px-0.5"
                        >
                            {highlightedText}
                        </mark>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}
