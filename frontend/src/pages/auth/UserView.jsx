import React from "react";

const UserView = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-[100px]">
        <div className="col-span-4 row-span-2 bg-[#17181C] p-4 rounded shadow mt-4">
          <h2 className="text-xl font-bold mb-2">User Details</h2>
          <div>
            <p className="text-lg font-semibold">User Name</p>

            <div className="flex items-center justify-center">
              <span className="w-[80px] h-[80px] bg-emerald-700 text-white rounded-full flex items-center justify-center text-2xl p-4">
                R
              </span>
            </div>
            <p className="text-center text-white my-2">Joseph Ruiz</p>
            <h3 className="text-center bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              Administrator
            </h3>
            <details>
              <summary className="text-white">Details</summary>
              <p className="text-white">
                Y este es el texto oculto que se muestra al desplegarse.
              </p>
            </details>
          </div>
        </div>

        <div className="col-span-8 bg-white p-4 rounded shadow mt-4">
          <h2 className="text-xl font-bold mb-2">User Details</h2>
          <div className="flex items-center">
            <img
              src="path/to/user/photo.jpg"
              alt="User Photo"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-semibold">User Name</p>
              <p className="text-gray-600">user@example.com</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                Change Photo
              </button>
            </div>
          </div>
          <div className="mt-4">
            <p>
              <strong>Account ID:</strong> ID-45453423
            </p>
            <p>
              <strong>Email:</strong> info@keenthemes.com
            </p>
            <p>
              <strong>Address:</strong> 101 Collin Street, Melbourne 3000 VIC
              Australia
            </p>
            <p>
              <strong>Language:</strong> English
            </p>
            <p>
              <strong>Last Login:</strong> 15 Apr 2025, 8:43 pm
            </p>
          </div>
        </div>
        <div className="col-start-5 col-span-8 bg-white p-4 rounded shadow mt-4">
          <h2 className="text-xl font-bold mb-2">User Details</h2>
          <div className="flex items-center">
            <img
              src="path/to/user/photo.jpg"
              alt="User Photo"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-semibold">User Name</p>
              <p className="text-gray-600">user@example.com</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                Change Photo
              </button>
            </div>
          </div>
          <div className="mt-4">
            <p>
              <strong>Account ID:</strong> ID-45453423
            </p>
            <p>
              <strong>Email:</strong> info@keenthemes.com
            </p>
            <p>
              <strong>Address:</strong> 101 Collin Street, Melbourne 3000 VIC
              Australia
            </p>
            <p>
              <strong>Language:</strong> English
            </p>
            <p>
              <strong>Last Login:</strong> 15 Apr 2025, 8:43 pm
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserView;
