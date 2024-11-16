import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import dev_ops from "../../assets/img/DevOps-Tools.png";
import { usePostUserMutation } from "../../RTK_Query_app/services/user/userApi";

const SignUp = () => {
  const [createNewUser, { isLoading, isError, isSuccess }] =
    usePostUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Items loaded successfully!");
    }

    if (isError) {
      toast.error(
        `Error: ${isError?.data?.message || "Failed to fetch items"}`
      );
    }
  }, [isSuccess, isError]);

  const onSubmit = handleSubmit((data) => {
    if (data) return <div>Loading...</div>;
    console.log(data.name_user);
    createNewUser({
      name_user: data.name_user,
      middle_name_user: data.middle_name_user,
      last_name_user: data.last_name_user,
      email_user: data.email_user,
      password_user: data.password_user,
    });
    reset();
  });

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-auto p-[50px]">
      <div>
        <form onSubmit={onSubmit}>
          <div className="border-t border-gray-900/10 my-5">
            <h2 className="my-2 text-base/7 font-semibold text-gray-900">
              PERSONAL INFORMATION
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/** FIRST NAME */}
              <div className="sm:col-span-3">
                <div className="my-2">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    First Name
                  </label>
                  <input
                    {...register("name_user", {
                      required: {
                        value: true,
                        message: "First name is required!!",
                      },
                      minLength: {
                        value: 3,
                        message: "First name must have atleast 3 characters !!",
                      },
                      maxLength: {
                        value: 20,
                        message: "First name must have max 20 characters !!",
                      },
                    })}
                    type="text"
                    className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.name_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.name_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/** MIDDLE NAME */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Middle Name
                </label>
                <div className="my-2">
                  <input
                    {...register("middle_name_user", {
                      required: {
                        value: false,
                        message: "Email is required!!",
                      },
                      minLength: {
                        value: 3,
                        message: "Middle name required min 3 characters!!",
                      },
                      maxLength: {
                        value: 20,
                        message: "Middle name required max 20 characters!!",
                      },
                    })}
                    type="text"
                    className="block w-full p-3  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.middle_name_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.middle_name_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/** LAST NAME */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Last Name
                </label>
                <div className="my-1">
                  <input
                    {...register("last_name_user", {
                      required: {
                        value: true,
                        message: "Last name is required!!",
                      },
                      minLength: {
                        value: 3,
                        message: "Last name required min 3 characters!!",
                      },
                      maxLength: {
                        value: 20,
                        message: "Last name required max 20 characters!!",
                      },
                    })}
                    type="text"
                    className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.last_name_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.last_name_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/** EMMAIL ADDRESS */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register("email_user", {
                      required: {
                        value: true,
                        message: "Email is required!!",
                      },
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Email not valid!!",
                      },
                    })}
                    type="email"
                    className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.email_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.email_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/** PASSWORD */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    {...register("password_user", {
                      required: {
                        value: true,
                        message: "Password is required!!",
                      },
                    })}
                    type="password"
                    className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.password_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.password_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/**CONFIRM  PASSWORD */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    {...register("confirm_password_user", {
                      required: {
                        value: true,
                        message: "Confirm password is required!!",
                      },
                      validate: (value) =>
                        value === watch("password_user") ||
                        "Passwords are not the same!!",
                    })}
                    type="password"
                    className="block w-full p-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                  {errors.confirm_password_user && (
                    <span className="text-[tomato] font-sans text-xs font-extrabold">
                      {errors.confirm_password_user.message}
                    </span>
                  )}
                </div>
              </div>
              {/** TERMS AND CONDITIONS */}
              <div className="col-span-full flex justify-between">
                <div className="flex flex-row">
                  <div className="mx-5">
                    <input
                      {...register("terms_and_conditions", {
                        required: {
                          value: true,
                          message: "Accept terms and conditions!!",
                        },
                      })}
                      type="checkbox"
                      className="rounded-md p-3 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                  </div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    <span className="flex items-center gap-2">
                      Terms and Conditions{" "}
                      <Link
                        to="/auth/terms-and-conditions"
                        className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
                      >
                        Click Here!
                      </Link>
                    </span>
                    {errors.terms_and_conditions && (
                      <>
                        <span className="text-[tomato] font-sans text-xs font-extrabold">
                          {errors.terms_and_conditions.message}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
                SEND
              </button>
            </div>
          </div>
        </form>
      </div>
      {/**
        <img className="object-contain w-[500px]" src={dev_ops} />
        */}
      <div className="flex flex-col items-center gap-4">
        <span className="flex items-center gap-2">
          You already have an account{" "}
          <Link
            to="/auth/"
            className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
          >
            Sign In
          </Link>
        </span>
      </div>
      {/**<pre className="p-5">{JSON.stringify(watch(), null, 2)}</pre>; */}
    </div>
  );
};

export default SignUp;
