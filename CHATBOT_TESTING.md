# Chatbot System Testing Documentation

## Overview
This document describes the comprehensive test suite for the Campus Connect chatbot system.

## Test Structure

### 1. Unit Tests

#### **Gemini Client Tests** (`__tests__/lib/gemini-client.test.ts`)
Tests the AI integration layer:
- ✅ Generates responses based on PDF chunks
- ✅ Includes conversation history in prompts
- ✅ Handles missing API key gracefully
- ✅ Handles API errors properly
- ✅ Token counting functionality
- ✅ Context size validation

#### **Chunk Retrieval Tests** (`__tests__/lib/chunk-retrieval.test.ts`)
Tests PDF content search and retrieval:
- ✅ Retrieves relevant chunks based on queries
- ✅ Handles empty search results
- ✅ Respects limit parameters
- ✅ Gets all chunks for a note
- ✅ Counts chunks correctly
- ✅ Retrieves context chunks with window expansion
- ✅ Handles database errors

### 2. Component Tests

#### **ChatDemo Component Tests** (`__tests__/components/ChatDemo.test.tsx`)
Tests the demo chatbot UI:
- ✅ Renders chat interface correctly
- ✅ Displays initial AI greeting
- ✅ Shows suggested questions
- ✅ Allows user input
- ✅ Sends messages via button click
- ✅ Sends messages via Enter key
- ✅ Displays AI responses after delay
- ✅ Handles suggested question clicks
- ✅ Disables input while loading
- ✅ Prevents sending empty messages
- ✅ Shows context information
- ✅ Displays demo disclaimer
- ✅ Responds with default message for unknown queries
- ✅ Hides suggestions after multiple messages

### 3. Integration Tests

#### **Chat API Route Tests** (`__tests__/api/chat.test.ts`)
Tests the `/api/chat/[noteId]` endpoint:

**POST Endpoint:**
- ✅ Returns AI response for valid requests
- ✅ Returns 400 if message is missing
- ✅ Returns 404 if note not found
- ✅ Returns 400 if PDF not processed
- ✅ Handles no relevant chunks found
- ✅ Includes conversation history
- ✅ Returns 503 for Gemini API errors
- ✅ Returns 500 for other errors

**GET Endpoint:**
- ✅ Returns chat status for valid note
- ✅ Returns 404 if note not found
- ✅ Returns false availability if not processed

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- __tests__/lib/gemini-client.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should generate a response"
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for core libraries
- **Component Tests**: 80%+ coverage for UI components
- **Integration Tests**: 85%+ coverage for API routes

## Mocking Strategy

### External Dependencies
- **@google/generative-ai**: Mocked to avoid real API calls
- **@supabase/supabase-js**: Mocked for database operations
- **next/navigation**: Mocked for Next.js routing
- **framer-motion**: Mocked for animations

### Environment Variables
All required environment variables are mocked in `jest.setup.js`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Test Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: `beforeEach` and `afterEach` hooks ensure clean state
3. **Async Handling**: Proper use of `async/await` and `waitFor`
4. **Error Cases**: Comprehensive error scenario testing
5. **Edge Cases**: Testing boundary conditions and unusual inputs

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (no real API calls)
- Deterministic results
- Clear error messages
- No external dependencies

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Check for missing `await` keywords or increase timeout

**Issue**: Mock not working
**Solution**: Ensure mocks are defined before imports

**Issue**: TypeScript errors
**Solution**: Check `__tests__/setup.d.ts` for type declarations

## Future Enhancements

- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Load testing for API routes
