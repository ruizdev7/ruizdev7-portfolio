import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { RiPencilLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateEmail } from "../../RTK_Query_app/state_slices/auth/authSlice";
import PropTypes from "prop-types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  KeyIcon,
  ClockIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../RTK_Query_app/services/user/userApi";
import {
  selectToken,
  selectRefreshToken,
  selectRoles,
  selectPermissions,
  selectIsAuthenticated,
} from "../../RTK_Query_app/state_slices/authSlice";

const UpdateModal = ({ isOpen, onClose, title, children }) => (
  <Dialog
    open={isOpen}
    as="div"
    className="relative z-50 focus:outline-none"
    onClose={onClose}
  >
    <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-sm bg-[#23262F] border-2 border-gray-600 p-8 shadow-2xl">
          <DialogTitle
            as="h3"
            className="text-2xl text-white font-bold text-center mb-6 hover:text-blue-400 transition-colors"
          >
            {title}
          </DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </div>
  </Dialog>
);

UpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const Security = () => {
  const dispatch = useDispatch();

  const [isOpenModalUpdateEmail, setIsOpenModalUpdateEmail] = useState(false);
  const [isOpenModalUpdatePassword, setIsOpenModalUpdatePassword] =
    useState(false);
  const [isOpenModalForgotPassword, setIsOpenModalForgotPassword] =
    useState(false);
  const [isOpenModalResetPassword, setIsOpenModalResetPassword] =
    useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);

  const toggleModal = (modalSetter) => () => modalSetter((prev) => !prev);

  // Get user info from multiple possible sources
  const userInfo = useSelector((state) => {
    return (
      state.auth?.current_user?.user_info ||
      state.auth?.user ||
      state.auth?.user_info ||
      {}
    );
  });

  const token = useSelector(selectToken);
  const refreshToken = useSelector(selectRefreshToken);
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get last activity from localStorage or state
  const [lastActivity, setLastActivity] = useState(null);
  useEffect(() => {
    const authState = localStorage.getItem("auth_state");
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        if (parsed.lastActivity) {
          setLastActivity(new Date(parsed.lastActivity));
        }
      } catch (e) {
        console.error("Error parsing auth_state:", e);
      }
    }
  }, []);

  const [updateUserEmail, { error: emailError, isSuccess: isEmailSuccess }] =
    useUpdateUserEmailMutation();

  const [
    updateUserPassword,
    { error: passwordError, isSuccess: isPasswordSuccess },
  ] = useUpdateUserPasswordMutation();

  const [
    forgotPassword,
    { error: forgotPasswordError, isSuccess: isForgotPasswordSuccess },
  ] = useForgotPasswordMutation();

  const [
    resetPassword,
    { error: resetPasswordError, isSuccess: isResetPasswordSuccess },
  ] = useResetPasswordMutation();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
    setValue: setEmailValue,
  } = useForm({
    defaultValues: {
      email_user: "",
    },
  });

  // Reset form when modal opens or userInfo changes
  useEffect(() => {
    const currentEmail = userInfo?.email || userInfo?.email_user || "";
    if (isOpenModalUpdateEmail) {
      setEmailValue("email_user", currentEmail);
    }
  }, [
    isOpenModalUpdateEmail,
    userInfo?.email,
    userInfo?.email_user,
    setEmailValue,
  ]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm();

  const {
    register: registerForgotPassword,
    handleSubmit: handleSubmitForgotPassword,
    formState: { errors: errorsForgotPassword },
  } = useForm();

  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPassword,
    formState: { errors: errorsResetPassword },
  } = useForm();

  const onSubmitEmail = async (data) => {
    try {
      await updateUserEmail({
        ccn_user: userInfo?.ccn_user ?? "",
        email: data.email_user,
      }).unwrap();
      dispatch(updateEmail({ email: data.email_user }));
      setIsOpenModalUpdateEmail(false);
    } catch (error) {
      console.error("Failed to update email: ", error);
      toast.error(
        `❌ Failed to update email: ${error.message || error.status}`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      console.log("🔒 Updating password with data:", {
        ccn_user: userInfo?.ccn_user,
        password_length: data.password_user?.length,
        current_password_length: data.current_password?.length,
      });

      await updateUserPassword({
        ccn_user: userInfo?.ccn_user ?? "",
        password: data.password_user,
        current_password: data.current_password,
      }).unwrap();

      setIsOpenModalUpdatePassword(false);
    } catch (error) {
      console.error("❌ Failed to update password: ", error);
      console.error("❌ Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });

      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.data?.details ||
        error?.message ||
        "Unknown error";

      toast.error(`❌ Failed to update password: ${errorMessage}`, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
    }
  };

  const onSubmitForgotPassword = async (data) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setIsOpenModalForgotPassword(false);
    } catch (error) {
      console.error("Failed to send reset email: ", error);
      toast.error(
        `❌ Failed to send reset email: ${
          error?.data?.error ||
          error?.data?.message ||
          error.message ||
          "Unknown error"
        }`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  };

  const onSubmitResetPassword = async (data) => {
    try {
      // Get token from URL or form
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token") || data.reset_token;

      if (!token) {
        toast.error("Reset token is required", {
          position: "bottom-center",
          autoClose: 5000,
        });
        return;
      }

      await resetPassword({
        token: token,
        new_password: data.new_password,
      }).unwrap();

      setIsOpenModalResetPassword(false);

      // Redirect to login or show success
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    } catch (error) {
      console.error("Failed to reset password: ", error);
      toast.error(
        `❌ Failed to reset password: ${
          error?.data?.error ||
          error?.data?.message ||
          error.message ||
          "Unknown error"
        }`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  };

  useEffect(() => {
    if (isEmailSuccess) {
      toast.success("📧 Email updated successfully!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [isEmailSuccess]);

  useEffect(() => {
    if (isPasswordSuccess) {
      toast.success("🔒 Password updated successfully!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [isPasswordSuccess]);

  useEffect(() => {
    if (isForgotPasswordSuccess) {
      toast.success("📧 Password reset email sent! Check your inbox.", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [isForgotPasswordSuccess]);

  useEffect(() => {
    if (isResetPasswordSuccess) {
      toast.success("✅ Password reset successfully! Redirecting to login...", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [isResetPasswordSuccess]);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Get token expiry info (if available in token)
  const getTokenInfo = (tokenString) => {
    if (!tokenString) return { expires: null, issued: null };
    try {
      const parts = tokenString.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          expires: payload.exp ? new Date(payload.exp * 1000) : null,
          issued: payload.iat ? new Date(payload.iat * 1000) : null,
        };
      }
    } catch (e) {
      // Token might not be JWT or might be encrypted
    }
    return { expires: null, issued: null };
  };

  const tokenInfo = getTokenInfo(token);
  const refreshTokenInfo = getTokenInfo(refreshToken);

  // Truncate token for display
  const truncateToken = (tokenString, show = false) => {
    if (!tokenString) return "Not available";
    if (show) {
      return `${tokenString.substring(0, 20)}...${tokenString.substring(
        tokenString.length - 20
      )}`;
    }
    return "••••••••••••••••••••";
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-2">
            Security Settings
          </h2>
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Manage your email, password, and authentication settings
          </p>
        </div>

        {/* Authentication Status */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-do_blue dark:text-blue-400" />
            Authentication Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
                <LockClosedIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                  Authentication Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      isAuthenticated
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </span>
                </div>
              </div>
            </div>

            {lastActivity && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
                  <ClockIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                    Last Activity
                  </p>
                  <p className="text-sm text-do_text_light dark:text-do_text_dark">
                    {formatDate(lastActivity)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Credentials */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
            Account Credentials
          </h3>
          <div className="space-y-4">
            {/* Email Section */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-sm border border-do_border_light dark:border-do_border_dark hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                  Email Address
                </p>
                <p className="text-sm text-do_text_light dark:text-do_text_dark break-all">
                  {userInfo?.email || userInfo?.email_user || "Not set"}
                </p>
              </div>
              <button
                onClick={toggleModal(setIsOpenModalUpdateEmail)}
                className="flex-shrink-0 p-2 hover:bg-do_border_light dark:hover:bg-do_border_dark rounded-sm transition-colors"
                title="Edit email"
              >
                <RiPencilLine className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-blue-400" />
              </button>
            </div>

            {/* Password Section */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-sm border border-do_border_light dark:border-do_border_dark hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                  Password
                </p>
                <p className="text-sm text-do_text_light dark:text-do_text_dark">
                  {isAuthenticated ? "••••••••" : "Not set"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleModal(setIsOpenModalUpdatePassword)}
                  className="flex-shrink-0 p-2 hover:bg-do_border_light dark:hover:bg-do_border_dark rounded-sm transition-colors"
                  title="Edit password"
                >
                  <RiPencilLine className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-blue-400" />
                </button>
                <button
                  onClick={toggleModal(setIsOpenModalForgotPassword)}
                  className="flex-shrink-0 px-3 py-2 text-xs font-medium text-do_blue dark:text-blue-400 hover:bg-do_blue/10 dark:hover:bg-blue-400/10 rounded-sm transition-colors"
                  title="Forgot password"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Password Recovery Actions */}
          <div className="mt-4 p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-amber-50 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-2">
              Having trouble with your password?
            </p>
            <button
              onClick={toggleModal(setIsOpenModalForgotPassword)}
              className="text-sm font-medium text-do_blue dark:text-blue-400 hover:underline"
            >
              Request password reset
            </button>
          </div>
        </div>

        {/* Session Tokens */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-do_blue dark:text-blue-400" />
            Session Tokens
          </h3>
          <div className="space-y-4">
            {/* JWT Token */}
            <div className="p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-do_bg_light dark:bg-do_bg_dark">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                    JWT Access Token
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-do_text_gray_light dark:text-do_text_gray_dark break-all">
                      {truncateToken(token, showToken)}
                    </p>
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="flex-shrink-0 p-1 hover:bg-do_border_light dark:hover:bg-do_border_dark rounded transition-colors"
                      title={showToken ? "Hide token" : "Show token"}
                    >
                      {showToken ? (
                        <EyeSlashIcon className="w-4 h-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {tokenInfo.issued && (
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mt-2">
                  Issued: {formatDate(tokenInfo.issued)}
                  {tokenInfo.expires &&
                    ` • Expires: ${formatDate(tokenInfo.expires)}`}
                </p>
              )}
            </div>

            {/* Refresh Token */}
            <div className="p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-do_bg_light dark:bg-do_bg_dark">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                    Refresh Token
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-do_text_gray_light dark:text-do_text_gray_dark break-all">
                      {truncateToken(refreshToken, showRefreshToken)}
                    </p>
                    <button
                      onClick={() => setShowRefreshToken(!showRefreshToken)}
                      className="flex-shrink-0 p-1 hover:bg-do_border_light dark:hover:bg-do_border_dark rounded transition-colors"
                      title={showRefreshToken ? "Hide token" : "Show token"}
                    >
                      {showRefreshToken ? (
                        <EyeSlashIcon className="w-4 h-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {refreshTokenInfo.issued && (
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mt-2">
                  Issued: {formatDate(refreshTokenInfo.issued)}
                  {refreshTokenInfo.expires &&
                    ` • Expires: ${formatDate(refreshTokenInfo.expires)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Summary */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
            Security Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Roles
              </p>
              <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                {roles.length || 0}
              </p>
            </div>
            <div className="p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Permissions
              </p>
              <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                {permissions.length || 0}
              </p>
            </div>
            <div className="p-4 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Resources
              </p>
              <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                {new Set(permissions.map((p) => p.resource)).size || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Update Modal */}
      <UpdateModal
        isOpen={isOpenModalUpdateEmail}
        onClose={toggleModal(setIsOpenModalUpdateEmail)}
        title="Update Email Address"
      >
        <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
          <div className="space-y-6">
            {/* Email Input with Floating Label */}
            <div className="relative w-full">
              <input
                {...registerEmail("email_user", {
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Email is not valid",
                  },
                })}
                type="email"
                className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                placeholder=" "
                defaultValue={userInfo?.email || userInfo?.email_user || ""}
              />
              <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                Email Address
              </label>
              {errorsEmail.email_user && (
                <span className="text-[tomato] text-xs font-semibold block mt-1">
                  {errorsEmail.email_user.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={toggleModal(setIsOpenModalUpdateEmail)}
              className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold bg-blue-400 text-white rounded-sm hover:bg-blue-500 transition-colors"
            >
              Update Email
            </button>
          </div>
        </form>
        {emailError && (
          <p className="text-red-500 mt-2 text-sm">
            {emailError.data?.message || emailError.error}
          </p>
        )}
      </UpdateModal>

      {/* Password Update Modal */}
      <UpdateModal
        isOpen={isOpenModalUpdatePassword}
        onClose={toggleModal(setIsOpenModalUpdatePassword)}
        title="Update Password"
      >
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <div className="space-y-6">
            {/* Current Password Input with Floating Label */}
            <div className="relative w-full">
              <input
                {...registerPassword("current_password", {
                  required: {
                    value: true,
                    message: "Current password is required",
                  },
                })}
                type="password"
                className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                placeholder=" "
              />
              <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                Current Password
              </label>
              {errorsPassword.current_password && (
                <span className="text-[tomato] text-xs font-semibold block mt-1">
                  {errorsPassword.current_password.message}
                </span>
              )}
            </div>

            {/* New Password Input with Floating Label */}
            <div className="relative w-full">
              <input
                {...registerPassword("password_user", {
                  required: {
                    value: true,
                    message: "New password is required",
                  },
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
                type="password"
                className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                placeholder=" "
              />
              <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                New Password
              </label>
              {errorsPassword.password_user && (
                <span className="text-[tomato] text-xs font-semibold block mt-1">
                  {errorsPassword.password_user.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={toggleModal(setIsOpenModalUpdatePassword)}
              className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold bg-blue-400 text-white rounded-sm hover:bg-blue-500 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
        {passwordError && (
          <p className="text-red-500 mt-2 text-sm">
            {passwordError.data?.error ||
              passwordError.data?.message ||
              passwordError.error}
          </p>
        )}
      </UpdateModal>

      {/* Forgot Password Modal */}
      <UpdateModal
        isOpen={isOpenModalForgotPassword}
        onClose={toggleModal(setIsOpenModalForgotPassword)}
        title="Forgot Password"
      >
        <form onSubmit={handleSubmitForgotPassword(onSubmitForgotPassword)}>
          <div className="space-y-6">
            <p className="text-sm text-gray-400 text-center mb-4">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            {/* Email Input with Floating Label */}
            <div className="relative w-full">
              <input
                {...registerForgotPassword("email", {
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Email is not valid",
                  },
                })}
                type="email"
                className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                placeholder=" "
              />
              <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                Email Address
              </label>
              {errorsForgotPassword.email && (
                <span className="text-[tomato] text-xs font-semibold block mt-1">
                  {errorsForgotPassword.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={toggleModal(setIsOpenModalForgotPassword)}
              className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold bg-blue-400 text-white rounded-sm hover:bg-blue-500 transition-colors"
            >
              Send Reset Link
            </button>
          </div>
        </form>
        {forgotPasswordError && (
          <p className="text-red-500 mt-2 text-sm">
            {forgotPasswordError.data?.error ||
              forgotPasswordError.data?.message ||
              forgotPasswordError.error}
          </p>
        )}
      </UpdateModal>

      {/* Reset Password Modal */}
      <UpdateModal
        isOpen={isOpenModalResetPassword}
        onClose={toggleModal(setIsOpenModalResetPassword)}
        title="Reset Password"
      >
        <form onSubmit={handleSubmitResetPassword(onSubmitResetPassword)}>
          <div className="space-y-6">
            <p className="text-sm text-gray-400 text-center mb-4">
              Enter your new password. Make sure it&apos;s at least 8 characters
              long.
            </p>

            {/* Reset Token (if not in URL) */}
            {!new URLSearchParams(window.location.search).get("token") && (
              <div className="relative w-full">
                <input
                  {...registerResetPassword("reset_token", {
                    required: {
                      value: !new URLSearchParams(window.location.search).get(
                        "token"
                      ),
                      message: "Reset token is required",
                    },
                  })}
                  type="text"
                  className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                  defaultValue={
                    new URLSearchParams(window.location.search).get("token") ||
                    ""
                  }
                />
                <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                  Reset Token
                </label>
                {errorsResetPassword.reset_token && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errorsResetPassword.reset_token.message}
                  </span>
                )}
              </div>
            )}

            {/* New Password Input with Floating Label */}
            <div className="relative w-full">
              <input
                {...registerResetPassword("new_password", {
                  required: {
                    value: true,
                    message: "New password is required",
                  },
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
                type="password"
                className="peer h-12 w-full rounded-sm border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                placeholder=" "
              />
              <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                New Password
              </label>
              {errorsResetPassword.new_password && (
                <span className="text-[tomato] text-xs font-semibold block mt-1">
                  {errorsResetPassword.new_password.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={toggleModal(setIsOpenModalResetPassword)}
              className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold bg-blue-400 text-white rounded-sm hover:bg-blue-500 transition-colors"
            >
              Reset Password
            </button>
          </div>
        </form>
        {resetPasswordError && (
          <p className="text-red-500 mt-2 text-sm">
            {resetPasswordError.data?.error ||
              resetPasswordError.data?.message ||
              resetPasswordError.error}
          </p>
        )}
      </UpdateModal>
    </>
  );
};

export default Security;
