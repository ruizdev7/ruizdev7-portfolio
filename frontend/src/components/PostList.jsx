import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import PortfolioPic from "../assets/img/Profile_Picture_Portfolio.png";
import { useGetPostsQuery } from "../RTK_Query_app/services/blog/postApi";

const PostList = () => {
  const { data, error, isLoading } = useGetPostsQuery();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "'on' MMM dd yyyy");
  };

  return (
    <div className="">
      {data.Posts.map((post) => (
        <div key={post.ccn_post} className="">
          <Link
            to={`/post/detail/${post.ccn_post}`}
            className="mt-5 text-white text-lg text-start tracking-wider"
          >
            {post.title}
          </Link>
          <p className="mt-5 text-sm text-white">{post.content}</p>

          <div className="grid grid-cols-3 place-content-between mt-5 w-full">
            <div className="col-span-2 flex justify-evenly">
              <img
                className="w-[35px] h-[35px] rounded-full object-contain"
                src={PortfolioPic}
              />
              {post && (
                <Link
                  to={`/author/${post.author_full_name}`}
                  className="text-[#9A9CAE] font-semibold text-sm flex items-center"
                >
                  {post.author_full_name}
                </Link>
              )}
              {post.published_at && (
                <h2 className="text-[#636674] text-sm flex items-center">
                  {formatDate(post.published_at)}
                </h2>
              )}
            </div>

            <div className="col-span-1 flex items-center justify-end">
              {post && (
                <h3 className="uppercase text-xs bg-[#172331] text-[#006AE6] text-center rounded-lg p-1">
                  {post.category_name}
                </h3>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
