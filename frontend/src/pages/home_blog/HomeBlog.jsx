import { React, useState } from "react";

import { Link } from "react-router-dom";

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useForm } from "react-hook-form";

import PortfolioPic from "../../assets/img/Profile_Picture_Portfolio.png";

import PostList from "../../components/home_blog/PostList";
import FeaturedPost from "../../components/home_blog/FeaturedPost";
import { useGetPostsQuery } from "../../RTK_Query_app/services/blog/postApi";

const HomeBlog = () => {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <section className="container mx-auto max-w-7xl bg-[#17181C] p-6 rounded-md divide-y divide-dashed divide-slate-700">
        <div className="grid grid-cols-2 flex-wrap">
          <div className="col-span-2">
            <div className="p-5">
              <h1 className=" text-white text-lg tracking-wide">
                Latest Articles, News & Updates
              </h1>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <FeaturedPost />
          </div>
          <div className="col-span-2 md:col-span-1">
            <PostList />
          </div>
          <div className="col-span-2 my-2">
            <Link
              to="/home-blog/all-post/"
              className="flex justify-center items-center text-white text-start tracking-wider hover:text-light_mode_text_hover hover:underline underline-offset-1"
            >
              See all Posts
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 flex-wrap">
          <div className="col-span-3">
            <div className="p-5 mt-5">
              <h1 className=" text-white text-lg font-semibold tracking-wide">
                Youtube Channel Tutorials
              </h1>
            </div>
          </div>

          <div className="flex justify-center items-center text-white">
            <h2>uno</h2>
          </div>

          <div className="flex justify-center items-center text-white">
            <h2>dos</h2>
          </div>

          <div className="flex justify-center items-center text-white">
            <h2>tres</h2>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeBlog;
