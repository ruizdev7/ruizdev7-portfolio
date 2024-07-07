import React from "react";
import { useGetFeaturedPostQuery } from "../RTK_Query_app/services/blog/postApi";

const FeaturedPost = () => {
  const { data: featuredPost, error, isLoading } = useGetFeaturedPostQuery();

  console.log(featuredPost.FeaturedPost.comments);

  return <></>;
};

export default FeaturedPost;
