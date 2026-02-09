'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { WebTemplateForm } from '../../../../components/forms/web-template-form';
import {
  useWebTemplate,
  useUpdateWebTemplate,
  useTemplateLicenses,
} from '../../../../hooks/use-web-templates';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditTemplatePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: template, isLoading } = useWebTemplate(id);
  const updateMutation = useUpdateWebTemplate();
  const { data: licenses } = useTemplateLicenses(id);

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync({ id, data });
    router.push('/products/templates');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Template not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
        <p className="text-sm text-gray-500">{template.title}</p>
      </div>

      <WebTemplateForm
        mode="edit"
        initialData={template}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />

      {/* License Keys Section */}
      {licenses && licenses.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">License Keys</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">License Key</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Activations</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {licenses.map((license: any) => (
                  <tr key={license.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{license.licenseKey}</td>
                    <td className="px-4 py-3">{license.licenseType}</td>
                    <td className="px-4 py-3">
                      {license.activationCount} / {license.maxActivations}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          license.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {license.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(license.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
