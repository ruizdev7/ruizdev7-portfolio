import React from "react";

import { RiAlignLeft } from "react-icons/ri";

const BlogLayout = () => {
  return (
    <>
      <div className="grid grid-cols-12">
        <div className="w-full h-[100px] col-span-12 bg-green_header">01</div>
        <div className="col-span-3 bg-gray_content_bar">02</div>
        <div className="col-span-6">03</div>
        <div className="col-span-3">04</div>
      </div>
    </>
  );
};

export default BlogLayout;
