'use client';

import { useRouter } from 'next/navigation';
import { WebTemplateForm } from '../../../../components/forms/web-template-form';
import { useCreateWebTemplate } from '../../../../hooks/use-web-templates';

export default function NewTemplatePage() {
  const router = useRouter();
  const createMutation = useCreateWebTemplate();

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
    router.push('/products/templates');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Template</h1>
        <p className="text-sm text-gray-500">
          Add a new web template or starter kit to your store
        </p>
      </div>
      <WebTemplateForm mode="create" onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}
