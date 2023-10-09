import React from "react";
import { useForm } from "react-hook-form";

import SignUpImage from "./../../assets/img/hero-1.jpeg";

const SignUp = () => {
	const { register, handleSubmit } = useForm();

	const onSubmit = handleSubmit((data) => {
		console.log(data);
	});

	return (
		<>

			<form action="" className="bg-gray-100">
				<div>
					<h1>Logn</h1>
				</div>

			</form>

		</>
	);
};

export default SignUp;