import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '',
				bgPosition = 'center center';

			switch (router.pathname) {
				case '/clothes':
					title = 'Clothes Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/clothes-banner.webp';
					bgPosition = 'bottom center';
					break;
				case '/equipment':
					title = 'Equipment Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/equipments2-banner.webp';
					break;
				case '/product':
					title = 'Product Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/product-banner.webp';
					break;
				case '/property':
					title = 'Property Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/gyms-list-banner.webp';
					break;
				case '/agent':
					title = 'Agents';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/agent/detail':
					title = 'Agent Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/trainer':
					title = 'Trainers';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/trainer/detail':
					title = 'Trainer Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/sales-manager':
					title = 'SalesManagers';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/sales-manager/detail':
					title = 'Manager Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/order':
					title = 'My Orders';
					desc = 'Track and manage your orders';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/members-banner.png';
					break;
				default:
					break;
			}

			return { title, desc, bgImage, bgPosition };
		}, [router.pathname]);

		/** LIFECYCLE **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>EliteFit</title>
						<meta name={'title'} content={`EliteFit`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>EliteFit</title>
						<meta name={'title'} content={`EliteFit`} />
					</Head>
					<Stack id="pc-wrap" className="light classic-modern layout-basic">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								backgroundImage: `url(${memoizedValues.bgImage})`,
								backgroundSize: 'cover',
								backgroundPosition: memoizedValues.bgPosition,
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
