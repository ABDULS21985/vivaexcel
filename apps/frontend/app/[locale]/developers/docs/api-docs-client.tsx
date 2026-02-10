"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Key,
  Shield,
  Globe,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Package,
  CreditCard,
  Store,
  Webhook,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Play,
  Loader2,
  ArrowLeft,
  Terminal,
  Send,
  Hash,
  Zap,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge } from "@ktblog/ui/components";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH";
type CodeTab = "curl" | "javascript" | "python";

interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: "path" | "query" | "body";
}

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  params: EndpointParam[];
  exampleRequest: Record<CodeTab, string>;
  exampleResponse: string;
}

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  title: string;
  method?: HttpMethod;
}

// =============================================================================
// Constants
// =============================================================================

const BASE_URL = "https://api.ktblog.com/v1/storefront";

const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string; badge: string }> = {
  GET: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500 text-white",
  },
  POST: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-500 text-white",
  },
  DELETE: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-500 text-white",
  },
  PATCH: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
  },
};

// =============================================================================
// Error Codes Data
// =============================================================================

const ERROR_CODES = [
  { code: "PRODUCT_NOT_FOUND", status: 404, description: "The requested product does not exist or has been removed." },
  { code: "CART_NOT_FOUND", status: 404, description: "The specified cart ID does not exist or has expired." },
  { code: "CART_ITEM_NOT_FOUND", status: 404, description: "The item does not exist in the specified cart." },
  { code: "CART_EMPTY", status: 400, description: "Cannot checkout with an empty cart." },
  { code: "PRODUCT_UNAVAILABLE", status: 400, description: "The product is currently out of stock or unavailable." },
  { code: "VARIANT_NOT_FOUND", status: 404, description: "The specified product variant does not exist." },
  { code: "SELLER_NOT_FOUND", status: 404, description: "The requested seller profile was not found." },
  { code: "STRIPE_NOT_CONFIGURED", status: 500, description: "The seller has not configured Stripe for payments." },
  { code: "CHECKOUT_FAILED", status: 500, description: "The checkout session could not be created. Try again." },
  { code: "RATE_LIMIT_EXCEEDED", status: 429, description: "You have exceeded the rate limit. Wait before retrying." },
  { code: "INVALID_API_KEY", status: 401, description: "The provided API key is invalid, expired, or revoked." },
  { code: "SCOPE_REQUIRED", status: 403, description: "Your API key lacks the required scope for this operation." },
];

// =============================================================================
// Webhook Events Data
// =============================================================================

const WEBHOOK_EVENTS_DATA = [
  { event: "order.created", description: "Fired when a new order is placed through checkout." },
  { event: "order.paid", description: "Fired when payment for an order is confirmed." },
  { event: "order.fulfilled", description: "Fired when the seller marks an order as fulfilled." },
  { event: "order.refunded", description: "Fired when a refund is issued for an order." },
  { event: "product.created", description: "Fired when a new product is published to the store." },
  { event: "product.updated", description: "Fired when product details, pricing, or variants are changed." },
  { event: "product.deleted", description: "Fired when a product is permanently deleted." },
  { event: "review.created", description: "Fired when a customer submits a new product review." },
  { event: "review.updated", description: "Fired when a review is edited by the customer." },
  { event: "subscription.created", description: "Fired when a new subscription is started." },
  { event: "subscription.renewed", description: "Fired when a subscription is successfully renewed." },
  { event: "subscription.cancelled", description: "Fired when a subscription is cancelled." },
];

// =============================================================================
// Endpoints Data
// =============================================================================

const ENDPOINTS: Endpoint[] = [
  // -- Products --
  {
    id: "list-products",
    method: "GET",
    path: "/products",
    title: "List Products",
    description: "Retrieve a paginated list of products. Supports filtering by category, price range, and search terms. Results are sorted by creation date in descending order by default.",
    params: [
      { name: "page", type: "integer", required: false, description: "Page number for pagination (default: 1).", location: "query" },
      { name: "limit", type: "integer", required: false, description: "Number of results per page (default: 20, max: 100).", location: "query" },
      { name: "category", type: "string", required: false, description: "Filter by category slug.", location: "query" },
      { name: "min_price", type: "number", required: false, description: "Minimum price filter in cents.", location: "query" },
      { name: "max_price", type: "number", required: false, description: "Maximum price filter in cents.", location: "query" },
      { name: "sort", type: "string", required: false, description: "Sort order: 'newest', 'price_asc', 'price_desc', 'popular'.", location: "query" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/products?page=1&limit=10&category=templates" \\
  -H "Authorization: Bearer kt_live_xxxxx" \\
  -H "Content-Type: application/json"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/products?page=1&limit=10&category=templates',
  {
    headers: {
      'Authorization': 'Bearer kt_live_xxxxx',
      'Content-Type': 'application/json',
    },
  }
);

const data = await response.json();
console.log(data.products);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/products',
    params={'page': 1, 'limit': 10, 'category': 'templates'},
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

data = response.json()
print(data['products'])`,
    },
    exampleResponse: JSON.stringify({
      data: {
        products: [
          {
            id: "prod_abc123",
            name: "Excel Dashboard Template",
            slug: "excel-dashboard-template",
            description: "Professional dashboard template with charts and KPIs.",
            price: 2999,
            currency: "USD",
            category: { id: "cat_1", slug: "templates", name: "Templates" },
            images: ["https://cdn.ktblog.com/products/img1.png"],
            seller: { id: "seller_1", name: "ProSheets", avatar: null },
            rating: 4.8,
            reviewCount: 124,
            createdAt: "2025-01-15T10:30:00Z",
          },
        ],
        pagination: { page: 1, limit: 10, total: 156, totalPages: 16 },
      },
    }, null, 2),
  },
  {
    id: "get-product",
    method: "GET",
    path: "/products/:id",
    title: "Get Product",
    description: "Retrieve detailed information about a single product, including all variants, images, description, pricing, and seller information.",
    params: [
      { name: "id", type: "string", required: true, description: "Product ID or slug.", location: "path" },
      { name: "include", type: "string", required: false, description: "Comma-separated list of related resources to include: 'reviews', 'seller', 'variants'.", location: "query" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/products/prod_abc123?include=reviews,variants" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/products/prod_abc123?include=reviews,variants',
  {
    headers: {
      'Authorization': 'Bearer kt_live_xxxxx',
    },
  }
);

const { data } = await response.json();
console.log(data.product);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/products/prod_abc123',
    params={'include': 'reviews,variants'},
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

product = response.json()['data']['product']
print(product)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        product: {
          id: "prod_abc123",
          name: "Excel Dashboard Template",
          slug: "excel-dashboard-template",
          description: "Professional dashboard template with charts and KPIs.",
          longDescription: "A comprehensive Excel dashboard template featuring...",
          price: 2999,
          compareAtPrice: 4999,
          currency: "USD",
          category: { id: "cat_1", slug: "templates", name: "Templates" },
          images: ["https://cdn.ktblog.com/products/img1.png"],
          variants: [
            { id: "var_1", name: "Standard", price: 2999, stock: 999 },
            { id: "var_2", name: "Premium", price: 4999, stock: 999 },
          ],
          seller: { id: "seller_1", name: "ProSheets", verified: true },
          rating: 4.8,
          reviewCount: 124,
          tags: ["excel", "dashboard", "analytics"],
          createdAt: "2025-01-15T10:30:00Z",
        },
      },
    }, null, 2),
  },
  {
    id: "product-reviews",
    method: "GET",
    path: "/products/:id/reviews",
    title: "Product Reviews",
    description: "Retrieve paginated reviews for a specific product. Reviews include star rating, comment text, and author information.",
    params: [
      { name: "id", type: "string", required: true, description: "Product ID.", location: "path" },
      { name: "page", type: "integer", required: false, description: "Page number (default: 1).", location: "query" },
      { name: "limit", type: "integer", required: false, description: "Results per page (default: 10, max: 50).", location: "query" },
      { name: "sort", type: "string", required: false, description: "Sort by: 'newest', 'oldest', 'highest', 'lowest'.", location: "query" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/products/prod_abc123/reviews?page=1&limit=5" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/products/prod_abc123/reviews?page=1&limit=5',
  {
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.reviews);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/products/prod_abc123/reviews',
    params={'page': 1, 'limit': 5},
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

reviews = response.json()['data']['reviews']
print(reviews)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        reviews: [
          {
            id: "rev_1",
            rating: 5,
            title: "Excellent template!",
            comment: "Saved me hours of work. Highly recommended.",
            author: { id: "user_1", name: "John D.", avatar: null },
            createdAt: "2025-02-10T14:22:00Z",
          },
        ],
        pagination: { page: 1, limit: 5, total: 124, totalPages: 25 },
      },
    }, null, 2),
  },
  {
    id: "categories",
    method: "GET",
    path: "/categories",
    title: "Categories",
    description: "List all available product categories. Returns a flat list of categories with their product counts.",
    params: [],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/categories" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch('${BASE_URL}/categories', {
  headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
});

const { data } = await response.json();
console.log(data.categories);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/categories',
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

categories = response.json()['data']['categories']
print(categories)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        categories: [
          { id: "cat_1", slug: "templates", name: "Templates", productCount: 89 },
          { id: "cat_2", slug: "add-ins", name: "Add-ins", productCount: 45 },
          { id: "cat_3", slug: "courses", name: "Courses", productCount: 32 },
          { id: "cat_4", slug: "bundles", name: "Bundles", productCount: 18 },
        ],
      },
    }, null, 2),
  },
  {
    id: "search-products",
    method: "GET",
    path: "/products/search",
    title: "Search Products",
    description: "Full-text search across product names, descriptions, and tags. Returns results ranked by relevance with optional filters.",
    params: [
      { name: "q", type: "string", required: true, description: "Search query string.", location: "query" },
      { name: "category", type: "string", required: false, description: "Filter results by category slug.", location: "query" },
      { name: "page", type: "integer", required: false, description: "Page number (default: 1).", location: "query" },
      { name: "limit", type: "integer", required: false, description: "Results per page (default: 20).", location: "query" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/products/search?q=dashboard&category=templates" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/products/search?q=dashboard&category=templates',
  {
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.products);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/products/search',
    params={'q': 'dashboard', 'category': 'templates'},
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

products = response.json()['data']['products']
print(products)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        products: [
          {
            id: "prod_abc123",
            name: "Excel Dashboard Template",
            price: 2999,
            currency: "USD",
            rating: 4.8,
            relevanceScore: 0.95,
          },
        ],
        pagination: { page: 1, limit: 20, total: 12, totalPages: 1 },
      },
    }, null, 2),
  },
  // -- Cart --
  {
    id: "create-cart",
    method: "POST",
    path: "/cart",
    title: "Create Cart",
    description: "Create a new shopping cart. Returns a cart ID that should be stored client-side and used for subsequent cart operations. Carts expire after 7 days of inactivity.",
    params: [],
    exampleRequest: {
      curl: `curl -X POST "${BASE_URL}/cart" \\
  -H "Authorization: Bearer kt_live_xxxxx" \\
  -H "Content-Type: application/json"`,
      javascript: `const response = await fetch('${BASE_URL}/cart', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer kt_live_xxxxx',
    'Content-Type': 'application/json',
  },
});

const { data } = await response.json();
console.log(data.cart.id); // Store this ID`,
      python: `import requests

response = requests.post(
    '${BASE_URL}/cart',
    headers={
        'Authorization': 'Bearer kt_live_xxxxx',
        'Content-Type': 'application/json',
    }
)

cart = response.json()['data']['cart']
print(cart['id'])  # Store this ID`,
    },
    exampleResponse: JSON.stringify({
      data: {
        cart: {
          id: "cart_xyz789",
          items: [],
          itemCount: 0,
          subtotal: 0,
          currency: "USD",
          createdAt: "2025-03-01T12:00:00Z",
          expiresAt: "2025-03-08T12:00:00Z",
        },
      },
    }, null, 2),
  },
  {
    id: "add-cart-item",
    method: "POST",
    path: "/cart/:cartId/items",
    title: "Add Item to Cart",
    description: "Add a product to an existing cart. If the product is already in the cart, its quantity will be incremented. Specify a variant ID for products with multiple variants.",
    params: [
      { name: "cartId", type: "string", required: true, description: "Cart ID.", location: "path" },
      { name: "productId", type: "string", required: true, description: "Product ID to add.", location: "body" },
      { name: "variantId", type: "string", required: false, description: "Variant ID (required for multi-variant products).", location: "body" },
      { name: "quantity", type: "integer", required: false, description: "Quantity to add (default: 1).", location: "body" },
    ],
    exampleRequest: {
      curl: `curl -X POST "${BASE_URL}/cart/cart_xyz789/items" \\
  -H "Authorization: Bearer kt_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"productId": "prod_abc123", "variantId": "var_1", "quantity": 1}'`,
      javascript: `const response = await fetch(
  '${BASE_URL}/cart/cart_xyz789/items',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer kt_live_xxxxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId: 'prod_abc123',
      variantId: 'var_1',
      quantity: 1,
    }),
  }
);

const { data } = await response.json();
console.log(data.cart);`,
      python: `import requests

response = requests.post(
    '${BASE_URL}/cart/cart_xyz789/items',
    json={
        'productId': 'prod_abc123',
        'variantId': 'var_1',
        'quantity': 1,
    },
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

cart = response.json()['data']['cart']
print(cart)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        cart: {
          id: "cart_xyz789",
          items: [
            {
              id: "item_1",
              productId: "prod_abc123",
              variantId: "var_1",
              name: "Excel Dashboard Template - Standard",
              price: 2999,
              quantity: 1,
              subtotal: 2999,
            },
          ],
          itemCount: 1,
          subtotal: 2999,
          currency: "USD",
        },
      },
    }, null, 2),
  },
  {
    id: "remove-cart-item",
    method: "DELETE",
    path: "/cart/:cartId/items/:itemId",
    title: "Remove Item from Cart",
    description: "Remove a specific item from the cart. Returns the updated cart object.",
    params: [
      { name: "cartId", type: "string", required: true, description: "Cart ID.", location: "path" },
      { name: "itemId", type: "string", required: true, description: "Cart item ID to remove.", location: "path" },
    ],
    exampleRequest: {
      curl: `curl -X DELETE "${BASE_URL}/cart/cart_xyz789/items/item_1" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/cart/cart_xyz789/items/item_1',
  {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.cart);`,
      python: `import requests

response = requests.delete(
    '${BASE_URL}/cart/cart_xyz789/items/item_1',
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

cart = response.json()['data']['cart']
print(cart)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        cart: {
          id: "cart_xyz789",
          items: [],
          itemCount: 0,
          subtotal: 0,
          currency: "USD",
        },
      },
    }, null, 2),
  },
  {
    id: "get-cart",
    method: "GET",
    path: "/cart/:cartId",
    title: "Get Cart",
    description: "Retrieve the current state of a cart including all items, quantities, and pricing.",
    params: [
      { name: "cartId", type: "string", required: true, description: "Cart ID.", location: "path" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/cart/cart_xyz789" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/cart/cart_xyz789',
  {
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.cart);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/cart/cart_xyz789',
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

cart = response.json()['data']['cart']
print(cart)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        cart: {
          id: "cart_xyz789",
          items: [
            {
              id: "item_1",
              productId: "prod_abc123",
              variantId: "var_1",
              name: "Excel Dashboard Template - Standard",
              price: 2999,
              quantity: 2,
              subtotal: 5998,
            },
          ],
          itemCount: 2,
          subtotal: 5998,
          currency: "USD",
          createdAt: "2025-03-01T12:00:00Z",
          expiresAt: "2025-03-08T12:00:00Z",
        },
      },
    }, null, 2),
  },
  // -- Checkout --
  {
    id: "create-checkout",
    method: "POST",
    path: "/checkout",
    title: "Create Checkout Session",
    description: "Create a Stripe checkout session for the given cart. Returns a redirect URL where the customer completes payment. The cart must have at least one item.",
    params: [
      { name: "cartId", type: "string", required: true, description: "Cart ID to checkout.", location: "body" },
      { name: "successUrl", type: "string", required: true, description: "URL to redirect after successful payment.", location: "body" },
      { name: "cancelUrl", type: "string", required: true, description: "URL to redirect if payment is cancelled.", location: "body" },
      { name: "customerEmail", type: "string", required: false, description: "Pre-fill the customer email on the checkout page.", location: "body" },
    ],
    exampleRequest: {
      curl: `curl -X POST "${BASE_URL}/checkout" \\
  -H "Authorization: Bearer kt_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cartId": "cart_xyz789",
    "successUrl": "https://yoursite.com/success",
    "cancelUrl": "https://yoursite.com/cancel",
    "customerEmail": "customer@example.com"
  }'`,
      javascript: `const response = await fetch('${BASE_URL}/checkout', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer kt_live_xxxxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cartId: 'cart_xyz789',
    successUrl: 'https://yoursite.com/success',
    cancelUrl: 'https://yoursite.com/cancel',
    customerEmail: 'customer@example.com',
  }),
});

const { data } = await response.json();
// Redirect customer to Stripe checkout
window.location.href = data.checkoutUrl;`,
      python: `import requests

response = requests.post(
    '${BASE_URL}/checkout',
    json={
        'cartId': 'cart_xyz789',
        'successUrl': 'https://yoursite.com/success',
        'cancelUrl': 'https://yoursite.com/cancel',
        'customerEmail': 'customer@example.com',
    },
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

checkout_url = response.json()['data']['checkoutUrl']
print(f'Redirect to: {checkout_url}')`,
    },
    exampleResponse: JSON.stringify({
      data: {
        sessionId: "cs_live_abc123",
        checkoutUrl: "https://checkout.stripe.com/c/pay/cs_live_abc123",
        expiresAt: "2025-03-01T13:00:00Z",
      },
    }, null, 2),
  },
  // -- Sellers --
  {
    id: "get-seller",
    method: "GET",
    path: "/sellers/:id",
    title: "Get Seller",
    description: "Retrieve public profile information for a seller, including bio, avatar, total products, and aggregate ratings.",
    params: [
      { name: "id", type: "string", required: true, description: "Seller ID or username.", location: "path" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/sellers/seller_1" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/sellers/seller_1',
  {
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.seller);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/sellers/seller_1',
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

seller = response.json()['data']['seller']
print(seller)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        seller: {
          id: "seller_1",
          username: "prosheets",
          name: "ProSheets",
          bio: "Professional Excel templates and tools for businesses.",
          avatar: "https://cdn.ktblog.com/avatars/seller_1.png",
          verified: true,
          productCount: 24,
          totalSales: 1580,
          averageRating: 4.7,
          joinedAt: "2024-06-15T00:00:00Z",
        },
      },
    }, null, 2),
  },
  {
    id: "seller-products",
    method: "GET",
    path: "/sellers/:id/products",
    title: "Seller Products",
    description: "List all products published by a specific seller. Supports pagination and sorting.",
    params: [
      { name: "id", type: "string", required: true, description: "Seller ID.", location: "path" },
      { name: "page", type: "integer", required: false, description: "Page number (default: 1).", location: "query" },
      { name: "limit", type: "integer", required: false, description: "Results per page (default: 20).", location: "query" },
      { name: "sort", type: "string", required: false, description: "Sort: 'newest', 'popular', 'price_asc', 'price_desc'.", location: "query" },
    ],
    exampleRequest: {
      curl: `curl -X GET "${BASE_URL}/sellers/seller_1/products?page=1&limit=10" \\
  -H "Authorization: Bearer kt_live_xxxxx"`,
      javascript: `const response = await fetch(
  '${BASE_URL}/sellers/seller_1/products?page=1&limit=10',
  {
    headers: { 'Authorization': 'Bearer kt_live_xxxxx' },
  }
);

const { data } = await response.json();
console.log(data.products);`,
      python: `import requests

response = requests.get(
    '${BASE_URL}/sellers/seller_1/products',
    params={'page': 1, 'limit': 10},
    headers={'Authorization': 'Bearer kt_live_xxxxx'}
)

products = response.json()['data']['products']
print(products)`,
    },
    exampleResponse: JSON.stringify({
      data: {
        products: [
          {
            id: "prod_abc123",
            name: "Excel Dashboard Template",
            price: 2999,
            currency: "USD",
            rating: 4.8,
            reviewCount: 124,
          },
        ],
        pagination: { page: 1, limit: 10, total: 24, totalPages: 3 },
      },
    }, null, 2),
  },
];

// =============================================================================
// Sidebar Navigation Data
// =============================================================================

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    items: [
      { id: "authentication", title: "Authentication" },
      { id: "base-url", title: "Base URL" },
      { id: "rate-limiting", title: "Rate Limiting" },
      { id: "error-codes", title: "Error Codes" },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: Package,
    items: [
      { id: "list-products", title: "List Products", method: "GET" },
      { id: "get-product", title: "Get Product", method: "GET" },
      { id: "product-reviews", title: "Product Reviews", method: "GET" },
      { id: "categories", title: "Categories", method: "GET" },
      { id: "search-products", title: "Search Products", method: "GET" },
    ],
  },
  {
    id: "cart",
    title: "Cart",
    icon: ShoppingCart,
    items: [
      { id: "create-cart", title: "Create Cart", method: "POST" },
      { id: "add-cart-item", title: "Add Item", method: "POST" },
      { id: "remove-cart-item", title: "Remove Item", method: "DELETE" },
      { id: "get-cart", title: "Get Cart", method: "GET" },
    ],
  },
  {
    id: "checkout",
    title: "Checkout",
    icon: CreditCard,
    items: [
      { id: "create-checkout", title: "Create Session", method: "POST" },
    ],
  },
  {
    id: "sellers",
    title: "Sellers",
    icon: Store,
    items: [
      { id: "get-seller", title: "Get Seller", method: "GET" },
      { id: "seller-products", title: "Seller Products", method: "GET" },
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: Webhook,
    items: [
      { id: "webhook-overview", title: "Overview" },
      { id: "webhook-events", title: "Events" },
      { id: "webhook-verification", title: "Signature Verification" },
    ],
  },
];

// =============================================================================
// Animation Variants
// =============================================================================

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
  exit: { x: -300, opacity: 0, transition: { duration: 0.2 } },
};

const fadeInSection = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const codeTabVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// =============================================================================
// Helper Components
// =============================================================================

function MethodBadge({ method, size = "sm" }: { method: HttpMethod; size?: "sm" | "xs" }) {
  const colors = METHOD_COLORS[method];
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold rounded-md",
        colors.badge,
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-[10px] px-1.5 py-0.5",
      )}
    >
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-400" />
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function CodeBlock({
  code,
  filename,
  showCopy = true,
}: {
  code: string;
  filename?: string;
  showCopy?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
      {(filename || showCopy) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            {filename && (
              <span className="ml-2 text-xs text-neutral-500 font-mono">{filename}</span>
            )}
          </div>
          {showCopy && <CopyButton text={code} />}
        </div>
      )}
      <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto">
        <code className="text-neutral-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function ParamsTable({ params }: { params: EndpointParam[] }) {
  if (params.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parameter</th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">In</th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Required</th>
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.name} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-0">
              <td className="py-2.5 px-3">
                <code className="text-[13px] font-mono font-medium text-[#1E4DB7] dark:text-blue-400">{param.name}</code>
              </td>
              <td className="py-2.5 px-3">
                <code className="text-[13px] font-mono text-neutral-600 dark:text-neutral-400">{param.type}</code>
              </td>
              <td className="py-2.5 px-3">
                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-5">
                  {param.location}
                </Badge>
              </td>
              <td className="py-2.5 px-3">
                {param.required ? (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Required</span>
                ) : (
                  <span className="text-xs text-neutral-400">Optional</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 text-[13px]">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Try-It Panel
// =============================================================================

function TryItPanel({
  endpoint,
  apiKey,
  onApiKeyChange,
}: {
  endpoint: Endpoint;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const updateParam = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  };

  const buildUrl = () => {
    let url = `${BASE_URL}${endpoint.path}`;
    const queryParams: string[] = [];

    for (const param of endpoint.params) {
      const val = paramValues[param.name];
      if (!val) continue;
      if (param.location === "path") {
        url = url.replace(`:${param.name}`, encodeURIComponent(val));
      } else if (param.location === "query") {
        queryParams.push(`${param.name}=${encodeURIComponent(val)}`);
      }
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    return url;
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);

    const url = buildUrl();
    const bodyParams = endpoint.params.filter((p) => p.location === "body");
    const bodyObj: Record<string, string> = {};
    for (const p of bodyParams) {
      if (paramValues[p.name]) {
        bodyObj[p.name] = paramValues[p.name];
      }
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    setResponse(endpoint.exampleResponse);
    setLoading(false);
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-[#F59A23]" />
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">Try it</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="kt_live_xxxxx"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]"
                  />
                </div>
              </div>

              {/* Parameters */}
              {endpoint.params.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parameters</p>
                  {endpoint.params.map((param) => (
                    <div key={param.name}>
                      <label className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">{param.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">{param.location}</Badge>
                        {param.required && (
                          <span className="text-[10px] text-red-500 font-medium">required</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={paramValues[param.name] || ""}
                        onChange={(e) => updateParam(param.name, e.target.value)}
                        placeholder={param.description}
                        className="w-full px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={loading}
                className="w-full bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>

              {/* Response */}
              {response && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Response</p>
                    <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5">200 OK</Badge>
                  </div>
                  <CodeBlock code={response} filename="response.json" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Endpoint Section Component
// =============================================================================

function EndpointSection({
  endpoint,
  apiKey,
  onApiKeyChange,
  activeCodeTab,
  onCodeTabChange,
}: {
  endpoint: Endpoint;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  activeCodeTab: CodeTab;
  onCodeTabChange: (tab: CodeTab) => void;
}) {
  const colors = METHOD_COLORS[endpoint.method];
  const codeTabs: { key: CodeTab; label: string }[] = [
    { key: "curl", label: "cURL" },
    { key: "javascript", label: "JavaScript" },
    { key: "python", label: "Python" },
  ];

  return (
    <motion.div
      id={endpoint.id}
      variants={fadeInSection}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="scroll-mt-24"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            {endpoint.title}
          </h3>
          <div className={cn("inline-flex items-center gap-3 px-4 py-2.5 rounded-lg", colors.bg)}>
            <MethodBadge method={endpoint.method} />
            <code className={cn("text-sm font-mono font-medium", colors.text)}>
              {BASE_URL}{endpoint.path}
            </code>
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {endpoint.description}
          </p>
        </div>

        {/* Parameters */}
        {endpoint.params.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Parameters</h4>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <ParamsTable params={endpoint.params} />
            </div>
          </div>
        )}

        {/* Code Examples */}
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Example Request</h4>
          <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
            {/* Tabs */}
            <div className="flex items-center gap-0 px-4 pt-3 bg-neutral-900 border-b border-neutral-800">
              {codeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onCodeTabChange(tab.key)}
                  className={cn(
                    "px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px",
                    activeCodeTab === tab.key
                      ? "text-white bg-neutral-950 border-[#F59A23]"
                      : "text-neutral-500 hover:text-neutral-300 border-transparent",
                  )}
                >
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              <CopyButton text={endpoint.exampleRequest[activeCodeTab]} />
            </div>
            {/* Code */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCodeTab}
                variants={codeTabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto">
                  <code className="text-neutral-300 font-mono">{endpoint.exampleRequest[activeCodeTab]}</code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Example Response */}
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Example Response</h4>
          <CodeBlock code={endpoint.exampleResponse} filename="response.json" />
        </div>

        {/* Try It Panel */}
        <TryItPanel endpoint={endpoint} apiKey={apiKey} onApiKeyChange={onApiKeyChange} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ApiDocsClient() {
  const [activeSection, setActiveSection] = useState("authentication");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("curl");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SIDEBAR_SECTIONS.forEach((s) => (init[s.id] = true));
    return init;
  });

  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    const allIds = SIDEBAR_SECTIONS.flatMap((s) => s.items.map((i) => i.id));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    const timeout = setTimeout(() => {
      for (const id of allIds) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setSidebarOpen(false);
    }
  }, []);

  const toggleSidebarSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Get active section's parent for highlighting
  const activeSectionParent = useMemo(() => {
    for (const section of SIDEBAR_SECTIONS) {
      if (section.items.some((item) => item.id === activeSection)) {
        return section.id;
      }
    }
    return null;
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4 px-4 md:px-6 lg:px-8 h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link
              href="/developers"
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-neutral-500" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 rounded-full">
              <Terminal className="h-3.5 w-3.5 text-[#1E4DB7]" />
              <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                API Reference
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Quick links */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/developers/keys">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">
                <Key className="h-3.5 w-3.5 mr-1.5" />
                API Keys
              </Button>
            </Link>
            <Link href="/developers/webhooks">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">
                <Webhook className="h-3.5 w-3.5 mr-1.5" />
                Webhooks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* ================================================================= */}
        {/* SIDEBAR - Desktop */}
        {/* ================================================================= */}
        <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <nav className="p-4 space-y-1">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSidebarSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                    activeSectionParent === section.id
                      ? "text-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </div>
                  {expandedSections[section.id] ? (
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections[section.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-800 py-1 space-y-0.5">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors text-left",
                              activeSection === item.id
                                ? "text-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 font-medium"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            )}
                          >
                            {item.method && <MethodBadge method={item.method} size="xs" />}
                            <span className="truncate">{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </aside>

        {/* ================================================================= */}
        {/* SIDEBAR - Mobile overlay */}
        {/* ================================================================= */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-0 left-0 z-50 w-80 h-full bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#1E4DB7]" />
                    <span className="font-bold text-neutral-900 dark:text-white">API Reference</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>

                <nav className="p-4 space-y-1">
                  {SIDEBAR_SECTIONS.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSidebarSection(section.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                          activeSectionParent === section.id
                            ? "text-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </div>
                        {expandedSections[section.id] ? (
                          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                        )}
                      </button>

                      {expandedSections[section.id] && (
                        <div className="ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-800 py-1 space-y-0.5">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors text-left",
                                activeSection === item.id
                                  ? "text-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 font-medium"
                                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
                              )}
                            >
                              {item.method && <MethodBadge method={item.method} size="xs" />}
                              <span className="truncate">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================================= */}
        <main ref={mainRef} className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 space-y-16">

            {/* ============================================================= */}
            {/* GETTING STARTED: AUTHENTICATION */}
            {/* ============================================================= */}
            <motion.section
              id="authentication"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center">
                  <Key className="h-5 w-5 text-[#1E4DB7]" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Authentication
                </h2>
              </div>

              <div className="prose-sm space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  All API requests must be authenticated using an API key. You can create and manage API keys from the{" "}
                  <Link href="/developers/keys" className="text-[#1E4DB7] hover:underline font-medium">
                    Developer Dashboard
                  </Link>
                  . API keys are prefixed with <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">kt_live_</code>{" "}
                  for production and <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">kt_test_</code> for testing.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                      Option 1: Authorization Header (Recommended)
                    </h4>
                    <CodeBlock
                      code={`Authorization: Bearer kt_live_xxxxx`}
                      filename="header"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                      Option 2: Query Parameter
                    </h4>
                    <CodeBlock
                      code={`GET ${BASE_URL}/products?api_key=kt_live_xxxxx`}
                      filename="url"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                      Query parameters may be logged by proxies and servers. Use the header method for sensitive environments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                  <Shield className="h-5 w-5 text-[#1E4DB7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Keep your keys secure
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Never expose API keys in client-side code or public repositories.
                      Use environment variables and server-side proxy requests for production applications.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ============================================================= */}
            {/* GETTING STARTED: BASE URL */}
            {/* ============================================================= */}
            <motion.section
              id="base-url"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Base URL
                </h2>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                All API endpoints are relative to the following base URL. The API is served over HTTPS only. HTTP requests will be redirected.
              </p>

              <CodeBlock code={BASE_URL} filename="base-url" />

              <p className="text-sm text-neutral-500 mt-3">
                All responses are returned in JSON format with a <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">data</code> wrapper object.
              </p>
            </motion.section>

            {/* ============================================================= */}
            {/* GETTING STARTED: RATE LIMITING */}
            {/* ============================================================= */}
            <motion.section
              id="rate-limiting"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Rate Limiting
                </h2>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                API requests are rate-limited on a per-key basis. The default rate limit is <strong className="text-neutral-900 dark:text-white">60 requests per minute</strong>.
                Rate limit information is included in every response via HTTP headers.
              </p>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Header</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800/50">
                      <td className="py-2.5 px-4">
                        <code className="text-[13px] font-mono text-[#1E4DB7] dark:text-blue-400">X-RateLimit-Limit</code>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">Maximum number of requests allowed per window.</td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800/50">
                      <td className="py-2.5 px-4">
                        <code className="text-[13px] font-mono text-[#1E4DB7] dark:text-blue-400">X-RateLimit-Remaining</code>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">Number of requests remaining in the current window.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">
                        <code className="text-[13px] font-mono text-[#1E4DB7] dark:text-blue-400">X-RateLimit-Reset</code>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">Unix timestamp indicating when the rate limit window resets.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                When the rate limit is exceeded, the API returns a <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">429 Too Many Requests</code> response.
                Implement exponential backoff in your client to handle rate limiting gracefully.
              </p>

              <CodeBlock
                code={JSON.stringify({
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                    message: "Rate limit exceeded. Please wait 45 seconds before retrying.",
                    retryAfter: 45,
                  },
                }, null, 2)}
                filename="429 response"
              />
            </motion.section>

            {/* ============================================================= */}
            {/* GETTING STARTED: ERROR CODES */}
            {/* ============================================================= */}
            <motion.section
              id="error-codes"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Error Codes
                </h2>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                The API uses standard HTTP status codes and returns a consistent error object with a machine-readable <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">code</code> field for programmatic error handling.
              </p>

              <CodeBlock
                code={JSON.stringify({
                  error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: "The requested product does not exist or has been removed.",
                    statusCode: 404,
                  },
                }, null, 2)}
                filename="error-response.json"
              />

              <div className="mt-6 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Code</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">HTTP</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ERROR_CODES.map((err, idx) => (
                        <tr
                          key={err.code}
                          className={cn(
                            "border-b border-neutral-100 dark:border-neutral-800/50 last:border-0",
                            idx % 2 === 0 ? "" : "bg-neutral-50/50 dark:bg-neutral-900/20",
                          )}
                        >
                          <td className="py-2.5 px-4">
                            <code className="text-[12px] font-mono font-medium text-red-600 dark:text-red-400">{err.code}</code>
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-5">{err.status}</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 text-[13px]">{err.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>

            {/* ============================================================= */}
            {/* DIVIDER: Products */}
            {/* ============================================================= */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Products</h2>
                <p className="text-sm text-neutral-500">Browse and search the product catalog.</p>
              </div>
            </div>

            {ENDPOINTS.filter((e) =>
              ["list-products", "get-product", "product-reviews", "categories", "search-products"].includes(e.id),
            ).map((endpoint) => (
              <EndpointSection
                key={endpoint.id}
                endpoint={endpoint}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                activeCodeTab={activeCodeTab}
                onCodeTabChange={setActiveCodeTab}
              />
            ))}

            {/* ============================================================= */}
            {/* DIVIDER: Cart */}
            {/* ============================================================= */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Cart</h2>
                <p className="text-sm text-neutral-500">Create and manage shopping carts.</p>
              </div>
            </div>

            {ENDPOINTS.filter((e) =>
              ["create-cart", "add-cart-item", "remove-cart-item", "get-cart"].includes(e.id),
            ).map((endpoint) => (
              <EndpointSection
                key={endpoint.id}
                endpoint={endpoint}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                activeCodeTab={activeCodeTab}
                onCodeTabChange={setActiveCodeTab}
              />
            ))}

            {/* ============================================================= */}
            {/* DIVIDER: Checkout */}
            {/* ============================================================= */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Checkout</h2>
                <p className="text-sm text-neutral-500">Create Stripe checkout sessions for cart payment.</p>
              </div>
            </div>

            {ENDPOINTS.filter((e) => e.id === "create-checkout").map((endpoint) => (
              <EndpointSection
                key={endpoint.id}
                endpoint={endpoint}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                activeCodeTab={activeCodeTab}
                onCodeTabChange={setActiveCodeTab}
              />
            ))}

            {/* ============================================================= */}
            {/* DIVIDER: Sellers */}
            {/* ============================================================= */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Store className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Sellers</h2>
                <p className="text-sm text-neutral-500">Access seller profiles and their products.</p>
              </div>
            </div>

            {ENDPOINTS.filter((e) =>
              ["get-seller", "seller-products"].includes(e.id),
            ).map((endpoint) => (
              <EndpointSection
                key={endpoint.id}
                endpoint={endpoint}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                activeCodeTab={activeCodeTab}
                onCodeTabChange={setActiveCodeTab}
              />
            ))}

            {/* ============================================================= */}
            {/* WEBHOOKS: Overview */}
            {/* ============================================================= */}
            <motion.section
              id="webhook-overview"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Webhook className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Webhooks</h2>
                  <p className="text-sm text-neutral-500">Receive real-time event notifications.</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Webhooks allow your application to receive real-time notifications when events happen in the KTBlog platform.
                  Instead of polling our API for changes, you register an HTTPS endpoint and we send a POST request to it whenever a relevant event occurs.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">How it works</h4>
                  <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                      <span>Register a webhook endpoint in the <Link href="/developers/webhooks" className="text-[#1E4DB7] hover:underline font-medium">Webhooks Dashboard</Link> and select the events you want to subscribe to.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                      <span>When an event occurs, we send a POST request to your endpoint with the event payload as JSON.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                      <span>Your endpoint should respond with a 2xx status code within 30 seconds. Failed deliveries are retried up to 5 times with exponential backoff.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] text-xs font-bold flex items-center justify-center mt-0.5">4</span>
                      <span>Verify the webhook signature using your signing secret to ensure payloads are authentic.</span>
                    </li>
                  </ol>
                </div>

                <CodeBlock
                  code={JSON.stringify({
                    id: "evt_abc123",
                    type: "order.created",
                    createdAt: "2025-03-01T12:00:00Z",
                    data: {
                      orderId: "ord_xyz789",
                      cartId: "cart_xyz789",
                      customerId: "cus_abc123",
                      total: 2999,
                      currency: "USD",
                      items: [
                        {
                          productId: "prod_abc123",
                          name: "Excel Dashboard Template",
                          price: 2999,
                          quantity: 1,
                        },
                      ],
                    },
                  }, null, 2)}
                  filename="webhook-payload.json"
                />
              </div>
            </motion.section>

            {/* ============================================================= */}
            {/* WEBHOOKS: Events */}
            {/* ============================================================= */}
            <motion.section
              id="webhook-events"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Webhook Events
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                Below is a complete list of all available webhook events. Subscribe to specific events or use a wildcard subscription to receive all events.
              </p>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Event</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEBHOOK_EVENTS_DATA.map((evt, idx) => (
                      <tr
                        key={evt.event}
                        className={cn(
                          "border-b border-neutral-100 dark:border-neutral-800/50 last:border-0",
                          idx % 2 === 0 ? "" : "bg-neutral-50/50 dark:bg-neutral-900/20",
                        )}
                      >
                        <td className="py-2.5 px-4">
                          <code className="text-[12px] font-mono font-medium text-indigo-600 dark:text-indigo-400">{evt.event}</code>
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 text-[13px]">{evt.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Example Payloads */}
              <div className="mt-8 space-y-6">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Example Payloads</h4>

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">order.paid</p>
                  <CodeBlock
                    code={JSON.stringify({
                      id: "evt_def456",
                      type: "order.paid",
                      createdAt: "2025-03-01T12:05:00Z",
                      data: {
                        orderId: "ord_xyz789",
                        paymentIntentId: "pi_stripe_abc",
                        amount: 2999,
                        currency: "USD",
                        customerEmail: "customer@example.com",
                      },
                    }, null, 2)}
                    filename="order.paid"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">product.updated</p>
                  <CodeBlock
                    code={JSON.stringify({
                      id: "evt_ghi789",
                      type: "product.updated",
                      createdAt: "2025-03-02T09:15:00Z",
                      data: {
                        productId: "prod_abc123",
                        changes: ["price", "description"],
                        newPrice: 3499,
                        oldPrice: 2999,
                        updatedBy: "seller_1",
                      },
                    }, null, 2)}
                    filename="product.updated"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">review.created</p>
                  <CodeBlock
                    code={JSON.stringify({
                      id: "evt_jkl012",
                      type: "review.created",
                      createdAt: "2025-03-03T16:30:00Z",
                      data: {
                        reviewId: "rev_abc123",
                        productId: "prod_abc123",
                        rating: 5,
                        title: "Excellent template!",
                        authorId: "user_1",
                      },
                    }, null, 2)}
                    filename="review.created"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">subscription.cancelled</p>
                  <CodeBlock
                    code={JSON.stringify({
                      id: "evt_mno345",
                      type: "subscription.cancelled",
                      createdAt: "2025-03-04T11:00:00Z",
                      data: {
                        subscriptionId: "sub_abc123",
                        productId: "prod_sub456",
                        customerId: "cus_abc123",
                        reason: "customer_request",
                        effectiveDate: "2025-04-01T00:00:00Z",
                      },
                    }, null, 2)}
                    filename="subscription.cancelled"
                  />
                </div>
              </div>
            </motion.section>

            {/* ============================================================= */}
            {/* WEBHOOKS: Signature Verification */}
            {/* ============================================================= */}
            <motion.section
              id="webhook-verification"
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="scroll-mt-24"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Signature Verification
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                Every webhook delivery includes a <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[13px] font-mono">X-KTBlog-Signature</code> header
                containing an HMAC-SHA256 signature of the request body. Always verify this signature to ensure the payload was sent by KTBlog and has not been tampered with.
              </p>

              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3 mb-6">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Verification Steps</h4>
                <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                    <span>Extract the signature from the <code className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded text-[12px] font-mono">X-KTBlog-Signature</code> header.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                    <span>Compute an HMAC-SHA256 of the raw request body using your webhook signing secret.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                    <span>Compare the computed signature with the header value using a timing-safe comparison.</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Node.js Example</h4>
                <CodeBlock
                  code={`import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

// In your webhook handler:
app.post('/webhooks/ktblog', (req, res) => {
  const signature = req.headers['x-ktblog-signature'];
  const rawBody = req.body; // Raw string body

  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody);

  switch (event.type) {
    case 'order.created':
      // Handle new order
      break;
    case 'order.paid':
      // Fulfill order
      break;
    // ... handle other events
  }

  res.status(200).json({ received: true });
});`}
                  filename="verify-webhook.ts"
                />

                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Python Example</h4>
                <CodeBlock
                  code={`import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_signing_secret'

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    computed = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed, signature)

@app.route('/webhooks/ktblog', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-KTBlog-Signature', '')
    raw_body = request.get_data()

    if not verify_signature(raw_body, signature, WEBHOOK_SECRET):
        return jsonify({'error': 'Invalid signature'}), 401

    event = request.get_json()

    if event['type'] == 'order.created':
        # Handle new order
        pass
    elif event['type'] == 'order.paid':
        # Fulfill order
        pass

    return jsonify({'received': True}), 200`}
                  filename="verify_webhook.py"
                />
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Important: Use the raw request body
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    The signature is computed over the raw request body. If your framework parses JSON automatically,
                    make sure to access the raw body string for verification. Re-serializing a parsed JSON object may produce a different string.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* ============================================================= */}
            {/* FOOTER CTA */}
            {/* ============================================================= */}
            <motion.section
              variants={fadeInSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="pb-8"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E4DB7] to-[#0F2B6B] p-8 md:p-12">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F59A23]/15 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Ready to integrate?
                  </h3>
                  <p className="text-white/70 mb-6 max-w-md mx-auto">
                    Create your API key and start building with the KTBlog Storefront API today.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/developers/keys">
                      <Button className="bg-[#F59A23] hover:bg-[#e08b1a] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-[#F59A23]/25">
                        <Key className="h-4 w-4 mr-2" />
                        Get API Keys
                      </Button>
                    </Link>
                    <Link href="/developers/webhooks">
                      <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-2.5 rounded-xl">
                        <Webhook className="h-4 w-4 mr-2" />
                        Setup Webhooks
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>

          </div>
        </main>
      </div>
    </div>
  );
}
