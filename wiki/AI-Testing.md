# AI Testing

QA Master uses an innovative testing approach that combines Playwright with GPT-4 to create an intelligent testing agent.

## How It Works?

### Agentic Loop

Unlike traditional tests that follow fixed scripts, QA Master uses an **agentic loop** where the AI:

1. **Observes** the current state of the page
2. **Reasons** about what actions to take
3. **Acts** in the browser (click, type, navigate)
4. **Evaluates** if criteria were met
5. **Repeats** until validation is complete

```
┌─────────────────────────────────────────┐
│  1. Capture page state                  │
│     (HTML, visible elements)            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Send to GPT-4                       │
│     - User story                        │
│     - Acceptance criteria               │
│     - Current state                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. AI decides next action              │
│     - fill(selector, value)             │
│     - click(selector)                   │
│     - evaluate(criteria)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Playwright executes action          │
└──────────────┬──────────────────────────┘
               │
               ▼
         Final evaluation?
               │
        No ────┘     Yes
               │      │
               └──────▼
                  RESULT
```

## Evaluation Example

### User Story
```
Title: User Login
Criteria:
- Given I am on the login page
- When I enter valid email and password
- Then I should be redirected to the dashboard
```

### AI Process

**Iteration 1**:
```json
{
  "action": "fill",
  "selector": "input[type='email']",
  "value": "test@example.com",
  "reasoning": "I need to enter the email first"
}
```

**Iteration 2**:
```json
{
  "action": "fill",
  "selector": "input[type='password']",
  "value": "password123",
  "reasoning": "Now I enter the password"
}
```

**Iteration 3**:
```json
{
  "action": "click",
  "selector": "button[type='submit']",
  "reasoning": "I submit the login form"
}
```

**Iteration 4 (Evaluation)**:
```json
{
  "action": "evaluate",
  "status": "PASS",
  "reasoning": "The URL changed to /dashboard, the user was redirected correctly. All criteria were met."
}
```

## Advantages of AI Testing

### 1. Adaptability
- No need for hardcoded exact selectors
- Adapts to UI changes
- Understands semantic context

### 2. Reasoning
- Explains why it passed or failed
- Identifies specific problems
- Suggests improvements

### 3. Less Maintenance
- Tests more resilient to changes
- Don't break due to cosmetic changes
- Focus on behavior, not implementation

## Limitations

### 1. Cost
- Each test consumes OpenAI tokens
- Can be expensive for many tests

### 2. Speed
- Slower than traditional tests
- Each iteration requires an API call

### 3. Determinism
- Results may vary slightly
- Depends on model quality

## Best Practices

### Writing Good Acceptance Criteria

✅ **Good**:
```
- Given I am on the products page
- When I click on "Add to cart"
- Then I see the cart counter increment
- And I see a confirmation message
```

❌ **Bad**:
```
- The button should work
- The cart should update
```

### Specific and Measurable Criteria

AI works best with criteria that are:
- **Specific**: "The counter shows '1'" vs "The counter changes"
- **Observable**: "I see a message" vs "The system processes"
- **Sequential**: Step by step, not all at once

### Accessible URLs

Ensure that:
- The project URL is publicly accessible or reachable from your network
- Does not require complex authentication (outside the test flow)
- Loads quickly

## Advanced Configuration

### Environment Variables

```env
# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"  # Optional, defaults to gpt-4
```

### Timeout and Limits

The system has safety limits:
- **Max iterations**: 10 per test
- **Timeout**: 60 seconds per action
- **Screenshot**: Captured at the end

## Source Code

The AI testing code is located at:
- `src/lib/ai-testing.ts`: Main agentic loop
- `src/app/actions/testing.ts`: Server actions to execute tests

### Main Function

```typescript
export async function evaluateStoryWithAI(
  url: string,
  storyTitle: string,
  acceptanceCriteria: string
): Promise<{
  status: 'PASS' | 'FAIL';
  logs: string;
  screenshot: string | null;
}>
```

## Next Steps

- [Running Tests](Running-Tests)
- [Understanding Reports](Understanding-Reports)
- [Architecture](Architecture)
