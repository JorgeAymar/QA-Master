import { chromium } from 'playwright';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Prevent crash if missing, handle later
});

export async function evaluateStoryWithAI(url: string, storyTitle: string, criteria: string, attachmentsContext?: string, language: string = 'es', headless: boolean = true) {
    let browser = null;
    try {
        browser = await chromium.launch({ headless });
        const page = await browser.newPage();

        console.log(`Navigating to ${url}...`);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        if (!response?.ok()) {
            return {
                status: 'FAIL',
                logs: `Error: Could not navigate to ${url}. Status: ${response?.status()}`,
                screenshot: null
            };
        }

        const logs = [`Navigated to ${url}`];
        let stepCount = 0;
        const MAX_STEPS = 5;
        let finalStatus = 'FAIL';
        let finalReason = 'Max steps reached without conclusion.';

        // Interaction Loop
        while (stepCount < MAX_STEPS) {
            stepCount++;
            console.log(`AI Agent Step ${stepCount}`);

            // Extract content
            const bodyText = await page.evaluate(() => document.body.innerText);
            const interactiveElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('button, a, input, select, textarea');
                return Array.from(elements).map(el => {
                    const element = el as HTMLElement;
                    return {
                        tag: element.tagName.toLowerCase(),
                        text: element.textContent?.trim() || '',
                        id: element.id,
                        name: (element as HTMLInputElement).name || '',
                        placeholder: (element as HTMLInputElement).placeholder || '',
                        type: (element as HTMLInputElement).type || ''
                    };
                });
            });

            const prompt = `
            You are an Autonomous QA Agent. Your goal is to verify a User Story on a web page.
            You can interact with the page (click, fill) to reach the state where the story can be verified.

            User Story: "${storyTitle}"
            Acceptance Criteria: "${criteria}"

            ${attachmentsContext ? `
            Attached Files Content:
            ${attachmentsContext}
            ` : ''}

            Current Page Content (Truncated):
            ${bodyText.substring(0, 3000)}...

            Interactive Elements:
            ${JSON.stringify(interactiveElements.slice(0, 50))}

            History of actions:
            ${logs.join('\n')}

            Instructions:
            1. Decide the NEXT action to move towards verifying the story.
            2. If you see a login form and the story implies logging in, look for credentials in the User Story text or use generic ones if implied (e.g. "admin"/"password").
            3. If the story is fully verified or failed beyond recovery, choose "finish".
            4. If you need to fill a field, use "fill". If you need to click, use "click".

            Return JSON:
            {
                "action": "click" | "fill" | "finish",
                "selector": "css selector to target element (prefer id, name, or robust attributes)",
                "value": "text to fill (only for fill action)",
                "reason": "Why this action?"
            }
            `;

            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY missing');
            }

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4o",
                response_format: { type: "json_object" },
            });

            const decision = JSON.parse(completion.choices[0].message.content || '{}');
            logs.push(`Step ${stepCount}: Decided to ${decision.action} (${decision.reason})`);

            if (decision.action === 'finish') {
                break;
            }

            // Execute Action
            try {
                if (decision.action === 'click') {
                    await page.click(decision.selector, { timeout: 5000 });
                    logs.push(`Executed: Clicked ${decision.selector}`);
                } else if (decision.action === 'fill') {
                    await page.fill(decision.selector, decision.value, { timeout: 5000 });
                    logs.push(`Executed: Filled ${decision.selector} with '${decision.value}'`);
                }
                // Wait for potential navigation or DOM update
                await page.waitForTimeout(headless ? 2000 : 4000);
            } catch (actionError: unknown) {
                const actionErrorMessage = actionError instanceof Error ? actionError.message : String(actionError);
                logs.push(`Action Failed: ${actionErrorMessage}`);
                // If action fails, we might want to stop or try again. Let's continue to see if AI can recover or finish.
            }
        }

        // Final Evaluation
        const finalScreenshotBuffer = await page.screenshot({ fullPage: true });
        const finalScreenshotBase64 = finalScreenshotBuffer.toString('base64');
        const finalBodyText = await page.evaluate(() => document.body.innerText);

        const evalPrompt = `
        You are a QA Automation Agent.
        User Story: "${storyTitle}"
        Acceptance Criteria: "${criteria}"

        Final Page Content:
        ${finalBodyText.substring(0, 5000)}...

        Action History:
        ${logs.join('\n')}

        Instructions:
        1. Evaluate STRICTLY if the Acceptance Criteria are met based on the final state and history.
        2. If ANY criteria is unmet, return FAIL.
        3. Provide the "reason" in the following language: "${language}".

        Return JSON:
        {
            "status": "PASS" | "FAIL",
            "reason": "Final verdict explanation in ${language}"
        }
        `;

        const evalCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: evalPrompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const evalResult = JSON.parse(evalCompletion.choices[0].message.content || '{}');
        finalStatus = evalResult.status || 'FAIL';
        finalReason = evalResult.reason || 'No reason provided';

        return {
            status: finalStatus,
            logs: logs.join('\n') + `\n\nFinal Verdict: ${finalReason}`,
            screenshot: `data:image/png;base64,${finalScreenshotBase64}`
        };

    } catch (error: unknown) {
        console.error('AI Testing Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            status: 'FAIL',
            logs: `System Error: ${errorMessage}`,
            screenshot: null
        };
    } finally {
        if (browser) await browser.close();
    }
}
