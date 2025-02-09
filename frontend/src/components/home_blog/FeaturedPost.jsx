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
      <Link
        to={`http://localhost:4321/blog/${featuredPost.slug}`}
        target="blank"
        className="flex flex-col items-start justify-evenly p-4 h-full rounded-lg bg-[#23262F] hover:-translate-y-1 hover:scale-105 transition-transform duration-300 ease-in-out"
      >
        <img
          className="w-full h-[300px] object-cover rounded-lg"
          src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*yearS-PvPyI2im7f"
          alt=""
        />
        <Link
          to={`http://localhost:4321/blog/${featuredPost.slug}`}
          className=" text-white text-lg text-start my-2 tracking-wider hover:text-blue-400 transition-colors font-sans"
        >
          {featuredPost?.title}
        </Link>
        <div className="text-md text-white font-sans">
          {featuredPost?.content}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="col-span-2 flex gap-x-2">
            <img
              className="w-[35px] h-[35px] rounded-full object-contain"
              src={PortfolioPic}
            />
            {featuredPost && (
              <Link
                to={`/author/${featuredPost.author_full_name}`}
                className="text-[#9A9CAE] font-sans text-base flex items-center hover:text-light_mode_text_hover"
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
      </Link>
    </>
  );
};

export default FeaturedPost;
