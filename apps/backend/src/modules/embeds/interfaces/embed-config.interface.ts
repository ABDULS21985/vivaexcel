import { EmbedWidgetType, EmbedTheme } from '../enums/embed.enums';

export interface EmbedConfig {
  type: EmbedWidgetType;
  apiKey: string;
  productId?: string;
  productSlug?: string;
  categorySlug?: string;
  count?: number;
  theme?: EmbedTheme;
  accentColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  locale?: string;
}
