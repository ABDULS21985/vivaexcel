import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { RedisService } from '../../../shared/redis/redis.service';
import {
  ChatConversation,
  ChatMessage,
  ChatMessageRole,
  AssistantAction,
  AssistantActionType,
} from '../entities/chat-conversation.entity';
import {
  DigitalProduct,
  DigitalProductStatus,
} from '../../../entities/digital-product.entity';
import {
  SendMessageDto,
  ChatResponseDto,
  ProactiveSuggestionResponseDto,
} from '../dto/chat.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AIAssistantService {
  private readonly logger = new Logger(AIAssistantService.name);
  private readonly client: Anthropic | null;
  private readonly model = 'claude-sonnet-4-5-20250929';
  private readonly RATE_LIMIT_TTL = 5; // seconds
  private readonly MAX_CONVERSATION_HISTORY = 20; // max messages to send to Claude

  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepository: Repository<ChatConversation>,
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY is not configured. AI Assistant features will be unavailable.',
      );
      this.client = null;
    } else {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Process an incoming chat message and return the AI assistant's response.
   */
  async processMessage(
    dto: SendMessageDto,
    userId?: string,
  ): Promise<ChatResponseDto> {
    // Rate limit check
    const rateLimitKey = userId
      ? `ai-assistant:rate:${userId}`
      : `ai-assistant:rate:session:${dto.sessionId || 'anonymous'}`;

    const isRateLimited = await this.redisService.get(rateLimitKey);
    if (isRateLimited) {
      throw new BadRequestException(
        'Please wait a few seconds before sending another message.',
      );
    }

    // Set rate limit
    await this.redisService.set(rateLimitKey, '1', this.RATE_LIMIT_TTL);

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(
      dto.conversationId,
      dto.sessionId,
      userId,
    );

    // Update context if provided
    if (dto.context) {
      conversation.context = {
        ...conversation.context,
        ...dto.context,
      };
    }

    // Add user message to conversation
    const userMessage: ChatMessage = {
      role: ChatMessageRole.USER,
      content: dto.message,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(userMessage);

    // Build context for the AI
    const systemPrompt = await this.buildSystemPrompt(conversation);
    const messagesToSend = this.buildMessageHistory(conversation.messages);

    // Call Claude
    let aiResponseText: string;
    try {
      aiResponseText = await this.callClaude(systemPrompt, messagesToSend);
    } catch (error) {
      // Remove rate limit on failure so user can retry
      await this.redisService.del(rateLimitKey);
      throw error;
    }

    // Parse the structured response
    const parsedResponse = this.parseAIResponse(aiResponseText);

    // Enrich actions with real product data if needed
    const enrichedActions = await this.enrichActions(parsedResponse.actions);

    // Add assistant message to conversation
    const assistantMessage: ChatMessage = {
      role: ChatMessageRole.ASSISTANT,
      content: parsedResponse.message,
      timestamp: new Date().toISOString(),
      actions: enrichedActions,
    };
    conversation.messages.push(assistantMessage);

    // Update conversation metadata
    conversation.messageCount = conversation.messages.length;
    conversation.lastMessageAt = new Date();

    // Save conversation
    await this.conversationRepository.save(conversation);

    return {
      conversationId: conversation.id,
      message: parsedResponse.message,
      actions: enrichedActions,
      suggestions: parsedResponse.suggestions,
    };
  }

  /**
   * Fetch a conversation by ID with all messages.
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID "${conversationId}" not found.`,
      );
    }

    return conversation;
  }

  /**
   * Get proactive suggestions based on the page context.
   */
  async getProactiveSuggestions(
    page: string,
    productId?: string,
  ): Promise<ProactiveSuggestionResponseDto> {
    const normalizedPage = page.toLowerCase().trim();

    // Home page
    if (normalizedPage === '/' || normalizedPage === '/home') {
      return {
        greeting: 'Welcome to VivaExcel! How can I help you today?',
        suggestions: [
          'What are your best-selling templates?',
          'I need a professional PowerPoint template',
          'Show me templates under $20',
          'What product types do you offer?',
        ],
      };
    }

    // Store / browse page
    if (
      normalizedPage.startsWith('/store') ||
      normalizedPage.startsWith('/browse')
    ) {
      return {
        greeting: 'Looking for something specific? I can help you find it!',
        suggestions: [
          'Help me find the right template for my project',
          'What are the most popular products?',
          'Compare your top PowerPoint templates',
          'Show me products with the best reviews',
        ],
      };
    }

    // Product detail page
    if (productId) {
      const product = await this.productRepository.findOne({
        where: { id: productId, status: DigitalProductStatus.PUBLISHED },
      });

      if (product) {
        return {
          greeting: `I see you're looking at "${product.title}". Need any help?`,
          suggestions: [
            `Tell me more about "${product.title}"`,
            'Are there similar products I should consider?',
            'Is this product good for beginners?',
            `What's included in this ${product.type.replace('_', ' ')}?`,
          ],
        };
      }
    }

    // Cart / checkout page
    if (
      normalizedPage.startsWith('/cart') ||
      normalizedPage.startsWith('/checkout')
    ) {
      return {
        greeting: 'Ready to check out? Let me know if you need anything!',
        suggestions: [
          'Do you have any active coupons?',
          'Can you recommend add-ons for my cart?',
          'What payment methods do you accept?',
          'How does the download process work?',
        ],
      };
    }

    // Category pages
    if (normalizedPage.includes('category') || normalizedPage.includes('type')) {
      return {
        greeting: 'Browsing by category? I can help narrow down your choices!',
        suggestions: [
          'What are the top picks in this category?',
          'Help me choose between these options',
          'Show me the newest additions',
          'Which products have the best ratings?',
        ],
      };
    }

    // Default suggestions
    return {
      greeting: 'Hi there! I\'m your VivaExcel assistant. How can I help?',
      suggestions: [
        'What products do you offer?',
        'Help me find a template for my needs',
        'Tell me about your best-selling products',
        'How do digital downloads work?',
      ],
    };
  }

  /**
   * List a user's past conversations.
   */
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { lastMessageAt: 'DESC' },
      select: [
        'id',
        'sessionId',
        'isActive',
        'messageCount',
        'lastMessageAt',
        'createdAt',
        'context',
      ],
    });
  }

  // ─── Private Methods ──────────────────────────────────────────────────────

  /**
   * Get an existing conversation or create a new one.
   */
  private async getOrCreateConversation(
    conversationId?: string,
    sessionId?: string,
    userId?: string,
  ): Promise<ChatConversation> {
    // Try to find existing conversation by ID
    if (conversationId) {
      const existing = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });
      if (existing) {
        // Associate userId if it was previously a guest conversation
        if (userId && !existing.userId) {
          existing.userId = userId;
        }
        return existing;
      }
    }

    // Try to find an active conversation for the session
    if (sessionId) {
      const existing = await this.conversationRepository.findOne({
        where: { sessionId, isActive: true },
        order: { createdAt: 'DESC' },
      });
      if (existing) {
        if (userId && !existing.userId) {
          existing.userId = userId;
        }
        return existing;
      }
    }

    // Create a new conversation
    const resolvedSessionId = sessionId || uuidv4();
    const conversation = this.conversationRepository.create({
      userId,
      sessionId: resolvedSessionId,
      messages: [],
      isActive: true,
      messageCount: 0,
    });

    return this.conversationRepository.save(conversation);
  }

  /**
   * Build the system prompt with marketplace context and instructions.
   */
  private async buildSystemPrompt(
    conversation: ChatConversation,
  ): Promise<string> {
    let productContext = '';

    // If there's a current product in context, fetch its details
    if (conversation.context?.currentProductId) {
      const product = await this.productRepository.findOne({
        where: { id: conversation.context.currentProductId },
      });
      if (product) {
        productContext = `
CURRENT PRODUCT BEING VIEWED:
- Title: ${product.title}
- Type: ${product.type}
- Price: $${product.price} ${product.currency}${product.compareAtPrice ? ` (was $${product.compareAtPrice})` : ''}
- Rating: ${product.averageRating}/5 (${product.totalReviews} reviews)
- Description: ${product.shortDescription || product.description?.slice(0, 300) || 'N/A'}
- Slug: ${product.slug}
`;
      }
    }

    // Fetch featured and popular products for recommendations
    const featuredProducts = await this.productRepository.find({
      where: { status: DigitalProductStatus.PUBLISHED, isFeatured: true },
      take: 6,
      select: ['id', 'title', 'type', 'price', 'currency', 'averageRating', 'slug', 'shortDescription'],
      order: { averageRating: 'DESC' },
    });

    let catalogSummary = '';
    if (featuredProducts.length > 0) {
      catalogSummary = `
FEATURED PRODUCTS IN CATALOG:
${featuredProducts.map((p) => `- "${p.title}" (ID: ${p.id}) — ${p.type}, $${p.price} ${p.currency}, Rating: ${p.averageRating}/5`).join('\n')}
`;
    }

    const currentPage = conversation.context?.currentPage || 'unknown';
    const cartItems = conversation.context?.cartItems || [];

    return `You are VivaExcel's AI Shopping Assistant — a friendly, knowledgeable, and concise helper for a digital products marketplace.

ABOUT VIVAEXCEL:
VivaExcel is a premium digital products marketplace specializing in:
- PowerPoint templates and presentation decks
- Excel spreadsheets and Google Sheets templates
- Document templates (Word, PDF)
- Web templates and design systems
- Startup kits and business tools
- Code templates and development resources
- Solution templates for specific business needs

All products are digital downloads delivered instantly after purchase.

YOUR ROLE:
- Help users find the right digital products for their needs
- Answer questions about products, pricing, and features
- Provide comparisons and recommendations
- Guide users through the marketplace
- Be helpful, concise, and professional
- Always be honest — if you don't know something, say so

USER'S CURRENT CONTEXT:
- Current page: ${currentPage}
- Items in cart: ${cartItems.length > 0 ? cartItems.join(', ') : 'none'}
${productContext}
${catalogSummary}

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown formatting, no code fences, no extra text. Return exactly this structure:
{
  "message": "Your helpful response text here",
  "actions": [
    {
      "type": "action_type",
      "payload": { ... }
    }
  ],
  "suggestions": ["Quick reply 1", "Quick reply 2", "Quick reply 3"]
}

AVAILABLE ACTION TYPES:
1. "plain_text" — No special action, just a text response. payload: {}
2. "show_products" — Show product cards to the user. payload: { "productIds": ["uuid1", "uuid2"], "reason": "why these products" }
3. "navigate" — Suggest the user navigate to a page. payload: { "url": "/store?type=powerpoint", "label": "Browse PowerPoint Templates" }
4. "add_to_cart" — Suggest adding a product to cart. payload: { "productId": "uuid", "productTitle": "Product Name" }
5. "compare" — Compare multiple products. payload: { "productIds": ["uuid1", "uuid2"], "criteria": ["price", "rating", "features"] }
6. "apply_coupon" — Suggest applying a coupon code. payload: { "code": "COUPON_CODE", "description": "Coupon description" }

RULES FOR ACTIONS:
- Use "show_products" when recommending or showing specific products — always include real product IDs from the catalog above
- Use "navigate" to direct users to relevant pages (e.g., /store, /store?type=powerpoint, /store?type=document)
- Use "add_to_cart" only when the user clearly wants to purchase a specific product
- Use "compare" when the user wants to compare options
- You can include multiple actions in a single response
- If no special action is needed, use a single "plain_text" action or an empty actions array

RULES FOR SUGGESTIONS:
- Always return 2-4 quick reply suggestions that make sense as follow-up questions
- Suggestions should be short (under 60 characters) and conversational
- Tailor suggestions to the current conversation flow and context

IMPORTANT:
- Keep responses concise (2-4 sentences for most answers)
- If you reference specific products, use the actual product data provided in context
- Do not make up product names, prices, or IDs — only use real data from the catalog
- If the user asks about something you have no data for, offer to help them browse the store
- Be warm and professional — you represent the VivaExcel brand`;
  }

  /**
   * Build message history from conversation, trimming to the most recent messages.
   */
  private buildMessageHistory(
    messages: ChatMessage[],
  ): { role: string; content: string }[] {
    // Only send the most recent messages to stay within token limits
    const recentMessages = messages.slice(-this.MAX_CONVERSATION_HISTORY);

    return recentMessages
      .filter((m) => m.role !== ChatMessageRole.SYSTEM)
      .map((m) => ({
        role: m.role === ChatMessageRole.USER ? 'user' : 'assistant',
        content:
          m.role === ChatMessageRole.ASSISTANT
            ? // For assistant messages, send the text content only (not the raw JSON)
              m.content
            : m.content,
      }));
  }

  /**
   * Call the Claude API with conversation history.
   */
  private async callClaude(
    systemPrompt: string,
    messages: { role: string; content: string }[],
  ): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI features are not configured. Please set the ANTHROPIC_API_KEY environment variable.',
      );
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const textBlock = response.content.find(
        (block: any) => block.type === 'text',
      );

      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      return textBlock.text;
    } catch (error: unknown) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle rate limiting from Anthropic
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 429) {
          this.logger.warn('Anthropic API rate limit reached');
          throw new ServiceUnavailableException(
            'AI service is currently busy. Please try again in a few moments.',
          );
        }
        if (status === 401) {
          this.logger.error('Anthropic API authentication failed');
          throw new ServiceUnavailableException(
            'AI service configuration error. Please contact the administrator.',
          );
        }
      }

      if (error instanceof Error) {
        this.logger.error(`Anthropic API error: ${error.message}`);
      }

      throw new InternalServerErrorException(
        'An error occurred while processing your request. Please try again.',
      );
    }
  }

  /**
   * Parse the AI response JSON and extract structured data.
   */
  private parseAIResponse(responseText: string): {
    message: string;
    actions: AssistantAction[];
    suggestions: string[];
  } {
    try {
      // Strip any markdown code fences the model might add
      const cleaned = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      const message =
        typeof parsed.message === 'string'
          ? parsed.message
          : 'I apologize, but I had trouble processing that. Could you please rephrase?';

      const actions: AssistantAction[] = Array.isArray(parsed.actions)
        ? parsed.actions
            .filter(
              (a: any) =>
                a &&
                typeof a.type === 'string' &&
                Object.values(AssistantActionType).includes(a.type),
            )
            .map((a: any) => ({
              type: a.type as AssistantActionType,
              payload: a.payload && typeof a.payload === 'object' ? a.payload : {},
            }))
        : [];

      const suggestions: string[] = Array.isArray(parsed.suggestions)
        ? parsed.suggestions
            .filter((s: any) => typeof s === 'string' && s.length > 0)
            .slice(0, 4)
        : ['Tell me more', 'Show popular products', 'Help me find a template'];

      return { message, actions, suggestions };
    } catch (parseError) {
      this.logger.warn(
        'Failed to parse AI response as JSON, returning raw text as message',
      );

      // Fallback: use the raw text as the message
      return {
        message:
          responseText.length > 0
            ? responseText
            : 'I apologize, but I had trouble processing that. Could you please try again?',
        actions: [],
        suggestions: [
          'Tell me more',
          'Show popular products',
          'Help me find a template',
        ],
      };
    }
  }

  /**
   * Enrich actions with real product data from the database.
   */
  private async enrichActions(
    actions: AssistantAction[],
  ): Promise<AssistantAction[]> {
    const enriched: AssistantAction[] = [];

    for (const action of actions) {
      if (
        action.type === AssistantActionType.SHOW_PRODUCTS &&
        Array.isArray(action.payload?.productIds)
      ) {
        const products = await this.productRepository.find({
          where: action.payload.productIds.map((id: string) => ({
            id,
            status: DigitalProductStatus.PUBLISHED,
          })),
          select: [
            'id',
            'title',
            'slug',
            'type',
            'price',
            'compareAtPrice',
            'currency',
            'featuredImage',
            'averageRating',
            'totalReviews',
            'shortDescription',
          ],
        });

        enriched.push({
          type: action.type,
          payload: {
            ...action.payload,
            products: products.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              type: p.type,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              currency: p.currency,
              featuredImage: p.featuredImage,
              averageRating: p.averageRating,
              totalReviews: p.totalReviews,
              shortDescription: p.shortDescription,
            })),
          },
        });
      } else if (
        action.type === AssistantActionType.ADD_TO_CART &&
        action.payload?.productId
      ) {
        const product = await this.productRepository.findOne({
          where: {
            id: action.payload.productId,
            status: DigitalProductStatus.PUBLISHED,
          },
          select: [
            'id',
            'title',
            'slug',
            'price',
            'currency',
            'featuredImage',
          ],
        });

        if (product) {
          enriched.push({
            type: action.type,
            payload: {
              ...action.payload,
              product: {
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                currency: product.currency,
                featuredImage: product.featuredImage,
              },
            },
          });
        } else {
          enriched.push(action);
        }
      } else if (
        action.type === AssistantActionType.COMPARE &&
        Array.isArray(action.payload?.productIds)
      ) {
        const products = await this.productRepository.find({
          where: action.payload.productIds.map((id: string) => ({
            id,
            status: DigitalProductStatus.PUBLISHED,
          })),
          select: [
            'id',
            'title',
            'slug',
            'type',
            'price',
            'compareAtPrice',
            'currency',
            'featuredImage',
            'averageRating',
            'totalReviews',
            'shortDescription',
          ],
        });

        enriched.push({
          type: action.type,
          payload: {
            ...action.payload,
            products: products.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              type: p.type,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              currency: p.currency,
              featuredImage: p.featuredImage,
              averageRating: p.averageRating,
              totalReviews: p.totalReviews,
              shortDescription: p.shortDescription,
            })),
          },
        });
      } else {
        enriched.push(action);
      }
    }

    return enriched;
  }
}
