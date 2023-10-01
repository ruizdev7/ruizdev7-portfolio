import React from 'react'

import { RiNotification3Line, RiArrowDownSLine } from "react-icons/ri";

const Header = () => {
	return (
		<header className='h-[7vh] md:h-[10vh] border-b border-secondary-100 p-8 flex items-center justify-end'>
			<nav className='flex items-center gap-x-2'>
				<button className='hover:bg-secondary-100 p-2 rounded-lg transition-colors'>
					<RiNotification3Line />
				</button>
				<button className='flex items-center gap-x-2 hover:bg-secondary-100 p-2 rounded-lg transition-colors'>
					<img className='w-6 h-6 rounded-full object-cover' src="https://img.freepik.com/vector-premium/hombre-posando-trajes-elegantes_56102-574.jpg" alt="" />
					<span className='text-black'>
						Joseph Ruiz
					</span>
					<RiArrowDownSLine />
				</button>
			</nav>
		</header>
	)
}

export default Header
