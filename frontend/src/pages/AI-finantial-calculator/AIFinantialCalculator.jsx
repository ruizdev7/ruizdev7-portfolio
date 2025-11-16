import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  SparklesIcon,
  CalculatorIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import PDFViewer from "../../components/PDFViewer";
import {
  useGetCalculationTypesQuery,
  useCreateCalculationMutation,
  useGetCalculationsQuery,
  useDeleteCalculationMutation,
} from "../../RTK_Query_app/services/financialCalculator/financialCalculatorApi";
import { useSelector } from "react-redux";

const AIFInantialCalculator = () => {
  const [selectedCalculationType, setSelectedCalculationType] = useState("");
  const [calculationResult, setCalculationResult] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [showTheory, setShowTheory] = useState(false);

  // Verificar autenticación
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data: calculationTypes, isLoading: typesLoading } =
    useGetCalculationTypesQuery();
  const [createCalculation, { isLoading: isCreating }] =
    useCreateCalculationMutation();
  const [deleteCalculation, { isLoading: isDeleting }] =
    useDeleteCalculationMutation();
  const {
    data: calculationsData,
    isLoading: calculationsLoading,
    refetch: refetchCalculations,
  } = useGetCalculationsQuery({
    page: 1,
    per_page: 10,
    type: filterType || undefined,
  });

  const historyCount =
    calculationsData?.pagination?.total ??
    calculationsData?.calculations?.length ??
    0;

  const handleScrollToHistory = () => {
    const el = document.getElementById("fc-history");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDeleteCalculation = async (id, title) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${title}"?`)) {
      return;
    }

    try {
      await deleteCalculation(id).unwrap();
      toast.success("Cálculo eliminado exitosamente", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "light",
      });
      refetchCalculations();
    } catch (error) {
      toast.error("Error al eliminar el cálculo", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "light",
      });
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const watchedType = watch("calculation_type");

  useEffect(() => {
    if (watchedType) {
      setSelectedCalculationType(watchedType);
    }
  }, [watchedType]);

  const getCalculationExample = (type) => {
    const examples = {
      present_value:
        "Ej: ¿Cuánto invertir hoy para tener $50,000 en 5 años al 8%?",
      future_value: "Ej: ¿Cuánto tendré en 10 años con $10,000 al 6% anual?",
      annuity: "Ej: Valor presente de $1,000 mensuales por 3 años al 5%",
      compound_interest:
        "Ej: $5,000 al 7% capitalizado trimestralmente por 4 años",
      amortization: "Ej: Préstamo de $200,000 a 20 años al 4.5% anual",
    };
    return examples[type] || "";
  };

  const onSubmit = async (data) => {
    try {
      // Convertir todos los campos numéricos a números
      const formattedData = {
        ...data,
        future_value: data.future_value
          ? parseFloat(data.future_value)
          : undefined,
        present_value: data.present_value
          ? parseFloat(data.present_value)
          : undefined,
        interest_rate: data.interest_rate
          ? parseFloat(data.interest_rate)
          : undefined,
        time_periods: data.time_periods
          ? parseInt(data.time_periods)
          : undefined,
        annuity_payment: data.annuity_payment
          ? parseFloat(data.annuity_payment)
          : undefined,
        annuity_periods: data.annuity_periods
          ? parseInt(data.annuity_periods)
          : undefined,
        initial_investment: data.initial_investment
          ? parseFloat(data.initial_investment)
          : undefined,
        compound_frequency: data.compound_frequency
          ? parseInt(data.compound_frequency)
          : undefined,
        loan_amount: data.loan_amount
          ? parseFloat(data.loan_amount)
          : undefined,
        loan_term_years: data.loan_term_years
          ? parseInt(data.loan_term_years)
          : undefined,
      };

      const result = await createCalculation(formattedData).unwrap();
      setCalculationResult(result);
      toast.success("¡Cálculo realizado exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      refetchCalculations();
    } catch (error) {
      console.error("Error en cálculo:", error);

      let errorMessage = "Error al realizar el cálculo";

      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.details) {
        errorMessage = error.data.details;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const renderCalculationForm = () => {
    if (!selectedCalculationType) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <CalculatorIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              Selecciona una pestaña arriba para comenzar
            </p>
          </div>
        </div>
      );
    }

    const type = calculationTypes?.calculation_types?.find(
      (t) => t.type === selectedCalculationType
    );
    if (!type) return null;

    return (
      <div className="h-fit">
        <div className="mb-4">
          <h2 className="text-lg text-white font-bold mb-2">
            📝 Datos de Entrada
          </h2>
          <p className="text-xs text-gray-500 italic">
            {getCalculationExample(type.type)}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de cálculo (oculto) */}
          <input
            type="hidden"
            {...register("calculation_type")}
            value={selectedCalculationType}
          />

          {/* Título */}
          <div className="relative">
            <input
              {...register("title", { required: "El título es requerido" })}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Título del Cálculo
            </label>
            {errors.title && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="relative">
            <textarea
              {...register("description")}
              className="peer h-20 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 py-2 text-white placeholder-transparent focus:border-blue-400 focus:outline-none resize-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Descripción (Opcional)
            </label>
          </div>

          {/* Campos específicos según el tipo de cálculo */}
          {renderCalculationFields()}

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold
              hover:bg-blue-500 transition-colors flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <CalculatorIcon className="w-5 h-5 mr-2" />
                  Calcular
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCalculationType("");
                setCalculationResult(null);
                reset();
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg text-sm
              hover:bg-gray-700 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderCalculationFields = () => {
    const fields = [];

    switch (selectedCalculationType) {
      case "present_value":
        fields.push(
          {
            name: "future_value",
            label: "Valor Futuro",
            type: "number",
            required: true,
          },
          {
            name: "interest_rate",
            label: "Tasa de Interés (%)",
            type: "number",
            required: true,
          },
          {
            name: "time_periods",
            label: "Períodos de Tiempo",
            type: "number",
            required: true,
          }
        );
        break;
      case "future_value":
        fields.push(
          {
            name: "present_value",
            label: "Valor Presente",
            type: "number",
            required: true,
          },
          {
            name: "interest_rate",
            label: "Tasa de Interés (%)",
            type: "number",
            required: true,
          },
          {
            name: "time_periods",
            label: "Períodos de Tiempo",
            type: "number",
            required: true,
          }
        );
        break;
      case "annuity":
        fields.push(
          {
            name: "annuity_payment",
            label: "Pago de Anualidad",
            type: "number",
            required: true,
          },
          {
            name: "interest_rate",
            label: "Tasa de Interés (%)",
            type: "number",
            required: true,
          },
          {
            name: "annuity_periods",
            label: "Períodos de Anualidad",
            type: "number",
            required: true,
          }
        );
        break;
      case "compound_interest":
        fields.push(
          {
            name: "initial_investment",
            label: "Inversión Inicial",
            type: "number",
            required: true,
          },
          {
            name: "interest_rate",
            label: "Tasa de Interés (%)",
            type: "number",
            required: true,
          },
          {
            name: "time_periods",
            label: "Períodos de Tiempo",
            type: "number",
            required: true,
          },
          {
            name: "compound_frequency",
            label: "Frecuencia de Capitalización",
            type: "number",
            required: false,
            defaultValue: 1,
          }
        );
        break;
      case "amortization":
        fields.push(
          {
            name: "loan_amount",
            label: "Monto del Préstamo",
            type: "number",
            required: true,
          },
          {
            name: "interest_rate",
            label: "Tasa de Interés (%)",
            type: "number",
            required: true,
          },
          {
            name: "loan_term_years",
            label: "Plazo en Años",
            type: "number",
            required: true,
          }
        );
        break;
    }

    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="relative">
            <input
              {...register(field.name, {
                required: field.required
                  ? `${field.label} es requerido`
                  : false,
                min: { value: 0, message: `${field.label} debe ser mayor a 0` },
              })}
              type={field.type}
              step={field.type === "number" ? "0.01" : undefined}
              defaultValue={field.defaultValue}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              {field.label}
            </label>
            {errors[field.name] && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors[field.name].message}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderResult = () => {
    if (!calculationResult) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Los resultados aparecerán aquí</p>
          </div>
        </div>
      );
    }

    const resultDetails = JSON.parse(calculationResult.result_details || "{}");

    return (
      <div className="h-fit">
        <h3 className="text-lg text-white font-bold mb-4">💰 Resultado</h3>
        <div className="bg-[#2C2F36] p-6 rounded-lg">
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-blue-400 mb-2">
              ${calculationResult.result_value?.toLocaleString()}
            </p>
            <p className="text-gray-400">Valor Calculado</p>
          </div>

          {/* Mostrar detalles específicos según el tipo */}
          <div className="space-y-3">
            {Object.entries(resultDetails).map(
              ([key, value]) =>
                key !== "schedule" && (
                  <div
                    key={key}
                    className="bg-[#17181C] p-4 rounded-lg border border-gray-600"
                  >
                    <span className="text-gray-400 text-sm block mb-1 capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-white font-semibold text-lg">
                      {typeof value === "number"
                        ? `$${value.toLocaleString()}`
                        : value}
                    </span>
                  </div>
                )
            )}
          </div>

          {/* Mostrar tabla de amortización si existe */}
          {resultDetails.schedule && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Tabla de Amortización
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#17181C] text-gray-400">
                      <th className="p-2 text-left">Mes</th>
                      <th className="p-2 text-right">Pago</th>
                      <th className="p-2 text-right">Capital</th>
                      <th className="p-2 text-right">Interés</th>
                      <th className="p-2 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultDetails.schedule
                      .slice(0, 12)
                      .map((payment, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="p-2 text-white">{payment.month}</td>
                          <td className="p-2 text-right text-white">
                            ${payment.payment.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-green-400">
                            ${payment.principal.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-red-400">
                            ${payment.interest.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-white">
                            ${payment.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    {resultDetails.schedule.length > 12 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-2 text-center text-gray-400"
                        >
                          ... y {resultDetails.schedule.length - 12} pagos más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div
        id="fc-history"
        className="bg-[#23262F] p-6 rounded-xl shadow-2xl w-full max-w-7xl mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="text-2xl text-white font-bold">
            Historial de Cálculos
          </h3>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#2C2F36] border border-gray-600 text-white px-3 py-2 rounded-lg"
            >
              <option value="">Todos los tipos</option>
              {calculationTypes?.calculation_types?.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.name}
                </option>
              ))}
            </select>
            {filterType && (
              <button
                onClick={() => setFilterType("")}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
        {calculationsLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (calculationsData?.calculations?.length ?? 0) === 0 ? (
          <p className="text-center text-gray-400">
            Aún no tienes cálculos guardados.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#17181C] text-gray-400">
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-left">Título</th>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-right">Resultado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {calculationsData.calculations.map((calc) => (
                    <tr key={calc.id} className="border-b border-gray-700">
                      <td className="p-3 text-white">
                        {new Date(calc.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 text-white">{calc.title}</td>
                      <td className="p-3 text-gray-300 capitalize">
                        {String(calc.calculation_type).replace(/_/g, " ")}
                      </td>
                      <td className="p-3 text-right text-blue-300">
                        {typeof calc.result_value === "number"
                          ? `$${calc.result_value.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setCalculationResult(calc)}
                            className="bg-blue-400 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                            aria-label={`Ver cálculo ${calc.title}`}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCalculation(calc.id, calc.title)
                            }
                            disabled={isDeleting}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                            aria-label={`Eliminar cálculo ${calc.title}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#17181C] py-8">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-[#23262F] p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              🔐 Autenticación Requerida
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Para usar la calculadora financiera, necesitas iniciar sesión.
            </p>
            <div className="space-y-4">
              <a
                href="/auth/"
                className="inline-block bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
              >
                Iniciar Sesión
              </a>
              <p className="text-gray-500 text-sm">
                O{" "}
                <a
                  href="/auth/sign-up"
                  className="text-blue-400 hover:underline"
                >
                  crear una cuenta
                </a>{" "}
                si no tienes una
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#17181C] py-8">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-1">
                Calculadora Financiera
                <SparklesIcon className="w-8 h-8 text-blue-400 animate-pulse inline-block ml-2" />
              </h1>
              <p className="text-gray-400 text-lg">
                Herramientas profesionales para cálculos financieros
              </p>
              <p className="text-green-400 text-sm mt-1">
                👋 Bienvenido, {user?.first_name || "Usuario"}
              </p>
            </div>
            <div className="hidden md:block">
              <button
                type="button"
                onClick={handleScrollToHistory}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Ver historial ({historyCount})
              </button>
            </div>
          </div>
        </div>

        {/* Historial - PRIMERA SECCIÓN */}
        {renderHistory()}

        {/* Tabs de tipos de cálculo */}
        <div className="w-full max-w-7xl mb-6">
          <div className="bg-[#23262F] rounded-xl shadow-2xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-gray-700">
              {/* Tab de Teoría */}
              <button
                onClick={() => {
                  setShowTheory(true);
                  setSelectedCalculationType("");
                  setCalculationResult(null);
                }}
                className={`flex-1 min-w-fit px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  showTheory
                    ? "bg-blue-400 text-white border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-[#2C2F36]"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5" />
                Teoría
              </button>

              {typesLoading ? (
                <div className="flex justify-center w-full p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                calculationTypes?.calculation_types?.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => {
                      setShowTheory(false);
                      setValue("calculation_type", type.type);
                      setSelectedCalculationType(type.type);
                      setCalculationResult(null);
                    }}
                    className={`flex-1 min-w-fit px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                      selectedCalculationType === type.type && !showTheory
                        ? "bg-blue-400 text-white border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-white hover:bg-[#2C2F36]"
                    }`}
                  >
                    {type.name}
                  </button>
                ))
              )}
            </div>

            {/* Tab Content */}
            {showTheory ? (
              /* Contenido de Teoría */
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl text-white font-bold mb-4">
                    📚 Teoría y Documentación
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Carga un PDF con la teoría financiera que quieres consultar
                  </p>

                  {/* Input para cargar PDF */}
                  <div className="mb-4">
                    <label className="block text-white mb-2 text-sm font-semibold">
                      URL del PDF o cargar archivo:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        placeholder="https://ejemplo.com/documento.pdf"
                        className="flex-1 h-12 rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setPdfUrl("")}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>

                    {/* PDFs de ejemplo */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">
                        📚 Ejemplos (click para cargar):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPdfUrl(
                              "https://www.sec.gov/files/ib_beginners.pdf"
                            )
                          }
                          className="text-left bg-[#2C2F36] text-white px-3 py-2 rounded-lg hover:bg-blue-400/20 transition-colors text-xs"
                        >
                          📄 SEC - Guía para Inversionistas
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPdfUrl(
                              "https://www.investor.gov/sites/investorgov/files/2019-04/Savings-Bond-Basics.pdf"
                            )
                          }
                          className="text-left bg-[#2C2F36] text-white px-3 py-2 rounded-lg hover:bg-blue-400/20 transition-colors text-xs"
                        >
                          📄 Bonos de Ahorro - Básicos
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      💡 Consejo: Carga PDFs de teoría financiera, fórmulas,
                      manuales de inversión, etc.
                    </p>
                  </div>
                </div>

                {/* Visor de PDF */}
                <PDFViewer pdfUrl={pdfUrl} />
              </div>
            ) : (
              /* Contenido de Calculadora - 2 columnas: Formulario y Resultados */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Columna 1: Formulario de entrada */}
                <div>{renderCalculationForm()}</div>

                {/* Columna 2: Resultados */}
                <div>{renderResult()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante de historial */}
      <button
        type="button"
        onClick={handleScrollToHistory}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg font-semibold"
        style={{ zIndex: 9999 }}
        aria-label={`Ver historial (${historyCount})`}
      >
        📊 Historial ({historyCount})
      </button>
    </div>
  );
};

export default AIFInantialCalculator;
