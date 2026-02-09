import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  ContentAnalysis,
  WritingTone,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic | null;
  private readonly model = 'claude-sonnet-4-5-20250929';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY is not configured. AI features will be unavailable.',
      );
      this.client = null;
    } else {
      this.client = new Anthropic({ apiKey });
    }
  }

  private getClient(): Anthropic {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI features are not configured. Please set the ANTHROPIC_API_KEY environment variable.',
      );
    }
    return this.client;
  }

  /**
   * Generate title suggestions for blog content.
   * Returns an array of 5 title suggestions.
   */
  async generateTitleSuggestions(content: string): Promise<string[]> {
    const systemPrompt = `You are an expert blog editor and SEO specialist. Your task is to generate compelling, click-worthy blog post titles that are optimized for search engines. Each title should:
- Be between 40-70 characters for optimal SEO
- Include power words that drive engagement
- Be clear and descriptive about the content
- Vary in style (how-to, listicle, question, statement, etc.)

Return exactly 5 title suggestions, one per line, without numbering or bullet points.`;

    const text = await this.callClaude(
      systemPrompt,
      `Generate 5 compelling blog post title suggestions for the following content:\n\n${this.truncateContent(content, 4000)}`,
    );

    const titles = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length < 200);

    return titles.slice(0, 5);
  }

  /**
   * Generate an SEO-optimized meta description for a blog post.
   */
  async generateMetaDescription(
    title: string,
    content: string,
  ): Promise<string> {
    const systemPrompt = `You are an SEO specialist. Generate a compelling meta description for a blog post. The meta description should:
- Be between 150-160 characters
- Include the main keyword naturally
- Have a clear call-to-action or value proposition
- Accurately summarize the content
- Be engaging enough to drive clicks from search results

Return only the meta description text, nothing else.`;

    const text = await this.callClaude(
      systemPrompt,
      `Title: ${title}\n\nContent:\n${this.truncateContent(content, 3000)}`,
    );

    // Ensure it's within limits
    return text.trim().slice(0, 160);
  }

  /**
   * Generate an excerpt/summary for a blog post.
   */
  async generateExcerpt(
    content: string,
    maxLength: number = 160,
  ): Promise<string> {
    const systemPrompt = `You are a skilled content editor. Generate a concise, engaging excerpt for a blog post. The excerpt should:
- Capture the main idea of the content
- Be engaging and make readers want to read more
- Be no longer than ${maxLength} characters
- Be written in a natural, flowing style
- Not start with "This article" or "In this post"

Return only the excerpt text, nothing else.`;

    const text = await this.callClaude(
      systemPrompt,
      `Generate an excerpt (max ${maxLength} characters) for the following content:\n\n${this.truncateContent(content, 4000)}`,
    );

    return text.trim().slice(0, maxLength);
  }

  /**
   * Generate a structured article outline for a given topic.
   */
  async generateOutline(
    topic: string,
    keywords?: string[],
  ): Promise<string> {
    const keywordsText = keywords?.length
      ? `\nIncorporate these keywords naturally: ${keywords.join(', ')}`
      : '';

    const systemPrompt = `You are an experienced content strategist. Create a detailed, well-structured article outline that:
- Includes an engaging introduction section
- Has 4-7 main sections with descriptive headings
- Includes 2-3 sub-points under each main section
- Ends with a conclusion section
- Is optimized for SEO with natural keyword placement
- Follows a logical flow that keeps readers engaged

Use Markdown formatting with ## for main headings and - for sub-points.`;

    const text = await this.callClaude(
      systemPrompt,
      `Create a detailed article outline for the topic: "${topic}"${keywordsText}`,
    );

    return text.trim();
  }

  /**
   * Analyze blog content for readability, SEO, sentiment, and provide suggestions.
   */
  async analyzeContent(content: string): Promise<ContentAnalysis> {
    // Calculate basic metrics locally (more reliable than AI for these)
    const wordCount = this.countWords(content);
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 238)); // Average reading speed

    const systemPrompt = `You are a content analysis expert. Analyze the given blog content and return a JSON object with the following fields:
- readabilityScore: number from 0-100 (100 = very easy to read, similar to Flesch reading ease)
- sentimentScore: number from -1 to 1 (-1 = very negative, 0 = neutral, 1 = very positive)
- keyTopics: array of 3-7 key topics/keywords found in the content
- seoScore: number from 0-100 based on SEO best practices (heading structure, keyword density, content length, etc.)
- suggestions: array of 3-6 specific, actionable improvement suggestions

Evaluate SEO based on:
- Content length (ideal: 1500+ words)
- Heading structure (H2, H3 usage)
- Keyword density and natural placement
- Paragraph length variety
- Use of transition words
- Internal/external link mentions

Return ONLY the JSON object, no markdown formatting, no code blocks.`;

    const text = await this.callClaude(
      systemPrompt,
      `Analyze this blog content:\n\n${this.truncateContent(content, 6000)}`,
    );

    try {
      // Parse the AI response, stripping any markdown code fences
      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const aiAnalysis = JSON.parse(cleanedText);

      return {
        readabilityScore: this.clamp(Number(aiAnalysis.readabilityScore) || 50, 0, 100),
        wordCount,
        estimatedReadTime,
        sentimentScore: this.clamp(Number(aiAnalysis.sentimentScore) || 0, -1, 1),
        keyTopics: Array.isArray(aiAnalysis.keyTopics)
          ? aiAnalysis.keyTopics.slice(0, 7)
          : [],
        seoScore: this.clamp(Number(aiAnalysis.seoScore) || 50, 0, 100),
        suggestions: Array.isArray(aiAnalysis.suggestions)
          ? aiAnalysis.suggestions.slice(0, 6)
          : [],
      };
    } catch (parseError) {
      this.logger.warn('Failed to parse AI content analysis response, returning defaults');

      // Return sensible defaults based on local analysis
      return {
        readabilityScore: this.estimateReadability(content),
        wordCount,
        estimatedReadTime,
        sentimentScore: 0,
        keyTopics: [],
        seoScore: this.estimateSeoScore(content, wordCount),
        suggestions: this.generateFallbackSuggestions(content, wordCount),
      };
    }
  }

  /**
   * Suggest related topics based on the content.
   */
  async suggestRelatedTopics(content: string): Promise<string[]> {
    const systemPrompt = `You are a content strategist. Suggest related topics that would complement the given content. Each topic should:
- Be a potential title for a related article
- Appeal to the same target audience
- Cover a different but related angle
- Be specific enough to write about

Return exactly 5 related topic suggestions, one per line, without numbering or bullet points.`;

    const text = await this.callClaude(
      systemPrompt,
      `Suggest 5 related topics for content about:\n\n${this.truncateContent(content, 3000)}`,
    );

    const topics = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length < 200);

    return topics.slice(0, 5);
  }

  /**
   * Generate accessible alt text for an image based on its description.
   */
  async generateAltText(imageDescription: string): Promise<string> {
    const systemPrompt = `You are an accessibility expert. Generate concise, descriptive alt text for an image. The alt text should:
- Be between 50-125 characters
- Describe the image content accurately
- Be useful for screen reader users
- Not start with "Image of" or "Picture of"
- Convey the meaning and context of the image

Return only the alt text, nothing else.`;

    const text = await this.callClaude(
      systemPrompt,
      `Generate alt text for this image: ${imageDescription}`,
    );

    return text.trim().slice(0, 125);
  }

  /**
   * Improve a paragraph of text in a specified tone.
   */
  async improveParagraph(
    text: string,
    tone: WritingTone = WritingTone.PROFESSIONAL,
  ): Promise<string> {
    const toneDescriptions: Record<WritingTone, string> = {
      [WritingTone.PROFESSIONAL]:
        'professional, polished, and authoritative while remaining approachable',
      [WritingTone.CASUAL]:
        'conversational, friendly, and engaging while still being informative',
      [WritingTone.TECHNICAL]:
        'precise, detailed, and technically accurate with appropriate terminology',
    };

    const systemPrompt = `You are an expert editor. Improve the given text to be ${toneDescriptions[tone]}. Your improvements should:
- Fix any grammar or spelling issues
- Improve sentence structure and flow
- Enhance clarity and readability
- Maintain the original meaning and key points
- Make it more engaging for the reader

Return only the improved text, nothing else. Do not add explanations or notes.`;

    const improved = await this.callClaude(
      systemPrompt,
      `Improve this text:\n\n${text}`,
    );

    return improved.trim();
  }

  // ─── Private Methods ──────────────────────────────────────────────────────

  /**
   * Call the Claude API with error handling and rate limit awareness.
   */
  private async callClaude(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    try {
      const response = await this.getClient().messages.create({
        model: this.model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      // Extract text from the response
      const textBlock = response.content.find(
        (block) => block.type === 'text',
      );

      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      return textBlock.text;
    } catch (error: unknown) {
      // Handle rate limiting
      if (this.isRateLimitError(error)) {
        this.logger.warn('Anthropic API rate limit reached');
        throw new ServiceUnavailableException(
          'AI service is currently busy. Please try again in a few moments.',
        );
      }

      // Handle authentication errors
      if (this.isAuthenticationError(error)) {
        this.logger.error('Anthropic API authentication failed');
        throw new ServiceUnavailableException(
          'AI service configuration error. Please contact the administrator.',
        );
      }

      // Handle other API errors
      if (error instanceof Error) {
        this.logger.error(`Anthropic API error: ${error.message}`);
      }

      throw new InternalServerErrorException(
        'An error occurred while processing your AI request. Please try again.',
      );
    }
  }

  /**
   * Truncate content to a maximum number of characters to stay within token limits.
   */
  private truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }
    return content.slice(0, maxChars) + '\n\n[Content truncated for analysis]';
  }

  /**
   * Clamp a number between a minimum and maximum value.
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Count words in a string of text.
   */
  private countWords(text: string): number {
    return text
      .replace(/<[^>]*>/g, ' ') // Strip HTML tags
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((word) => word.length > 0).length;
  }

  /**
   * Estimate readability score based on sentence and word length (fallback).
   */
  private estimateReadability(content: string): number {
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = plainText.split(/\s+/).filter((w) => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 50;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord =
      words.reduce((sum, word) => sum + this.countSyllables(word), 0) /
      words.length;

    // Simplified Flesch Reading Ease formula
    const score =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    return this.clamp(Math.round(score), 0, 100);
  }

  /**
   * Rough syllable count for a word.
   */
  private countSyllables(word: string): number {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length <= 3) return 1;

    const vowelGroups = cleaned.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;

    // Adjust for common patterns
    if (cleaned.endsWith('e') && !cleaned.endsWith('le')) {
      count = Math.max(1, count - 1);
    }

    return Math.max(1, count);
  }

  /**
   * Estimate SEO score based on content analysis (fallback).
   */
  private estimateSeoScore(content: string, wordCount: number): number {
    let score = 50;

    // Word count scoring
    if (wordCount >= 1500) score += 15;
    else if (wordCount >= 800) score += 10;
    else if (wordCount >= 300) score += 5;

    // Check for heading structure
    if (content.includes('<h2') || content.includes('## ')) score += 10;
    if (content.includes('<h3') || content.includes('### ')) score += 5;

    // Check for links
    if (content.includes('<a ') || content.includes('](')) score += 5;

    // Check for images
    if (content.includes('<img') || content.includes('![')) score += 5;

    // Check for paragraphs (content structure)
    const paragraphs = content.split(/<\/p>|(?:\r?\n){2,}/).length;
    if (paragraphs >= 5) score += 5;

    return this.clamp(score, 0, 100);
  }

  /**
   * Generate fallback suggestions when AI analysis fails.
   */
  private generateFallbackSuggestions(
    content: string,
    wordCount: number,
  ): string[] {
    const suggestions: string[] = [];

    if (wordCount < 300) {
      suggestions.push(
        'Content is very short. Aim for at least 800 words for better SEO performance.',
      );
    } else if (wordCount < 800) {
      suggestions.push(
        'Consider expanding the content to 1500+ words for improved search rankings.',
      );
    }

    if (!content.includes('<h2') && !content.includes('## ')) {
      suggestions.push(
        'Add H2 headings to improve content structure and SEO.',
      );
    }

    if (!content.includes('<a ') && !content.includes('](')) {
      suggestions.push(
        'Include internal and external links to improve SEO and provide additional value.',
      );
    }

    if (!content.includes('<img') && !content.includes('![')) {
      suggestions.push(
        'Add images with descriptive alt text to improve engagement and accessibility.',
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'Review the content for opportunities to add more specific examples and data.',
      );
    }

    return suggestions;
  }

  /**
   * Check if the error is a rate limit error from the Anthropic API.
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status === 429;
    }
    return false;
  }

  /**
   * Check if the error is an authentication error from the Anthropic API.
   */
  private isAuthenticationError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status === 401;
    }
    return false;
  }
}
