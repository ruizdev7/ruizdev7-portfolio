import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RiPencilLine } from "react-icons/ri";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { updateEmail } from "../../RTK_Query_app/state_slices/auth/authSlice";

import {
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
} from "../../RTK_Query_app/services/user/userApi";

const UpdateModal = ({ isOpen, onClose, title, children }) => (
  <Dialog
    open={isOpen}
    as="div"
    className="relative z-10 focus:outline-none"
    onClose={onClose}
  >
    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-bg_card_dark_mode/5 p-6 backdrop-blur-2xl">
          <DialogTitle as="h3" className="text-base font-medium text-white">
            {title}
          </DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </div>
  </Dialog>
);

const Security = () => {
  const dispatch = useDispatch();

  const [isOpenModalUpdateEmail, setIsOpenModalUpdateEmail] = useState(false);
  const [isOpenModalUpdatePassword, setIsOpenModalUpdatePassword] =
    useState(false);

  const toggleModal = (modalSetter) => () => modalSetter((prev) => !prev);

  const userInfo = useSelector(
    (state) => state.auth.current_user?.user_info || {}
  );

  const truncateString = (str, num) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  const [
    updateUserEmail,
    { error: emailError, isLoading: isEmailLoading, isSuccess: isEmailSuccess },
  ] = useUpdateUserEmailMutation();

  const [
    updateUserPassword,
    {
      error: passwordError,
      isLoading: isPasswordLoading,
      isSuccess: isPasswordSuccess,
    },
  ] = useUpdateUserPasswordMutation();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
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
      await updateUserPassword({
        ccn_user: userInfo?.ccn_user ?? "",
        password: data.password_user,
      }).unwrap();
      setIsOpenModalUpdatePassword(false);
    } catch (error) {
      console.error("Failed to update password: ", error);
      toast.error(
        `❌ Failed to update password: ${error.message || error.status}`,
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

  return (
    <>
      <div className="">
        <h2 className="text-white">Profile</h2>
        {/* Add your Security component content here */}
      </div>
      <div className="my-5">
        <div className="w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-left text-white font-normal w-[100px]">
              Email
            </p>
            <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
              {userInfo.email || "Undefined"}
            </h2>
            <button
              onClick={toggleModal(setIsOpenModalUpdateEmail)}
              className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1"
            >
              <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
            </button>
          </div>
        </div>

        <hr className="my-3 h-0.5 border-t border-dashed border-gray-400" />
        <div className="w-full flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-left text-white font-normal w-[100px]">
              Password
            </p>
            <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
              {truncateString(userInfo.password || "Undefined", 20)}
            </h2>
            <button
              onClick={toggleModal(setIsOpenModalUpdatePassword)}
              className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1"
            >
              <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>
      <UpdateModal
        isOpen={isOpenModalUpdateEmail}
        onClose={toggleModal(setIsOpenModalUpdateEmail)}
        title="Update Email Address"
      >
        <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
          {/** EMAIL ADDRESS */}
          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-400">
              Email address
            </label>
            <div className="mt-1">
              <input
                {...registerEmail("email_user", {
                  required: {
                    value: true,
                    message: "Email is required!!",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Email not valid!!",
                  },
                })}
                type="email"
                className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
              {errorsEmail.email_user && (
                <span className="text-[tomato] font-sans text-xs font-extrabold">
                  {errorsEmail.email_user.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 focus:outline-1 focus:outline-white"
            >
              Got it, thanks!
            </button>
          </div>
        </form>
        {emailError && (
          <p className="text-red-500 mt-2">
            {emailError.data?.message || emailError.error}
          </p>
        )}
      </UpdateModal>
      <UpdateModal
        isOpen={isOpenModalUpdatePassword}
        onClose={toggleModal(setIsOpenModalUpdatePassword)}
        title="Update Password"
      >
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          {/** PASSWORD */}
          <div className="sm:col-span-3">
            <label className="block text-sm/6 font-medium text-gray-400">
              Password
            </label>
            <div className="mt-1">
              <input
                {...registerPassword("password_user", {
                  required: {
                    value: true,
                    message: "Password is required!!",
                  },
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long!!",
                  },
                })}
                type="password"
                className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
              {errorsPassword.password_user && (
                <span className="text-[tomato] font-sans text-xs font-extrabold">
                  {errorsPassword.password_user.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 focus:outline-1 focus:outline-white"
            >
              Got it, thanks!
            </button>
          </div>
        </form>
        {passwordError && (
          <p className="text-red-500 mt-2">
            {passwordError.data?.message || passwordError.error}
          </p>
        )}
      </UpdateModal>
    </>
  );
};

export default Security;
