import { React, useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { useForm } from "react-hook-form";

import { useGetPostsQuery } from "../../RTK_Query_app/services/blog/postApi";

import math_article from "../../assets/img/article1.png";
import FeaturedPost from "../../components/FeaturedPost";

const HomeBlog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);

  console.log(watch("example")); // watch input value by passing the name of it

  return (
    <>
      <div className="container mx-auto max-w-6xl flex items-center justify-between p-6 my-3">
        <h1 className="text-dark_mode_content_text">Blog Home</h1>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Publish
          </button>
        </div>
      </div>

      <section className="container mx-auto max-w-6xl flex items-center justify-between p-6 my-3">
        <FeaturedPost />
      </section>

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
              {/**"handleSubmit" will validate your inputs before invoking "onSubmit" */}
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* register your input into the hook by invoking the "register" function */}
                <div>
                  <label htmlFor="title">Title</label>
                  <input {...register("example")} />
                </div>
                <div>
                  <label htmlFor="content">content</label>
                  <textarea {...register("content")} />
                </div>

                {/* include validation with required or other standard HTML validation rules */}
                <input {...register("exampleRequired", { required: true })} />
                {/* errors will return when field validation fails  */}
                {errors.exampleRequired && <span>This field is required</span>}
                <button
                  type="submit"
                  onClick={() => setIsOpen(true)}
                  className="items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  PUBLISH
                </button>
              </form>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsOpen(true)}
                className="items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                CANCEL
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default HomeBlog;

{
  /**
  
  
  
  */
}
