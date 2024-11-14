import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import dev_ops from "../../assets/img/DevOps-Tools.png";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  console.log(errors);

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <div className="min-h-screen grid md:grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-evenly">
        <div className="w-[800px]">
          <h1 className="text-4xl text-light_mode_title_text font-extrabold">
            WELCOME !!!
          </h1>
          <h2 className="text-2xl">SIGN UP</h2>
          <p className="text-sm/6 text-gray-600">
            Learning new things sharpens the mind, boosts confidence, and opens
            up new personal and professional opportunities. It builds
            adaptability, enabling people to thrive in changing environments.
            Each new skill or insight fosters curiosity and enriches life,
            making it more fulfilling and dynamic.
          </p>
        </div>
        <img className="object-contain w-[500px]" src={dev_ops} />
      </div>
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
                        required: true,
                      })}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                    {errors.name_user && (
                      <span className="text-[tomato] font-sans text-sm">
                        {" "}
                        First name is required!!{" "}
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
                      {...register("middle_name_user")}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
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
                        required: true,
                      })}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                    {errors.last_name_user && (
                      <span className="text-[tomato] font-sans text-sm">
                        {" "}
                        Last name is required!!{" "}
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
                        required: true,
                      })}
                      type="email"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                    {errors.email_user && (
                      <span className="text-[tomato] font-sans text-sm">
                        {" "}
                        Email is required!!{" "}
                      </span>
                    )}
                  </div>
                </div>
                {/** STREET ADDRESS */}
                <div className="col-span-full">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Street address
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("street_address_user")}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
                {/** COUNTRY */}
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Country
                  </label>
                  <div className="mt-1">
                    <select
                      {...register("country_user", {
                        required: true,
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:tex"
                    >
                      <option value="DE">Germany</option>
                      <option value="PL">Poland</option>
                      <option value="CO">Colombia</option>
                    </select>
                    {errors.country_user && (
                      <span className="text-[tomato] font-sans text-sm">
                        {" "}
                        Country is required!!{" "}
                      </span>
                    )}
                  </div>
                </div>

                {/** STATE / PROVINCE */}
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    State / Province
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("state_province_user")}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
                {/** CITY */}
                <div className="sm:col-span-3 sm:col-start-1">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("city_user")}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
                {/** ZIP / POSTAL CODE */}
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    ZIP / Postal code
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("zip_code_user")}
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
                {/** TERMS AND CONDITIONS */}
                <div className="col-span-full flex justify-between">
                  <div className="flex flex-row">
                    <div className="mx-5">
                      <input
                        {...register("terms_and_conditions")}
                        type="checkbox"
                        className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
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
      </div>
    </div>
  );
};

export default SignUp;
