import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

// Icons
import {
	RiMailLine,
	RiLockLine,
	RiEyeLine,
	RiEyeOffLine,
	RiProfileLine,
} from "react-icons/ri";

import SignUpImage from "./../../assets/img/hero-1.jpeg";

const SignUp = () => {
	const { register, handleSubmit,
		formState: { errors }
	} = useForm();

	console.log(errors)

	const onSubmit = handleSubmit((data) => {
		console.log(data);
	});

	const [showPassword, setShowPassword] = useState(false);

	return (
		<>

			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="bg-secondary-100 p-8 rounded-xl shadow-2xl w-auto lg:w-[450px]">
					<h2 className="text-4xl text-primary font-bold text-center hover:text-primary2 transition-colors">Sign Up</h2>
					<h1 className="text-2xl text-center uppercase font-bold tracking-[5px] text-primary mb-8">
						Ruizdev7<span className="ml-2 text-primary2">Portfolio</span>
					</h1>
					<form onSubmit={handleSubmit(onSubmit)} className="mb-8 flex flex-col justify-between gap-4">

						<div className="relative">
							<RiMailLine className="absolute top-1/2 -translate-y-1/2 left-2 text-primary" />
							<input
								{...register("email_user", {
									required: {
										value: true,
										message: "Email is required!"
									},
									pattern: {
										value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
										message: "Email is not valid!!!!"
									}
								})}
								type="email"
								className="py-3 pl-8 pr-4 bg-secondary-900 w-full outline-none rounded-lg"
								placeholder="Email"
							/>
						</div>
						{
							errors?.email_user && <span className="ml-2 text-xs text-red-600">{errors.email_user.message}</span>
						}
						<div className="relative mb-8">
							<RiLockLine className="absolute top-1/2 -translate-y-1/2 left-2 text-primary" />
							<input
								{...register("password_user", {
									required: {
										value: true,
										message: "Password is required"
									}
								})}
								type={showPassword ? "text" : "password"}
								className="py-3 px-8 bg-secondary-900 w-full outline-none rounded-lg"
								placeholder="Password"
							/>
							{showPassword ? (
								<RiEyeOffLine
									onClick={() => setShowPassword(!showPassword)}
									className="absolute top-1/2 -translate-y-1/2 right-2 hover:cursor-pointer text-primary"
								/>
							) : (
								<RiEyeLine
									onClick={() => setShowPassword(!showPassword)}
									className="absolute top-1/2 -translate-y-1/2 right-2 hover:cursor-pointer text-primary"
								/>
							)}
						</div>
						<div>
							<button
								type="submit"
								className="bg-primary text-black uppercase font-bold hover:text-white text-sm w-full py-3 px-4 rounded-lg"
							>
								Register
							</button>
						</div>
					</form>
					<div className="flex flex-col items-center gap-4">
						<Link
							to="/auth/forget-password"
							className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
						>
							Forgot Password?
						</Link>
						<span className="flex items-center gap-2">
							Don't have an account?{" "}
							<Link
								to="/auth"
								className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
							>
								Sign In
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default SignUp;