import { useForm } from "react-hook-form";
import React, { Fragment, useState } from "react";

import { Dialog, Transition, Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

import { useReactTable } from "@tanstack/react-table";

import TableProjects from "../../components/TableProjects";

const Projects = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title_project: "",
      description_project: "",
      pdf_software_requirement: "",
      image_entity_relationship: "",
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data) => console.log(data);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <h1 className="uppercase text-2xl text-center tracking-wider font-bold text-primary col-span-12 flex justify-center items-center">
        Projects That Highlight Both My Data Analysis Skills and Backend
        Development Expertise
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="col-span-4 flex justify-center items-center my-5">
          <button
            type="button"
            onClick={openModal}
            className="rounded-md bg-green-800/70 px-4 py-2 text-base font-medium text-white hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
          >
            New Project
          </button>
        </div>

        <div className="col-span-1 flex flex-col justify-center items-center p-6">
          <div className="w-full">
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-orange-200 px-4 py-2 text-left text-sm font-medium text-orange-900 hover:bg-orange-300 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/75">
                      <span>Note</span>
                      <ChevronDownIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-orange-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                      Throughout my working life I have had the opportunity to
                      work on several projects that have given me valuable
                      knowledge of aspects related to the development of
                      fullstack applications from their conception to their
                      implementation in production, in addition to the
                      development of dashboards and reports that help make
                      informed decisions. based on the data, however I signed
                      non-disclosure agreements which does not allow me to show
                      my work done in said companies.
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>

        <div className="h-auto col-span-3">
          <TableProjects />
        </div>

        <footer className="col-span-4 p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-extrabold">© 2023, Joseph Ruiz</div>

          <p className="text-xs font-extrabold">
            Todos los derechos reservados.
          </p>
        </footer>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-end p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    New Project
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This form allows the creation of a new project.
                    </p>
                    {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
                    <form
                      className="bg-white px-8 pt-6 pb-8 mb-4"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      {/* register your input into the hook by invoking the "register" function */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {" "}
                          Project Title{" "}
                        </label>
                        <input
                          {...register("title_project", {
                            required: {
                              value: true,
                              message: "This field is required",
                            },
                          })}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                        />
                        {errors.title_project && (
                          <span className="text-orange-600 text-xs">
                            {errors.title_project.message}
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {" "}
                          Project Description{" "}
                        </label>
                        <textarea
                          {...register("description_project", {
                            required: {
                              value: true,
                              message: "The project description is required",
                            },
                          })}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          rows="5"
                        ></textarea>
                        {errors.description_project && (
                          <span className="text-orange-600 text-xs">
                            {errors.description_project.message}
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {" "}
                          PDF Software Requirement{" "}
                        </label>
                        <input
                          {...register("pdf_software_requirement", {
                            required: {
                              value: true,
                              message:
                                "The pdf file that describe de software requirement is required",
                            },
                          })}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="file"
                        />
                        {errors.pdf_software_requirement && (
                          <span className="text-orange-600 text-xs">
                            {errors.pdf_software_requirement.message}
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {" "}
                          Entity Relationship Model{" "}
                        </label>
                        <input
                          {...register("image_entity_relationship", {
                            required: {
                              value: true,
                              message:
                                "The image that describre de entity mmodel relationship is required",
                            },
                          })}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="file"
                        />
                        {errors.image_entity_relationship && (
                          <span className="text-orange-600 text-xs">
                            {errors.image_entity_relationship.message}
                          </span>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="rounded-md bg-green-800/70 px-4 py-2 text-base font-medium text-white hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                      >
                        Create
                      </button>
                      {/** <pre>{JSON.stringify(watch(), null, 4)}</pre>
                       */}{" "}
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Projects;
