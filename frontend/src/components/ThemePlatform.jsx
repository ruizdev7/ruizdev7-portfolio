import React from "react";

const ThemePlatform = () => {
  return (
    <>
      <div className="grid grid-cols-12 justify-between">
        <div className="col-span-8">
          {/** ligth mode */}
          <div className="bg-light_mode_1">bg-light_mode_1</div>
          <div className="bg-light_mode_2">bg-light_mode_2</div>
          <div className="bg-light_mode_title_text">
            bg-light_mode_title_text
          </div>
          <div className="bg-light_mode_content_text">
            bg-light_mode_content_text
          </div>
          <div className="bg-light_mode_text_hover">
            bg-light_mode_text_hover
          </div>
          <div className="bg-background_light_mode_sign_up  ">
            bg-background_light_mode_sign_up
          </div>
          <div className="bg-light_mode_1">bg-light_mode_1</div>
          <div className="bg-light_mode_1">bg-light_mode_1</div>
        </div>
        <div className="col-span-4">
          {/** dark mode */}
          <div className="bg-dark_mode_1">bg-dark_mode_1</div>
          <div className="bg-dark_mode_2">bg-dark_mode_2</div>
          <div className="bg-dark_mode_content_text ">
            bg-dark_mode_content_text
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemePlatform;
