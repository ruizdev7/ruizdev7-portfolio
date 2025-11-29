/**
 * Policies Management - CRUD Component
 * Create, Read, Update, Delete Governance Policies
 * Includes filtering by área/departamento (applies_to)
 */

import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetPoliciesQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const PoliciesManagement = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const {
    data: policiesData,
    isLoading,
    error,
    refetch,
  } = useGetPoliciesQuery();
  const [createPolicy, { isLoading: creating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: updating }] = useUpdatePolicyMutation();
  const [deletePolicy, { isLoading: deleting }] = useDeletePolicyMutation();

  const policies = useMemo(
    () => policiesData?.policies || [],
    [policiesData?.policies]
  );

  const departmentOptions = useMemo(() => {
    const baseDepartments = [
      "Dirección General",
      "Finanzas y Contabilidad",
      "Compras y Proveedores",
      "Operaciones y Producción",
      "Tecnología (IT)",
      "Calidad y Auditoría",
      "Otros",
    ];
    const set = new Set(baseDepartments);
    policies.forEach((p) => {
      if (p.applies_to) {
        set.add(p.applies_to);
      }
    });
    return Array.from(set);
  }, [policies]);

  const [areaFilter, setAreaFilter] = useState("");

  // Leer ?applies_to= del query string para prefiltrar desde el dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appliesTo = params.get("applies_to");
    if (appliesTo) {
      setAreaFilter(appliesTo);
    }
  }, [location.search]);

  const filteredPolicies = useMemo(() => {
    if (!areaFilter) return policies;
    return policies.filter((p) => p.applies_to === areaFilter);
  }, [policies, areaFilter]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      rule_json: "{}",
      enforcement_level: "blocking",
      applies_to: "",
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingPolicy(null);
    reset({
      name: "",
      description: "",
      rule_json: "{}",
      enforcement_level: "blocking",
      applies_to: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    reset({
      name: policy.name,
      description: policy.description || "",
      rule_json:
        typeof policy.rule_json === "string"
          ? policy.rule_json
          : JSON.stringify(policy.rule_json, null, 2),
      enforcement_level: policy.enforcement_level || "blocking",
      applies_to: policy.applies_to || "",
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
        toast.error(t("validation.invalidJson"));
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
        toast.success(t("policies.updated"));
      } else {
        await createPolicy(policyData).unwrap();
        toast.success(t("policies.created"));
      }
      closeModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || t("policies.error"));
    }
  };

  const handleDelete = async (policyId) => {
    try {
      await deletePolicy(policyId).unwrap();
      toast.success(t("policies.deleted"));
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || t("policies.deleteError"));
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
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/ai-governance"
            className="inline-flex items-center gap-2 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{t("common.back")}</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
                {t("policies.title")}
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                {t("policies.subtitle")}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md dark:shadow-gray-900/50"
            >
              <PlusIcon className="h-5 w-5" />
              {t("policies.create")}
            </button>
          </div>
        </div>

        {/* Filtro por área / departamento */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAreaFilter("")}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                areaFilter === ""
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-do_text_gray_light dark:text-do_text_gray_dark border-do_border_light dark:border-gray-700 hover:border-blue-400 hover:text-blue-400"
              }`}
            >
              Todas las áreas
            </button>
            {departmentOptions.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setAreaFilter(dept)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  areaFilter === dept
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-transparent text-do_text_gray_light dark:text-do_text_gray_dark border-do_border_light dark:border-gray-700 hover:border-blue-400 hover:text-blue-400"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                No hay políticas para el filtro seleccionado. Crea una para
                comenzar.
              </p>
            </div>
          ) : (
            filteredPolicies.map((policy) => (
              <div
                key={policy.policy_id}
                className={`bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 transition-all ${
                  !policy.active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark">
                        {policy.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          policy.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {policy.active ? "Activa" : "Inactiva"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          policy.enforcement_level === "blocking"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        {policy.enforcement_level}
                      </span>
                    </div>
                  </div>
                </div>

                {policy.description && (
                  <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mb-4 line-clamp-2">
                    {policy.description}
                  </p>
                )}

                {policy.applies_to && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-do_text_light dark:text-do_text_dark">
                      Aplica a:
                    </span>{" "}
                    <span className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                      {policy.applies_to}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-medium text-do_text_light dark:text-do_text_dark mb-1">
                    Regla (JSON)
                  </label>
                  <pre className="p-2 bg-do_bg_light dark:bg-do_bg_dark rounded text-xs text-do_text_light dark:text-do_text_dark overflow-x-auto max-h-32 overflow-y-auto border border-do_border_light dark:border-none">
                    {JSON.stringify(policy.rule_json, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-2 pt-4 border-t border-do_border_light dark:border-none">
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
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  {editingPolicy ? t("policies.edit") : t("policies.createNew")}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Name Field - Floating Label Style */}
                <div className="relative">
                  <input
                    {...register("name", {
                      required: `${t("common.name")} ${t(
                        "validation.required"
                      )}`,
                      minLength: {
                        value: 3,
                        message: t("validation.minLength", { min: 3 }),
                      },
                      maxLength: {
                        value: 100,
                        message: t("validation.maxLength", { max: 100 }),
                      },
                    })}
                    type="text"
                    className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("common.name")} *
                  </label>
                  {errors.name && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Description Field - Floating Label Style */}
                <div className="relative">
                  <textarea
                    {...register("description")}
                    rows="3"
                    className="peer h-24 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 py-3 text-white placeholder-transparent focus:border-blue-400 focus:outline-none resize-none"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("common.description")}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Enforcement Level Field - Floating Label Style */}
                  <div className="relative">
                    <select
                      {...register("enforcement_level", {
                        required: `${t("policies.enforcementLevel")} ${t(
                          "validation.required"
                        )}`,
                      })}
                      className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="blocking">Blocking</option>
                      <option value="warning">Warning</option>
                      <option value="advisory">Advisory</option>
                    </select>
                    <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                      {t("policies.enforcementLevel")} *
                    </label>
                  </div>

                  {/* Applies To Field - Área / Departamento */}
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        {...register("applies_to")}
                        type="text"
                        className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-do_card_light dark:bg-[#2C2F36] px-4 text-do_text_light dark:text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                        placeholder=" "
                      />
                      <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-do_card_light dark:bg-[#2C2F36] pointer-events-none">
                        Área / Departamento
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {departmentOptions.map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() =>
                            setValue("applies_to", dept, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className="px-2 py-1 text-xs rounded-full border border-do_border_light dark:border-gray-600 text-do_text_gray_light dark:text-do_text_gray_dark hover:border-blue-400 hover:text-blue-400 transition-colors"
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Si necesitas otra área, simplemente escribe el nombre
                      directamente en el campo de arriba.
                    </p>
                  </div>
                </div>

                {/* Rule JSON Field - Floating Label Style */}
                <div className="relative">
                  <textarea
                    {...register("rule_json", {
                      required: `${t("policies.ruleJson")} ${t(
                        "validation.required"
                      )}`,
                      validate: (value) => {
                        try {
                          JSON.parse(value);
                          return true;
                        } catch {
                          return t("validation.invalidJson");
                        }
                      },
                    })}
                    rows="8"
                    className="peer h-48 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 py-3 text-white placeholder-transparent focus:border-blue-400 focus:outline-none resize-none font-mono text-sm"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("policies.ruleJson")} *
                  </label>
                  {errors.rule_json && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.rule_json.message}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("policies.ruleJson")}:{" "}
                    {`{"threshold": 0.8, "action": "require_approval"}`}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    {...register("active")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-do_text_light dark:text-do_text_dark">
                    {t("policies.active")}
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-do_border_light dark:border-none">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating || updating
                      ? t("common.saving")
                      : editingPolicy
                      ? t("common.update")
                      : t("common.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark mb-6">
                ¿Estás seguro de que deseas eliminar esta política? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
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
