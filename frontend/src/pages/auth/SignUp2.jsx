import React from "react";

const SignUp2 = () => {
  return (
    <div>
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
    </div>
  );
};

export default SignUp2;
