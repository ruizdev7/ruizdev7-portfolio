import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useLoginUserMutation } from "../../RTK_Query_app/services/auth/AuthAPI";
import React, { useState, useEffect } from "react";
import {
  setCredentials,
  cleanCredentials,
} from "../../RTK_Query_app/state_slices/auth/authSlice";

const SignUp = () => {
  const dispatch = useDispatch();

  const [email_user, set_email_user] = useState("");
  const [password_user, set_password_user] = useState("");

  const [redirectToHome, setRedirectToHome] = useState(false);

  const [getToken, { data, isError, isSuccess, error, isLoading }] =
    useLoginUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    getToken({
      email_user: email_user,
      password_user: password_user,
    });
  };
  useEffect(() => {
    dispatch(cleanCredentials());
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Credenciales correctas!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      dispatch(
        setCredentials({
          current_user: {
            ccn_employee: data.current_user.ccn_employee,
            token: data.current_user.token,
          },
        })
      );
      window.location = "http://localhost:5173/";
    } else if (isError) {
      toast.error(`${error.data.msg}`, {
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
    //
  }, [isSuccess, isError]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-secondary-100 p-8 rounded-xl shadow-2xl w-auto lg:w-[450px]">
          <h2 className="text-4xl text-primary font-bold text-center hover:text-primary2 transition-colors">
            Sign Up
          </h2>
          <h1 className="text-2xl text-center uppercase font-bold tracking-[5px] text-primary mb-8">
            Ruizdev7<span className="ml-2 text-primary2">Portfolio</span>
          </h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1">
            <div className="relative w-[352px] h-[41px] mt-[48px] mb-[20px]">
              <input
                className="peer h-full w-full rounded-[7px] border-2 border-blue-gray-400 bg-gray-100 px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-[#064B80] focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                type="email"
                value={email_user}
                onChange={(e) => set_email_user(e.target.value)}
                placeholder=" "
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:leading-[4] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-xs peer-focus:leading-tight peer-focus:text-[#064B80] peer-focus:font-semibold peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-[#064B80] peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-[#064B80] peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                Email User
              </label>
            </div>
            <div className="relative w-[352px] h-[41px] rounded">
              <input
                className="peer h-full w-full rounded-[7px] border-2 border-blue-gray-400 bg-gray-100 px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-[#064B80] focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                type="password"
                value={password_user}
                onChange={(e) => set_password_user(e.target.value)}
                placeholder=" "
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:leading-[4] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-xs peer-focus:leading-tight peer-focus:text-[#064B80] peer-focus:font-semibold peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-[#064B80] peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-[#064B80] peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                Password User
              </label>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="bg-[#064B80] text-white w-[352px] h-[41px] rounded-lg mx-auto flex flex-col items-center justify-center hover:bg-[#064B80] hover:font-bold"
              >
                Iniciar Sesion
              </button>
            </div>
          </form>
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/auth/forget-password"
              className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
            >
              Forgot Password?
            </Link>
            <span className="flex items-center gap-2">
              Don't have an account?{" "}
              <Link
                to="/auth"
                className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
