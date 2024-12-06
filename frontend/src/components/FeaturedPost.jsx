import React from "react";
import { useGetFeaturedPostQuery } from "../RTK_Query_app/services/blog/postApi";

const FeaturedPost = () => {
  const { data: featuredPost, error, isLoading } = useGetFeaturedPostQuery();

  console.log(featuredPost);

  return (
    <>
      <div>
        <h1>Featured Post</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          <div>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.content}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default FeaturedPost;

{
  /**
  <div className="container mx-auto border border-gray-200 p-[40px]">
        <h1 className="text-light_mode_2 text-xl p-4">
          Latest Articles, News & Updates
        </h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Est
          laboriosam mollitia ab sit praesentium natus, illum, aliquam, ut
          minima delectus repudiandae cumque libero dolorum aliquid nisi
          assumenda eaque modi! Eum praesentium velit ex quaerat facilis qui
          fugit sed corporis. Ducimus nostrum corrupti quae velit deserunt.
        </p>
      </div>
  */
}
