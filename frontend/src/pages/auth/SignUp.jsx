import React from 'react'
import { useForm } from 'react-hook-form';


import SignUpImage from "./../../assets/img/sign-up-form.jpg"

const SignUp = () => {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const onSubmit = data => console.log(data);
	console.log(errors);
	return (
		<>
			<section className="bg-gray-50 min-h-screen flex items-center justify-center">

				<div className="bg-gray-100 flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">

					<div className="md:w-1/2 px-8 md:px-16">
						<h2 className="font-bold text-2xl text-primary">Sign Up</h2>
						<p className="text-xs mt-4 text-black">If you are already a member, easily log in</p>

						<div className="mt-4 text-xs border-b border-[#002D74] py-4 text-[#002D74]">
							<a href="#">Forgot your password?</a>
						</div>

						<div className="mt-3 text-xs flex justify-between items-center text-[#002D74]">
							<p>Already have an account?</p>
							<button className="py-2 px-5 bg-white border rounded-xl hover:scale-110 duration-300">Login</button>
						</div>
					</div>

					<div className="md:block hidden w-1/2">
						<img className="rounded-2xl" src={SignUpImage} />
					</div>
				</div>
			</section>
		</>

	)
}

export default SignUp



