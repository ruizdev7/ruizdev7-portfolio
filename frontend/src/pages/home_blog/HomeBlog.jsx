import React from "react";
import { useGetPostsQuery } from "../../RTK_Query_app/services/blog/postApi";

const HomeBlog = () => {
  const { data, error, isLoading } = useGetPostsQuery();

  console.log(data);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>test</div>
    </>
  );
};

export default HomeBlog;
