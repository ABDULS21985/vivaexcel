export enum TrafficSource {
  DIRECT = 'DIRECT',
  SEARCH = 'SEARCH',
  CATEGORY = 'CATEGORY',
  RECOMMENDATION = 'RECOMMENDATION',
  EXTERNAL = 'EXTERNAL',
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
}

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
}

export enum ConversionEventType {
  VIEW = 'VIEW',
  ADD_TO_CART = 'ADD_TO_CART',
  CHECKOUT_STARTED = 'CHECKOUT_STARTED',
  CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
  DOWNLOAD = 'DOWNLOAD',
  REVIEW_WRITTEN = 'REVIEW_WRITTEN',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
}

export enum AnalyticsScope {
  PLATFORM = 'PLATFORM',
  SELLER = 'SELLER',
  PRODUCT = 'PRODUCT',
}

export enum AnalyticsPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  ONE_YEAR = '1y',
  CUSTOM = 'custom',
}

export enum ReportGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}
