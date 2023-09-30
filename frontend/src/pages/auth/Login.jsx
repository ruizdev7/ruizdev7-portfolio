import React from 'react'
import { useForm, Controller } from 'react-hook-form';

const Login = () => {

	const { handleSubmit, control, errors } = useForm();

	const onSubmit = (data) => {
		console.log(data); // Puedes hacer lo que quieras con los datos aquí
	};


	return (
		<div>
			<h1 className='text-black'>SIGN UP</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div>
					<label htmlFor="first_name">First Name</label>
					<Controller
						name="first_name"
						control={control}
						defaultValue=""
						rules={{ required: 'First Name is required' }}
						render={({ field }) => <input {...field} />}
					/>
					{errors.first_name && <p>{errors.first_name.message}</p>}
				</div>

				<div>
					<label htmlFor="middle_name">Middle Name</label>
					<Controller
						name="middle_name"
						control={control}
						defaultValue=""
						render={({ field }) => <input {...field} />}
					/>
				</div>

				<div>
					<label htmlFor="last_name">Last Name</label>
					<Controller
						name="last_name"
						control={control}
						defaultValue=""
						rules={{ required: 'Last Name is required' }}
						render={({ field }) => <input {...field} />}
					/>
					{errors.last_name && <p>{errors.last_name.message}</p>}
				</div>

				<div>
					<label htmlFor="email">Email</label>
					<Controller
						name="email"
						control={control}
						defaultValue=""
						rules={{
							required: 'Email is required',
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: 'Invalid email address',
							},
						}}
						render={({ field }) => <input {...field} />}
					/>
					{errors.email && <p>{errors.email.message}</p>}
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<Controller
						name="password"
						control={control}
						defaultValue=""
						rules={{ required: 'Password is required' }}
						render={({ field }) => <input type="password" {...field} />}
					/>
					{errors.password && <p>{errors.password.message}</p>}
				</div>

				<div>
					<button type="submit">Register</button>
				</div>
			</form>
		</div>

	)
}

export default Login
