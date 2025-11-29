import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { loginSuccess } from "../../RTK_Query_app/state_slices/authSlice";
import { useLoginUserMutation } from "../../RTK_Query_app/services/auth/authApi";
import { toast } from "react-toastify";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accessType = searchParams.get("type") || "company"; // company, employee

  const [email, set_email] = useState("");
  const [password, set_password] = useState("");

  const [getToken, { data, isError, isSuccess, error, isLoading }] =
    useLoginUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    getToken({
      email: email,
      password: password,
    });
  };

  useEffect(() => {
    if (isSuccess && data) {
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

      // Usar el nuevo loginSuccess action que incluye roles y permisos
      dispatch(loginSuccess(data));

      // Actualizar el último login timestamp
      const now = new Date();
      localStorage.setItem("lastLoginTime", now.toISOString());

      // Disparar evento de storage para sincronizar otras pestañas
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "lastLoginTime",
          newValue: now.toISOString(),
        })
      );

      // Redirigir al dashboard de AI Governance con el tipo de acceso
      // El dashboard usará el parámetro type para determinar qué mostrar
      setTimeout(() => {
        if (accessType) {
          navigate(`/ai-governance/dashboard?type=${accessType}`);
        } else {
          navigate("/ai-governance/dashboard");
        }
      }, 100);
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
  }, [isSuccess, isError, data, error, dispatch]);

  const accessTypeInfo = {
    company: {
      icon: BuildingOfficeIcon,
      title: "Acceso Empresarial",
      subtitle: "Inicia sesión como empresa",
      color: "blue",
    },
    employee: {
      icon: UserGroupIcon,
      title: "Acceso Empleado/Auditor",
      subtitle: "Inicia sesión como empleado o auditor",
      color: "green",
    },
  };

  const currentInfo = accessTypeInfo[accessType] || accessTypeInfo.company;
  const Icon = currentInfo.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#17181C]">
      <div className="bg-[#23262F] p-8 rounded-xl shadow-2xl w-auto lg:w-[450px]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`p-2 bg-${currentInfo.color}-600 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white font-bold">
              {currentInfo.title}
            </h2>
            <p className="text-sm text-gray-400">{currentInfo.subtitle}</p>
          </div>
        </div>
        <h1 className="text-2xl text-center uppercase font-bold tracking-[5px] text-white mb-6">
          Ruizdev7<span className="ml-2 text-blue-400">Portfolio</span>
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="relative w-full h-[41px] mt-[48px]">
            <input
              className="peer h-full w-full rounded-[7px] border-2 border-gray-600 bg-[#2C2F36] px-3 py-2 font-sans text-sm font-normal text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-600 placeholder-shown:border-t-gray-600 focus:border-2 focus:border-blue-400 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-[#2C2F36]"
              type="email"
              value={email}
              onChange={(e) => set_email(e.target.value)}
              placeholder=" "
            />
            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs leading-tight text-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-gray-600 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-gray-600 after:transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:leading-[4] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-xs peer-focus:leading-tight peer-focus:text-blue-400 peer-focus:font-semibold peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-blue-400 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-blue-400 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-gray-500">
              Email User
            </label>
          </div>

          <div className="relative w-full h-[41px]">
            <input
              className="peer h-full w-full rounded-[7px] border-2 border-gray-600 bg-[#2C2F36] px-3 py-2 font-sans text-sm font-normal text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-600 placeholder-shown:border-t-gray-600 focus:border-2 focus:border-blue-400 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-[#2C2F36]"
              type="password"
              value={password}
              onChange={(e) => set_password(e.target.value)}
              placeholder=" "
            />
            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs leading-tight text-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-gray-600 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-gray-600 after:transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:leading-[4] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-xs peer-focus:leading-tight peer-focus:text-blue-400 peer-focus:font-semibold peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-blue-400 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-blue-400 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-gray-500">
              Password User
            </label>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-400 text-white w-full h-[41px] rounded-lg mx-auto flex flex-col items-center justify-center hover:bg-blue-500 hover:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando Sesión..." : "Iniciar Sesion"}
            </button>
          </div>
        </form>

        <div className="flex flex-col items-center gap-4 mt-4">
          <Link
            to="/auth/forget-password"
            className="text-blue-400 hover:text-blue-500 hover:font-extrabold transition-colors"
          >
            Forgot Password?
          </Link>
          <span className="flex items-center gap-2 text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="text-blue-400 hover:text-blue-500 hover:font-extrabold transition-colors"
            >
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
