# Research Notes Behind the Rebuild

The v2 security direction prioritizes **containment, evidence transparency and limited agency** rather than relying on system prompts as a security boundary.

## Security references

- OWASP GenAI / LLM Top 10: https://genai.owasp.org/llm-top-10/
- OWASP Prompt Injection (LLM01): https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP Sensitive Information Disclosure (LLM02): https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/
- NIST AI RMF Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- Anthropic agent containment engineering: https://www.anthropic.com/engineering/how-we-contain-claude

## Product-design observations

Modern finance platforms increasingly emphasize continuous close, exception workflows, customizable reporting, direct ERP integration, approval chains and visible audit history. CFO OS v2 therefore moves away from a dashboard full of equal-weight cards and toward a decision hierarchy: **close readiness → booked results → exceptions → evidence → AI explanation → qualified action**.

Example product references considered include Brex accounting/reporting flows and contemporary FP&A agent workflows. CFO OS does not copy any proprietary UI or implementation.
