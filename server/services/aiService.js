const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    async generateTestCase(description) {
        if (!this.model) {
            return this.getMockTestCase(description);
        }

        const prompt = `As a Senior QA Engineer, generate a detailed test case for: "${description}". 
        Return ONLY a JSON object with the following structure:
        {
            "title": "Clear concise title",
            "description": "Detailed description",
            "priority": "Critical/High/Medium/Low",
            "type": "Manual/Automated",
            "steps": [
                {"stepNumber": 1, "action": "step action", "expectedResult": "expected result"}
            ]
        }`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Basic JSON cleaning if Gemini adds markdown blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("AI Generation Error:", error);
            return this.getMockTestCase(description);
        }
    }

    async analyzeTestFailure(testCase, failureDetails) {
        if (!this.model) {
            return { suggestion: "AI Analysis requires an API key. Please configure GEMINI_API_KEY." };
        }

        const prompt = `Analyze this failed test case and suggest a root cause and fix.
        Test Case: ${JSON.stringify(testCase)}
        Failure Details: ${failureDetails}
        Return a concise professional suggestion.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return { suggestion: response.text().trim() };
        } catch (error) {
            return { suggestion: "Failed to analyze with AI. Check server logs." };
        }
    }

    getMockTestCase(description) {
        return {
            title: `AI Generated: ${description}`,
            description: `Auto-generated test case for ${description}. Please review and update steps.`,
            priority: "Medium",
            type: "Manual",
            steps: [
                { stepNumber: 1, action: `Access the ${description} feature`, expectedResult: "Feature page loads successfully" },
                { stepNumber: 2, action: "Perform primary action", expectedResult: "System processes request without error" },
                { stepNumber: 3, action: "Verify database update", expectedResult: "Data is persisted correctly" }
            ]
        };
    }
}

module.exports = new AIService();
