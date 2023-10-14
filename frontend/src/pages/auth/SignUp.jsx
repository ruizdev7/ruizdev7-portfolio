import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

// Icons
import {
	RiMailLine,
	RiLockLine,
	RiEyeLine,
	RiEyeOffLine,
} from "react-icons/ri";

import SignUpImage from "./../../assets/img/hero-1.jpeg";

const SignUp = () => {
	const { register, handleSubmit } = useForm();

	const onSubmit = handleSubmit((data) => {
		console.log(data);
	});


	const [showPassword, setShowPassword] = useState(false);

	return (
		<>

			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="bg-secondary-100 p-8 rounded-xl shadow-2xl w-auto lg:w-[450px]">
					<h1 className="text-2xl text-center uppercase font-bold tracking-[5px] text-primary mb-8">
						Ruizdev7<span className="ml-2 text-primary2">Portfolio</span>
					</h1>
					<form onSubmit={handleSubmit(onSubmit)} className="mb-8">

						<div className="relative mb-4">
							<RiMailLine className="absolute top-1/2 -translate-y-1/2 left-2 text-primary" />
							<input
								{...register("email_user")}
								type="email"
								className="py-3 pl-8 pr-4 bg-secondary-900 w-full outline-none rounded-lg"
								placeholder="Email"
							/>
						</div>
						<div className="relative mb-8">
							<RiLockLine className="absolute top-1/2 -translate-y-1/2 left-2 text-primary" />
							<input
								{...register("password_user")}
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
								className="bg-primary text-black uppercase font-bold text-sm w-full py-3 px-4 rounded-lg"
							>
								Log In
							</button>
						</div>
					</form>
					<div className="flex flex-col items-center gap-4">
						<Link
							to="/olvide-password"
							className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
						>
							Forgot Password?
						</Link>
						<span className="flex items-center gap-2">
							Don't have an account?{" "}
							<Link
								to="/auth/sign-up"
								className="text-primary hover:text-primary2 hover:font-extrabold transition-colors"
							>
								Sign Up
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default SignUp;