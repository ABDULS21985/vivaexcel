import { DataSource } from 'typeorm';
import { Product, ProductStatus } from '../../modules/products/entities/product.entity';
import { ProductCategory } from '../../modules/products/entities/product-category.entity';
import { ProductFeature } from '../../modules/products/entities/product-feature.entity';

/**
 * Product seed data for Global Digitalbit's core product offerings.
 * These products are the company's main solutions showcased on the website.
 */
export const productSeedData = [
  {
    name: 'DigiGate',
    slug: 'digigate',
    description:
      'A comprehensive API gateway and lifecycle management solution that acts as the centralized control layer for your entire digital infrastructure. Manage all inbound and outbound API traffic while enforcing security, routing policies, and governance at scale.',
    metaTitle: 'DigiGate - The Command Center for Your Digital Ecosystem',
    status: ProductStatus.PUBLISHED,
    features: [
      { name: 'Centralized Security', value: 'OAuth 2.0, JWT validation, rate limiting, threat protection' },
      { name: 'Intelligent Routing', value: 'Load balancing, failover, API versioning, canary deployments' },
      { name: 'API Composition', value: 'Combine multiple microservices into single client responses' },
      { name: 'Real-Time Monitoring', value: 'Unified logging, tracing, performance dashboards, anomaly detection' },
      { name: 'Developer Portal', value: 'Self-service API documentation, sandbox testing, key management' },
      { name: 'Policy Management', value: 'Configurable security policies, throttling rules, access controls' },
    ],
  },
  {
    name: 'DigiTrust',
    slug: 'digitrust',
    description:
      'A blockchain-based solution for issuing, verifying, and managing tamper-proof digital credentials. From educational certificates to professional licenses, land titles to insurance policies, DigiTrust ensures document authenticity is never in question.',
    metaTitle: 'DigiTrust - Immutable Trust for a Digital World',
    status: ProductStatus.PUBLISHED,
    features: [
      { name: 'Credential Issuance', value: 'Secure generation and blockchain anchoring of digital documents' },
      { name: 'Public Verifier', value: 'Instant QR code or document ID verification for anyone' },
      { name: 'Auditor Console', value: 'Compliance checks, lifecycle tracking, security logging' },
      { name: 'API Integration', value: 'Seamless connection to existing HR, banking, or registry systems' },
      { name: 'Revocation Management', value: 'Instant credential invalidation with full audit trail' },
      { name: 'Multi-Tenant Support', value: 'Support for multiple issuers under single deployment' },
    ],
  },
  {
    name: 'DigiTrack',
    slug: 'digitrack',
    description:
      'Real-time tracking and traceability for physical assets, digital transactions, and service delivery workflows. Built for industries requiring complete chain-of-custody documentation and operational transparency.',
    metaTitle: 'DigiTrack - Complete Visibility Across Your Digital Operations',
    status: ProductStatus.PUBLISHED,
    features: [
      { name: 'Real-Time Location', value: 'GPS, RFID, and IoT sensor integration' },
      { name: 'Transaction Traceability', value: 'End-to-end audit trails for financial operations' },
      { name: 'Service Monitoring', value: 'SLA tracking, escalation management, performance metrics' },
      { name: 'Chain of Custody', value: 'Immutable handoff records for regulated industries' },
      { name: 'Predictive Analytics', value: 'ML-powered anomaly detection and forecasting' },
      { name: 'Custom Dashboards', value: 'Role-based views with drill-down capabilities' },
    ],
  },
  {
    name: 'TrustMeHub',
    slug: 'trustmehub',
    description:
      'A global digital trust infrastructure for instant, blockchain-anchored credential verification. Verify any credential in milliseconds, not weeks. Transform how credentials are issued, verified, and trusted at national scale with sub-10ms verification, 99% cost reduction, and 100,000+ verifications per second capacity.',
    metaTitle: 'TrustMeHub - Building Trust. Empowering Growth.',
    status: ProductStatus.PUBLISHED,
    features: [
      { name: 'Instant Verification', value: 'Sub-10ms verification responses with 92%+ cache hit rates' },
      { name: 'Blockchain Anchoring', value: 'Hyperledger FireFly for immutable, tamper-proof records' },
      { name: 'Zero-Knowledge Proofs', value: 'Privacy-preserving selective disclosure verification' },
      { name: 'Multi-Tenant Architecture', value: 'Enterprise-grade Row-Level Security for data isolation' },
      { name: 'Mobile Wallet', value: 'iOS/Android apps with offline credential support' },
      { name: 'Global Reach', value: 'Multi-language: English, Arabic, French, Spanish, Portuguese, Chinese' },
      { name: 'Batch Processing', value: 'Process thousands of credentials at once' },
      { name: 'Template Designer', value: 'Drag-and-drop credential template creation' },
      { name: 'QR Code Verification', value: 'Instant mobile verification' },
      { name: 'PDF Receipt Generation', value: 'Audit-ready verification records' },
      { name: 'API Gateway & SDKs', value: 'OpenAPI 3.0 with Node.js, Python, Go, Rust SDKs' },
      { name: 'Analytics Dashboard', value: 'Real-time metrics and compliance reporting' },
      { name: 'Webhook & Event Streaming', value: 'Real-time notifications' },
      { name: 'Role-based Access Control', value: '40+ granular permissions' },
      { name: 'W3C Verifiable Credentials', value: 'Standards-compliant credential format' },
    ],
  },
  {
    name: 'BoaCRM',
    slug: 'boacrm',
    description:
      'A comprehensive enterprise-grade CRM platform purpose-built for African financial institutions. With 35 integrated modules, native compliance, and omnichannel engagement, it transforms how banks manage customer relationships at scale.',
    metaTitle: 'BoaCRM - The Operating System for Customer Relationships',
    status: ProductStatus.PUBLISHED,
    features: [
      { name: 'Customer 360', value: 'Golden record with multi-source deduplication and relationship mapping' },
      { name: 'Omnichannel Engagement', value: 'Unified console for WhatsApp, SMS, email, voice, and in-branch' },
      { name: 'Contact Center Suite', value: 'IVR, ACD, quality assurance, workforce management' },
      { name: 'Compliance & Governance', value: 'NDPR/NDPA, BVN/NIN verification, KYC/AML workflows' },
      { name: 'Conversational AI', value: 'Full chatbot builder with 24/7 availability' },
      { name: 'ML Analytics', value: 'Churn prediction, propensity scoring, real-time dashboards' },
    ],
  },
];

/**
 * Product category seed data
 */
export const categorySeedData = [
  {
    name: 'API & Integration',
    slug: 'api-integration',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Blockchain & Trust',
    slug: 'blockchain-trust',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Tracking & Analytics',
    slug: 'tracking-analytics',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'CRM & Banking',
    slug: 'crm-banking',
    sortOrder: 4,
    isActive: true,
  },
];

/**
 * Seeds the products table with core product offerings.
 * Note: This requires an organizationId to be passed in.
 */
export async function seedProducts(
  dataSource: DataSource,
  organizationId: string,
): Promise<void> {
  const productRepository = dataSource.getRepository(Product);
  const categoryRepository = dataSource.getRepository(ProductCategory);
  const featureRepository = dataSource.getRepository(ProductFeature);

  console.log('Seeding product categories...');

  // Seed categories first
  for (const categoryData of categorySeedData) {
    const existing = await categoryRepository.findOne({
      where: { slug: categoryData.slug },
    });

    if (!existing) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Created category: ${categoryData.name}`);
    } else {
      console.log(`Category already exists: ${categoryData.name}`);
    }
  }

  console.log('Seeding products...');

  // Seed products
  for (const productData of productSeedData) {
    const existing = await productRepository.findOne({
      where: { slug: productData.slug },
    });

    if (!existing) {
      // Create product
      const product = productRepository.create({
        organizationId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        metaTitle: productData.metaTitle,
        status: productData.status,
        publishedAt: new Date(),
      });

      const savedProduct = await productRepository.save(product);

      // Create features for the product
      for (let i = 0; i < productData.features.length; i++) {
        const featureData = productData.features[i];
        const feature = featureRepository.create({
          productId: savedProduct.id,
          name: featureData.name,
          value: featureData.value,
          sortOrder: i + 1,
        });
        await featureRepository.save(feature);
      }

      console.log(`Created product: ${productData.name} with ${productData.features.length} features`);
    } else {
      console.log(`Product already exists: ${productData.name}`);
    }
  }

  console.log('Product seeding completed!');
}

/**
 * Get product by slug from seed data (for reference without database)
 */
export function getProductSeedBySlug(slug: string) {
  return productSeedData.find((p) => p.slug === slug);
}

/**
 * Get all product slugs
 */
export function getAllProductSlugs(): string[] {
  return productSeedData.map((p) => p.slug);
}
