import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import {
  useGetPumpsQuery,
  useCreatePumpMutation,
  useUpdatePumpMutation,
  useDeletePumpMutation,
} from "../../RTK_Query_app/services/pump/pumpApi";
import { usePermissions } from "../../hooks/usePermissions";
import {
  PencilIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import CRUDContent from "../../components/pump/CRUDContent";
import PhotoModal from "../../components/pump/PhotoModal";
import PumpModal from "../../components/pump/PumpModal";

const PumpCRUD = () => {
  const { canRead } = usePermissions();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPump, setEditingPump] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPump, setSelectedPump] = useState(null);
  const [photoOrder, setPhotoOrder] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state management
  const [syncState, setSyncState] = useState("idle");
  const [syncTimeout, setSyncTimeout] = useState(null);

  const {
    data: pumpsResponse,
    isLoading: pumpsLoading,
    error: pumpsError,
    refetch: refetchPumps,
  } = useGetPumpsQuery();

  const [createPump, { isLoading: creating }] = useCreatePumpMutation();
  const [updatePump, { isLoading: updating }] = useUpdatePumpMutation();
  const [deletePump] = useDeletePumpMutation();

  // Extract data correctly from response
  const rowData = pumpsResponse?.Pumps || [];

  // Status colors configuration
  const statusColors = {
    Active: {
      container: "flex items-center gap-2 text-green-600 dark:text-green-400",
      dot: "w-2 h-2 bg-green-500 rounded-full",
      text: "text-sm font-medium",
    },
    Maintenance: {
      container: "flex items-center gap-2 text-yellow-600 dark:text-yellow-400",
      dot: "w-2 h-2 bg-yellow-500 rounded-full",
      text: "text-sm font-medium",
    },
    Repair: {
      container: "flex items-center gap-2 text-red-600 dark:text-red-400",
      dot: "w-2 h-2 bg-red-500 rounded-full",
      text: "text-sm font-medium",
    },
    Inactive: {
      container: "flex items-center gap-2 text-gray-600 dark:text-gray-400",
      dot: "w-2 h-2 bg-gray-500 rounded-full",
      text: "text-sm font-medium",
    },
    Testing: {
      container: "flex items-center gap-2 text-purple-600 dark:text-purple-400",
      dot: "w-2 h-2 bg-purple-500 rounded-full",
      text: "text-sm font-medium",
    },
    Out_of_Service: {
      container: "flex items-center gap-2 text-orange-600 dark:text-orange-400",
      dot: "w-2 h-2 bg-orange-500 rounded-full",
      text: "text-sm font-medium",
    },
  };

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      const hasDarkClassHtml = htmlElement.classList.contains("dark");
      const hasDarkClassBody = bodyElement.classList.contains("dark");

      const htmlTheme = htmlElement.getAttribute("data-theme");
      const bodyTheme = bodyElement.getAttribute("data-theme");

      let newDarkMode;

      if (hasDarkClassHtml || hasDarkClassBody) {
        newDarkMode = true;
      } else if (htmlTheme === "light" || bodyTheme === "light") {
        newDarkMode = false;
      } else if (htmlTheme === "dark" || bodyTheme === "dark") {
        newDarkMode = true;
      } else {
        newDarkMode = true;
      }

      setIsDarkMode(newDarkMode);
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const handleEdit = (pump) => {
    console.log("🔍 handleEdit - Pump data:", pump);
    console.log("🔍 handleEdit - Pump status:", pump.status);

    setEditingPump(pump);
    setValue("serial_number", pump.serial_number);
    setValue("model", pump.model);
    setValue("location", pump.location);
    setValue("status", pump.status);
    setValue("flow_rate", pump.flow_rate);
    setValue("pressure", pump.pressure);
    setValue("power", pump.power);
    setValue("voltage", pump.voltage);
    setValue("efficiency", pump.efficiency);
    setValue("current", pump.current);
    setValue("power_factor", pump.power_factor);

    console.log("🔍 handleEdit - Form values set, opening modal...");
    setIsOpen(true);
  };

  const handleDelete = async (ccn_pump) => {
    if (window.confirm("Are you sure you want to delete this pump?")) {
      try {
        console.log("🗑️ Starting deletion of pump:", ccn_pump);
        setIsDeleting(true);

        await deletePump(ccn_pump).unwrap();
        console.log("✅ Pump deletion API call successful");

        await refetchPumps();
        console.log("🔄 Data refetched successfully");

        toast.success("Pump deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error("Error deleting pump:", error);
        toast.error("Error deleting the pump. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewPhotos = (pump) => {
    console.log("📸 Opening photo modal for pump:", pump.ccn_pump);
    console.log("📸 Photo URLs:", pump.photo_urls);
    setSelectedPump(pump);
    setPhotoOrder(pump.photo_urls || []);
    setShowPhotoModal(true);
  };

  const handleViewPumpDetails = (pump) => {
    console.log("🔍 Viewing pump details:", pump);
    // Implement pump details view logic here
    toast.info("Pump details view - Feature coming soon!");
  };

  const handleUploadPhotos = (pump) => {
    console.log("📤 Opening photo upload for pump:", pump.ccn_pump);
    // Implement photo upload logic here
    toast.info("Photo upload - Feature coming soon!");
  };

  const onSubmit = async (data) => {
    try {
      if (editingPump) {
        await updatePump({
          ccn_pump: editingPump.ccn_pump,
          ...data,
        }).unwrap();
        toast.success("Pump updated successfully!");
      } else {
        await createPump(data).unwrap();
        toast.success("Pump created successfully!");
      }

      setIsOpen(false);
      setEditingPump(null);
      reset();
      refetchPumps();
    } catch (error) {
      console.error("Error saving pump:", error);
      toast.error("Error saving the pump. Please try again.");
    }
  };

  if (!canRead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CRUDContent
          isLoading={pumpsLoading}
          isError={!!pumpsError}
          error={pumpsError}
          refetch={() => window.location.reload()}
          rowData={rowData}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          setIsOpen={setIsOpen}
          syncState={syncState}
          lastSyncTime={new Date().toISOString()}
          syncTimeout={syncTimeout}
          setSyncState={setSyncState}
          setSyncTimeout={setSyncTimeout}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleUploadPhotos={handleUploadPhotos}
          handleViewPumpDetails={handleViewPumpDetails}
          handleViewPhotos={handleViewPhotos}
          isDeleting={isDeleting}
        />

        {/* Pump Modal */}
        {isOpen && (
          <PumpModal
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
              setEditingPump(null);
              reset();
            }}
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            editingPump={editingPump}
            creating={creating}
            updating={updating}
          />
        )}

        {/* Photo Modal */}
        {showPhotoModal && selectedPump && (
          <PhotoModal
            isOpen={showPhotoModal}
            onClose={() => {
              setShowPhotoModal(false);
              setSelectedPump(null);
              setPhotoOrder([]);
            }}
            pump={selectedPump}
            photoOrder={photoOrder}
            setPhotoOrder={setPhotoOrder}
          />
        )}
      </div>
    </div>
  );
};

export default PumpCRUD;
