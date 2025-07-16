import React from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

const Home = () => {
  return (
    <>
      <section className="container mx-auto max-w-7xl bg-[#17181C] p-6 rounded-lg">
        <div className="">
          <div className="">
            <div className="py-5">
              <h1 className=" text-white text-lg tracking-wide">Contact Me</h1>
              <h2 className=" text-white text-base tracking-wide">
                Let's get in touch
              </h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-center items-center gap-4 p-4 h-full rounded-lg bg-[#23262F]">
              <div className="flex items-center justify-center p-4">
                <div className="rounded-xl shadow-lg p-8 max-w-2xl w-full">
                  <div className="space-y-8">
                    {/* Email Display */}
                    <div className="text-center">
                      <code className="text-lg sm:text-xl md:text-2xl text-gray-800 font-mono">
                        Joseph
                      </code>
                    </div>

                    {/* Diagram */}
                    <div className="flex mt-8">
                      <div className="w-1/4 text-center relative">
                        <div className="text-primary font-mono mr-8 text-white">
                          ruizdev7@outlook.com
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
