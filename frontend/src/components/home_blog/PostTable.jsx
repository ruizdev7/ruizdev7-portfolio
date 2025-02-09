import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
//import "ag-grid-community/styles/ag-theme-quartz.css";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community"; // Import the theme

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { useGetPostTableQuery } from "../../RTK_Query_app/services/blog/postApi";

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { useForm } from "react-hook-form";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const badgeColor = {
  Backend_Development:
    "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300",
  DevOps_and_Automation:
    "bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300",
  Tools_and_Technologies:
    "bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300",
  Case_Studies_and_Tutorials:
    "bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300",
  Personal_Experiences_and_Soft_Skills:
    "bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300",
  Trends_and_Future_Insights:
    "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300",
  Common_Mistakes_and_Lessons_Learned:
    "bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300",
  Global_Politics_and_Technology:
    "bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300",
};

const formatCategoryName = (categoryName) => {
  return categoryName.replace(/\s+/g, "_");
};

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz.withParams({
  backgroundColor: "#17181C",
  browserColorScheme: "dark",
  chromeBackgroundColor: "#27282C",
  foregroundColor: "#FFF",
  headerFontSize: 14,
  oddRowBackgroundColor: "#17181C",
});

const PostTable = () => {
  const [gridApi, setGridApi] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const { data: postsTable, error, isLoading } = useGetPostTableQuery([]);

  console.log(postsTable);

  useEffect(() => {
    if (postsTable) {
      setRowData(postsTable.Posts);
    }
  }, [postsTable]);

  // Definiciones de columnas base
  const baseColDefs = [
    {
      field: "ccn_post",
      headerName: "Post ID",
      flex: 0.3,
      cellClass: "flex justify-center items-center",
      headerClass: "text-center",
      hide: isMobile, // Ocultar en móvil
    },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => (
        <a
          href={`http://localhost:4321/blog/${params.data.slug}`}
          className="hover:text-blue-400 transition-colors"
          target="blank"
        >
          {params.value}
        </a>
      ),
      headerClass: "text-center",
    },
    {
      field: "category_name",
      headerName: "Category",
      flex: 1.5,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => (
        <span className={badgeColor[formatCategoryName(params.value)]}>
          {params.value}
        </span>
      ),
      headerClass: "text-center",
    },
    {
      field: "published_at",
      headerName: "Published At",
      flex: 1,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center",
      hide: isMobile, // Ocultar en móvil
    },
  ];

  const [colDefs, setColDefs] = useState(baseColDefs);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(isMobileSize);
    };

    // Ejecutar al montar y al cambiar tamaño
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Actualizar columnas cuando cambia el tamaño
  useEffect(() => {
    setColDefs((prev) =>
      prev.map((column) => ({
        ...column,
        hide:
          (column.field === "ccn_post" ||
            column.field === "published_at" ||
            column.field === "category_name") &&
          isMobile,
      }))
    );
  }, [isMobile]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

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

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts: {error.message}</div>;

  return (
    <>
      <section className="container mx-auto max-w-7xl bg-[#17181C] p-6 rounded-md">
        <div className="grid grid-cols-2 justify-evenly gap-4">
          <div className="col-span-2">
            <div className="p-5">
              <h1 className=" text-white text-lg tracking-wide">
                Knowledge Base
              </h1>
              <h2 className=" text-white text-base tracking-wide">
                Latest Articles, News & Updates
              </h2>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl flex items-center justify-between p-6 my-3">
        <div
          className="ag-theme-quartz-dark dark:bg-dark_mode_sidebar"
          style={{ height: 650, width: "100%" }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={(10, 20)}
            onGridReady={onGridReady}
            theme={myTheme} // Apply custom theme
          />
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2">
          <DialogPanel className="max-w-lg space-y-4 bg-white p-6 rounded-md">
            <DialogTitle className="font-bold uppercase text-start text-xl">
              Create new POST
            </DialogTitle>
            <Description>
              Create a new post and get closer to the search for knowledge.
            </Description>
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
                              message:
                                "First name must have atleast 3 characters !!",
                            },
                            maxLength: {
                              value: 20,
                              message:
                                "First name must have max 20 characters !!",
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
                              message:
                                "Middle name required min 3 characters!!",
                            },
                            maxLength: {
                              value: 20,
                              message:
                                "Middle name required max 20 characters!!",
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

                    <div className="flex flex-row justify-evenly items-center gap-6">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        CANCEL
                      </button>
                      <button className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-between"></div> 1
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default PostTable;
