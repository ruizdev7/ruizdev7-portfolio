import React from "react";
import { useGetFeaturedPostQuery } from "../../RTK_Query_app/services/blog/postApi";
import PortfolioPic from "../../assets/img/Profile_Picture_Portfolio.png";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const FeaturedPost = () => {
  const { data, error, isLoading } = useGetFeaturedPostQuery([]);

  const featuredPost = data?.FeaturedPost;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "'on' MMM dd yyyy");
  };

  const formatCategoryName = (categoryName) => {
    return categoryName.replace(/\s+/g, "_");
  };

  const badgeColor = {
    Backend_Development:
      "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300",
    DevOps_and_Automation:
      "bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300",
    Tools_and_Technologies:
      "bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300",
    Case_Studies_and_Tutorials:
      "bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300",
    Personal_Experiences_and_Soft_Skills:
      "bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300",
    Trends_and_Future_Insights:
      "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300",
    Common_Mistakes_and_Lessons_Learned:
      "bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300",
    Global_Politics_and_Technology:
      "bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-5">
        <img
          className="rounded-lg w-full h-[275px]"
          src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*yearS-PvPyI2im7f"
          alt=""
        />
        <Link
          to={`/post/detail/${featuredPost.ccn_post}`}
          className="mt-5 text-white text-lg text-start tracking-wider hover:text-light_mode_text_hover"
        >
          {featuredPost.title}
        </Link>
        <div className="mt-5 text-sm text-white">{featuredPost?.content}</div>

        <div className="grid grid-cols-3 gap-1 mt-5 w-full">
          <div className="col-span-2 flex gap-x-2">
            <img
              className="w-[35px] h-[35px] rounded-full object-contain"
              src={PortfolioPic}
            />
            {featuredPost && (
              <Link
                to={`/author/${featuredPost.author_full_name}`}
                className="text-[#9A9CAE] font-semibold text-sm flex items-center hover:text-light_mode_text_hover"
              >
                {featuredPost.author_full_name}
              </Link>
            )}
            {featuredPost?.published_at && (
              <h2 className="text-[#636674] text-sm flex items-center">
                {formatDate(featuredPost.published_at)}
              </h2>
            )}
          </div>

          <div className="col-span-1 flex items-center justify-center">
            {featuredPost && (
              <h3
                className={`${
                  badgeColor[formatCategoryName(featuredPost.category_name)]
                }`}
              >
                {featuredPost.category_name}
              </h3>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedPost;
