/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toBeVisible(): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toHaveValue(value: string | number | string[]): R;
            toHaveTextContent(text: string | RegExp): R;
            toHaveClass(...classNames: string[]): R;
            toHaveAttribute(attr: string, value?: string): R;
        }
    }
}
