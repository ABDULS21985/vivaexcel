import { Repository } from 'typeorm';
import { DiscussionCategory } from '../entities/discussion-category.entity';

export const DISCUSSION_CATEGORIES = [
  {
    name: 'General',
    slug: 'general',
    description:
      'General discussions about anything related to digital products',
    icon: 'MessageSquare',
    color: 'blue',
    sortOrder: 0,
  },
  {
    name: 'Product Questions',
    slug: 'product-questions',
    description: 'Ask questions about specific products',
    icon: 'HelpCircle',
    color: 'purple',
    sortOrder: 1,
  },
  {
    name: 'Feature Requests',
    slug: 'feature-requests',
    description: 'Suggest new features and improvements',
    icon: 'Lightbulb',
    color: 'amber',
    sortOrder: 2,
  },
  {
    name: 'Show & Tell',
    slug: 'show-and-tell',
    description: 'Show off what you have built with our products',
    icon: 'Presentation',
    color: 'green',
    sortOrder: 3,
  },
  {
    name: 'Tips & Tutorials',
    slug: 'tips-tutorials',
    description: 'Share tips, tricks, and tutorials',
    icon: 'BookOpen',
    color: 'cyan',
    sortOrder: 4,
  },
  {
    name: 'Bug Reports',
    slug: 'bug-reports',
    description: 'Report bugs and issues',
    icon: 'Bug',
    color: 'red',
    sortOrder: 5,
  },
];

export async function seedDiscussionCategories(
  repository: Repository<DiscussionCategory>,
): Promise<DiscussionCategory[]> {
  const seeded: DiscussionCategory[] = [];

  for (const categoryData of DISCUSSION_CATEGORIES) {
    const existing = await repository.findOne({
      where: { slug: categoryData.slug },
    });

    if (!existing) {
      const category = repository.create(categoryData);
      const saved = await repository.save(category);
      seeded.push(saved);
    } else {
      seeded.push(existing);
    }
  }

  return seeded;
}
