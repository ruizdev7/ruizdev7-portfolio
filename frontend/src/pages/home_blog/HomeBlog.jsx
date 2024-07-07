import React from "react";
import { useGetPostsQuery } from "../../RTK_Query_app/services/blog/postApi";

import math_article from "../../assets/img/article1.png";
import FeaturedPost from "../../components/FeaturedPost";

const HomeBlog = () => {
  return (
    <>
      <div className="container mx-auto max-w-6xl flex items-center justify-between p-6 my-3">
        <h1 className="text-dark_mode_content_text">Blog Home</h1>
        <div className="flex justify-center items-center gap-4">
          <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Filter
          </button>
          <button className="items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Publish
          </button>
        </div>
      </div>

      <section className="container mx-auto max-w-6xl flex items-center justify-between p-6 my-3">
        <FeaturedPost />
      </section>
    </>
  );
};

export default HomeBlog;

{
  /**
<section className="container mx-auto max-w-7xl p-6 bg-dark_mode_1">
  <div className="bg-gray-900 text-white p-8">
    <h1 className="text-2xl font-bold mb-6">
      Latest Articles, News & Updates
    </h1>
      <div className="md:w-1/2">
        {recentArticles.map((article, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-bold mb-2">{article.title}</h2>
            <p className="text-gray-400 mb-2">{article.description}</p>
            {article.content && (
              <p className="text-gray-300 mb-4">{article.content}</p>
            )}
            <div className="flex items-center">
              <img
                src="https://via.placeholder.com/40"
                alt={article.author}
                className="rounded-full mr-2"
              />
              <span className="text-gray-400 mr-2">
                {article.author} on {article.date}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  article.category === "BLOG"
                    ? "bg-purple-600"
                    : article.category === "TUTORIALS"
                    ? "bg-blue-600"
                    : "bg-yellow-600"
                } text-white`}
              >
                {article.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
*/
}
