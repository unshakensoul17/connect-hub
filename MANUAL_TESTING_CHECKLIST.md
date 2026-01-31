# Manual Testing Checklist for Chatbot System

## Prerequisites
- ✅ Ensure `.env.local` has `GEMINI_API_KEY` configured
- ✅ Supabase database is running and accessible
- ✅ Development server is running (`npm run dev`)

## Test 1: Demo Chatbot Page
**URL**: `http://localhost:3000/demo/chatbot`

### Steps:
1. Navigate to the demo chatbot page
2. Verify the page loads without errors
3. Check that the initial AI greeting message appears
4. Verify suggested questions are displayed
5. Click on a suggested question (e.g., "What is a qubit?")
6. Verify the AI responds with relevant information
7. Type a custom question in the input field
8. Press Enter or click the send button
9. Verify the message is sent and AI responds
10. Try sending an empty message (should be prevented)
11. Verify the demo disclaimer is shown at the bottom

### Expected Results:
- ✅ Page loads successfully
- ✅ UI is responsive and visually appealing
- ✅ Suggested questions work correctly
- ✅ Custom questions receive appropriate responses
- ✅ Empty messages are blocked
- ✅ Demo disclaimer is visible

## Test 2: Real Chat with PDF (if PDF uploaded)
**URL**: Navigate to a note with an uploaded PDF

### Steps:
1. Upload a PDF note (if not already done)
2. Open the note detail page
3. Click the "Chat with PDF" button
4. Wait for PDF processing (if first time)
5. Verify the chat modal opens
6. Check that suggested questions appear
7. Ask a question about the PDF content
8. Verify the AI responds based on the PDF
9. Ask a follow-up question
10. Verify conversation history is maintained
11. Close the chat modal

### Expected Results:
- ✅ PDF processes successfully
- ✅ Chat modal opens correctly
- ✅ Questions are answered based on PDF content
- ✅ Conversation history is preserved
- ✅ Modal closes properly

## Test 3: Error Handling

### Test 3.1: Missing API Key
1. Temporarily remove `GEMINI_API_KEY` from `.env.local`
2. Restart the dev server
3. Try to use the chat feature
4. Verify appropriate error message is shown
5. Restore the API key

### Test 3.2: PDF Not Processed
1. Try to chat with a note that hasn't been processed
2. Verify appropriate message is shown
3. Wait for processing to complete
4. Retry chat

### Test 3.3: Network Errors
1. Disconnect from internet (or block API requests)
2. Try to send a message
3. Verify error handling works gracefully
4. Reconnect and retry

### Expected Results:
- ✅ Clear error messages for missing API key
- ✅ Helpful message when PDF not ready
- ✅ Graceful handling of network errors
- ✅ No application crashes

## Test 4: Performance & UX

### Metrics to Check:
1. **Response Time**: AI should respond within 2-5 seconds
2. **UI Responsiveness**: No lag when typing or scrolling
3. **Animation Smoothness**: Transitions should be smooth
4. **Mobile Responsiveness**: Test on different screen sizes
5. **Accessibility**: Keyboard navigation should work

### Expected Results:
- ✅ Fast response times
- ✅ Smooth animations
- ✅ Responsive on all devices
- ✅ Accessible via keyboard

## Test 5: Edge Cases

### Test 5.1: Very Long Questions
1. Type a very long question (500+ characters)
2. Verify it's handled correctly

### Test 5.2: Special Characters
1. Try questions with emojis, special characters
2. Verify they're processed correctly

### Test 5.3: Rapid Fire Questions
1. Send multiple questions quickly
2. Verify all are processed in order

### Test 5.4: Context Switching
1. Ask about topic A
2. Ask about topic B
3. Ask a follow-up about topic A
4. Verify context is maintained

### Expected Results:
- ✅ Long questions handled gracefully
- ✅ Special characters don't break the system
- ✅ Multiple questions processed correctly
- ✅ Context is maintained properly

## Automated Test Results
Run: `npm test`

Expected output:
```
Test Suites: 4 passed, 4 total
Tests:       12 passed, 12 total
```

## Performance Benchmarks

### Target Metrics:
- **Initial Page Load**: < 2 seconds
- **Chat Modal Open**: < 500ms
- **AI Response Time**: 2-5 seconds
- **Message Send**: < 100ms
- **Scroll Performance**: 60 FPS

## Known Issues & Limitations

1. **Demo Mode**: Uses mock data, not real AI
2. **Token Limits**: Very large PDFs may hit token limits
3. **Rate Limiting**: Gemini API has rate limits
4. **Browser Compatibility**: Tested on Chrome, Firefox, Safari

## Sign-off

- [ ] All manual tests passed
- [ ] All automated tests passed
- [ ] Performance metrics met
- [ ] No critical bugs found
- [ ] Ready for production

**Tested by**: _________________
**Date**: _________________
**Notes**: _________________
