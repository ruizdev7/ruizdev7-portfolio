import React from "react";
import { useGetFeaturedPostQuery } from "../RTK_Query_app/services/blog/postApi";

const FeaturedPost = () => {
  const { data, error, isLoading } = useGetFeaturedPostQuery();

  // Display loading state
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Handle error state
  if (error) {
    return <p>Something went wrong. Please try again later.</p>;
  }

  // Extract the featured post from the data
  const featuredPost = data?.FeaturedPost;

  return (
    <>
      <section className="">
        <div className="flex flex-col items-center justify-center px-5">
          <img
            className="rounded-lg w-[535px] h-[275px]"
            src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*yearS-PvPyI2im7f"
            alt=""
          />
        </div>
        <h1 className="px-5 py-3 text-start text-dark_mode_content_text font-extrabold">
          {featuredPost.title}
        </h1>
        <p className="px-5 text-start text-dark_mode_content_text">
          {featuredPost.content}
        </p>
        <p>{featuredPost.ccn_author}</p>
      </section>
    </>
  );
};

export default FeaturedPost;
