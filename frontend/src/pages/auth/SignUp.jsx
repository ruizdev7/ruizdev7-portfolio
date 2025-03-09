import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
    if (isSuccess) toast.success("Registration successful!");
    if (isError)
      toast.error(`Error: ${isError?.data?.message || "Registration failed"}`);
  }, [isSuccess, isError]);

  const onSubmit = handleSubmit((data) => {
    createNewUser({
      first_name: data.name_user,
      middle_name: data.middle_name_user,
      last_name: data.last_name_user,
      email: data.email_user,
      password: data.password_user,
    });
    reset();
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#17181C]">
      <div className="bg-[#23262F] p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-4xl text-white font-bold text-center hover:text-blue-400 transition-colors">
          Sign Up
        </h2>
        <h1 className="text-2xl text-center uppercase font-bold tracking-[5px] text-white mt-2">
          Ruizdev7<span className="ml-2 text-blue-400">Portfolio</span>
        </h1>

        <form
          onSubmit={onSubmit}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
        >
          {/* First Name - Full width on all screens */}
          <div className="relative md:col-span-2">
            <input
              {...register("name_user", {
                required: "First name is required!!",
                minLength: { value: 3, message: "Minimum 3 characters!" },
                maxLength: { value: 20, message: "Maximum 20 characters!" },
              })}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              First Name
            </label>
            {errors.name_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.name_user.message}
              </span>
            )}
          </div>

          {/* Middle Name */}
          <div className="relative">
            <input
              {...register("middle_name_user", {
                minLength: { value: 3, message: "Minimum 3 characters!" },
                maxLength: { value: 20, message: "Maximum 20 characters!" },
              })}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Middle Name
            </label>
            {errors.middle_name_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.middle_name_user.message}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="relative">
            <input
              {...register("last_name_user", {
                required: "Last name is required!!",
                minLength: { value: 3, message: "Minimum 3 characters!" },
                maxLength: { value: 20, message: "Maximum 20 characters!" },
              })}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Last Name
            </label>
            {errors.last_name_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.last_name_user.message}
              </span>
            )}
          </div>

          {/* Email - Full width on all screens */}
          <div className="relative md:col-span-2">
            <input
              {...register("email_user", {
                required: "Email is required!!",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address!",
                },
              })}
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Email Address
            </label>
            {errors.email_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.email_user.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              {...register("password_user", {
                required: "Password is required!!",
                minLength: { value: 6, message: "Minimum 6 characters!" },
              })}
              type="password"
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Password
            </label>
            {errors.password_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.password_user.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              {...register("confirm_password_user", {
                required: "Please confirm your password!",
                validate: (value) =>
                  value === watch("password_user") || "Passwords don't match!",
              })}
              type="password"
              className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
              placeholder=" "
            />
            <label
              className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
              peer-focus:text-blue-400 bg-[#2C2F36]"
            >
              Confirm Password
            </label>
            {errors.confirm_password_user && (
              <span className="text-[tomato] text-xs font-semibold block mt-1">
                {errors.confirm_password_user.message}
              </span>
            )}
          </div>

          {/* Terms and Conditions - Full width */}
          <div className="flex items-start space-x-3 md:col-span-2">
            <input
              {...register("terms_and_conditions", {
                required: "You must accept the terms!",
              })}
              type="checkbox"
              className="mt-1 h-5 w-5 rounded-full border-2 border-gray-600 bg-[#2C2F36] focus:ring-blue-400"
            />
            <div className="flex-1">
              <label className="text-sm text-gray-400">
                I agree to the{" "}
                <Link
                  to="/auth/terms-and-conditions"
                  className="text-blue-400 hover:text-blue-500 hover:underline"
                >
                  Terms and Conditions
                </Link>
              </label>
              {errors.terms_and_conditions && (
                <span className="text-[tomato] text-xs font-semibold block">
                  {errors.terms_and_conditions.message}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button - Full width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-12 bg-blue-400 text-white rounded-lg font-semibold
              hover:bg-blue-500 transition-colors flex items-center justify-center"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-gray-400 md:col-span-2">
          Already have an account?{" "}
          <Link
            to="/auth/"
            className="text-blue-400 hover:text-blue-500 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
