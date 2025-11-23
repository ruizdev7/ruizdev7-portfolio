/**
 * Policies Management - CRUD Component
 * Create, Read, Update, Delete Governance Policies
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  useGetPoliciesQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
} from '../../RTK_Query_app/services/aiGovernance/aiGovernanceApi';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const PoliciesManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: policiesData, isLoading, error, refetch } = useGetPoliciesQuery();
  const [createPolicy, { isLoading: creating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: updating }] = useUpdatePolicyMutation();
  const [deletePolicy, { isLoading: deleting }] = useDeletePolicyMutation();

  const policies = policiesData?.policies || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      rule_json: '{}',
      enforcement_level: 'blocking',
      applies_to: '',
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingPolicy(null);
    reset({
      name: '',
      description: '',
      rule_json: '{}',
      enforcement_level: 'blocking',
      applies_to: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    reset({
      name: policy.name,
      description: policy.description || '',
      rule_json: typeof policy.rule_json === 'string' 
        ? policy.rule_json 
        : JSON.stringify(policy.rule_json, null, 2),
      enforcement_level: policy.enforcement_level || 'blocking',
      applies_to: policy.applies_to || '',
      active: policy.active !== undefined ? policy.active : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      let ruleJson;
      try {
        ruleJson = JSON.parse(data.rule_json);
      } catch {
        toast.error('El rule_json debe ser un JSON válido');
        return;
      }

      const policyData = {
        name: data.name,
        description: data.description,
        rule_json: ruleJson,
        enforcement_level: data.enforcement_level,
        applies_to: data.applies_to || null,
        active: data.active,
      };

      if (editingPolicy) {
        await updatePolicy({
          policyId: editingPolicy.policy_id,
          ...policyData,
        }).unwrap();
        toast.success('Política actualizada exitosamente');
      } else {
        await createPolicy(policyData).unwrap();
        toast.success('Política creada exitosamente');
      }
      closeModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || 'Error al guardar la política');
    }
  };

  const handleDelete = async (policyId) => {
    try {
      await deletePolicy(policyId).unwrap();
      toast.success('Política eliminada exitosamente');
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || 'Error al eliminar la política');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">
            Error al cargar políticas: {error?.data?.error || error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/ai-governance"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Governance Policies
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Define y gestiona políticas de gobernanza para tus agentes de IA
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md dark:shadow-gray-900/50"
            >
              <PlusIcon className="h-5 w-5" />
              Crear Política
            </button>
          </div>
        </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay políticas creadas. Crea una para comenzar.
            </p>
          </div>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.policy_id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 transition-all ${
                !policy.active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {policy.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${
                      policy.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    }`}>
                      {policy.active ? 'Activa' : 'Inactiva'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${
                      policy.enforcement_level === 'blocking'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      {policy.enforcement_level}
                    </span>
                  </div>
                </div>
              </div>

              {policy.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {policy.description}
                </p>
              )}

              {policy.applies_to && (
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Aplica a:
                  </span>{' '}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {policy.applies_to}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Regla (JSON)
                </label>
                <pre className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-900 dark:text-white overflow-x-auto max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(policy.rule_json, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => openEditModal(policy)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <PencilIcon className="h-4 w-4 inline mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(policy.policy_id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors border border-red-200 dark:border-red-800"
                >
                  <TrashIcon className="h-4 w-4 inline mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingPolicy ? 'Editar Política' : 'Crear Nueva Política'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  {...register('name', { required: 'El nombre es requerido' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel de Aplicación *
                  </label>
                  <select
                    {...register('enforcement_level', {
                      required: 'El nivel de aplicación es requerido',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blocking">Blocking</option>
                    <option value="warning">Warning</option>
                    <option value="advisory">Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aplica a (opcional)
                  </label>
                  <input
                    {...register('applies_to')}
                    type="text"
                    placeholder="agent_type, agent_id, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Regla JSON *
                </label>
                <textarea
                  {...register('rule_json', {
                    required: 'La regla JSON es requerida',
                    validate: (value) => {
                      try {
                        JSON.parse(value);
                        return true;
                      } catch {
                        return 'Debe ser un JSON válido';
                      }
                    },
                  })}
                  rows="8"
                  placeholder='{"threshold": 0.8, "action": "require_approval"}'
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {errors.rule_json && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.rule_json.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Define las reglas de la política en formato JSON
                </p>
              </div>

              <div className="flex items-center">
                <input
                  {...register('active')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Política activa
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating || updating
                    ? 'Guardando...'
                    : editingPolicy
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta política? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PoliciesManagement;

