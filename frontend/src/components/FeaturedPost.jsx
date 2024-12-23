import React, { useMemo } from "react";
import { useGetFeaturedPostQuery } from "../RTK_Query_app/services/blog/postApi";
import PortfolioPic from "../assets/img/Profile_Picture_Portfolio.png";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const FeaturedPost = () => {
  const { data, error, isLoading } = useGetFeaturedPostQuery();

  const FeaturedPost = data?.FeaturedPost;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "'on' MMM dd yyyy");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center px-5">
        <img
          className="rounded-lg w-[535px] h-[275px]"
          src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*yearS-PvPyI2im7f"
          alt=""
        />
        <div className="mt-5 text-white text-lg text-start tracking-wider">
          {FeaturedPost?.title}
        </div>
        <div className="mt-5 text-sm text-white">{FeaturedPost?.content}</div>

        <div className="grid grid-cols-3 gap-4 mt-5 w-full">
          <div className="col-span-2 flex justify-evenly">
            <img
              className="w-[35px] h-[35px] rounded-full object-contain"
              src={PortfolioPic}
            />
            {FeaturedPost && (
              <Link
                to="`/author/${FeaturedPost?.author}`"
                className="text-[#9A9CAE] font-semibold text-sm flex items-center"
              >
                {FeaturedPost?.author}
              </Link>
            )}
            {FeaturedPost && (
              <h2 className="text-[#636674] text-sm flex items-center">
                {formatDate(FeaturedPost?.published_at)}
              </h2>
            )}
          </div>

          <div className="col-span-1 flex items-center justify-end">
            {FeaturedPost && (
              <h3 className="uppercase text-xs bg-[#172331] text-[#006AE6] text-center rounded-lg p-1">
                {FeaturedPost?.category}
              </h3>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedPost;
