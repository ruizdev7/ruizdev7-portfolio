import React, { useMemo } from "react";
import { useGetFeaturedPostQuery } from "../RTK_Query_app/services/blog/postApi";
import PortfolioPic from "../assets/img/Profile_Picture_Portfolio.png";

const FeaturedPost = () => {
  const { data, error, isLoading } = useGetFeaturedPostQuery();

  useMemo(() => {
    console.log("data", data);
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center px-5">
        <img
          className="rounded-lg w-[535px] h-[275px]"
          src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*yearS-PvPyI2im7f"
          alt=""
        />
        <div className="mt-5 text-white text-lg text-start tracking-wider">
          {data.FeaturedPost.title}
        </div>
        <div className="mt-5 text-sm text-white ">
          {data.FeaturedPost.content}
        </div>

        <div className="">
          <div className="">
            <img
              className="w-[35px] h-[35px] rounded-full object-contain"
              src={PortfolioPic}
            />
            <h2 className="text-white">{data.FeaturedPost.author}</h2>
            <h2 className="text-white">{data.FeaturedPost.published_at}</h2>
          </div>
          <div>
            <h3 className="text-white">{data.FeaturedPost.category}</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedPost;

{
  /**
  
  <div className="flex justify-between mt-5">
          
          <div className="mt-5 text-lg text-white">
            
          </div>
        </div>
        <div>
          <div className="mt-5 text-lg text-white">
            
          </div>
        </div>
  
  */
}
