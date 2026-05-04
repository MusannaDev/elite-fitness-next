import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import Basket from '../Basket';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSection = () => {
	const briefStats = [
		{ value: '500+', label: 'TRAINERS & MANAGERS', delta: '+12% this month', accent: true },
		{ value: '12K+', label: 'ACTIVE MEMBERS', delta: '+8% this week', accent: false },
	];
	const heroStats = [
		{ value: '500+', label: 'TRAINERS & MANAGERS', note: 'Magistri' },
		{ value: '12K+', label: 'ACTIVE MEMBERS', note: 'Athletae' },
		{ value: '10K+', label: 'PRODUCTS & APPAREL', note: 'Apparatus' },
		{ value: '100+', label: 'PRO EQUIPMENT', note: 'Instrumenta' },
	];
	const bentoTiles = [
		{
			href: '/product',
			icon: 'TP',
			kicker: 'Top Picks',
			title: 'Supplements',
		},
		{
			href: '/trainer',
			icon: 'CO',
			kicker: 'Coaching',
			title: 'Personal Trainers',
		},
		{
			href: '/community?articleCategory=FREE',
			icon: 'CM',
			kicker: 'Community',
			title: 'Fitness Forum',
		},
	];
	const trustPills = ['Verified Sellers', 'Secure Checkout', 'Fast Support'];

	return (
		<div className={'hero-section'}>
			{/* CLASSIC IMAGE BACKGROUND */}
			<div className={'hero-video-wrap'}>
				<div className={'hero-backdrop-image'}></div>
				<div className={'hero-overlay'}></div>
				<div className={'hero-overlay-gradient'}></div>
				<div className={'hero-noise'}></div>
			</div>

			{/* HERO CONTENT */}
			<div className={'hero-content'}>
				<div className={'hero-shell'}>
					<div className={'hero-main-card'}>
						<span className={'hero-orbit hero-orbit-a'}></span>
						<span className={'hero-orbit hero-orbit-b'}></span>
						<span className={'hero-orbit hero-orbit-c'}></span>
						<div className={'hero-main-card-inner'}>
							<div className={'hero-eyebrow'}>
								<span className={'hero-badge'}>ELITE FITNESS PLATFORM</span>
							</div>
							<h1 className={'hero-headline'}>
								<span>Train</span>
								<span>Harder.</span>
								<em>Perform Better.</em>
								<b>Win Always.</b>
							</h1>
							<p className={'hero-sub'}>
								Your all-in-one performance hub with ranked products, verified coaches,
								and high-trust community insights built for those who never settle.
							</p>

							<div className={'hero-cta-row'}>
								<Link href="/clothes" className={'hero-btn primary'}>
									<span className={'hero-btn-text'}>Start Shopping</span>
									<span className={'hero-btn-arrow'}>{'->'}</span>
								</Link>
								<Link href="/sales-manager" className={'hero-btn secondary'}>
									<span className={'hero-btn-text'}>Find Managers</span>
									<span className={'hero-btn-arrow'}>{'->'}</span>
								</Link>
							</div>

							<div className={'hero-trust-row'}>
								{trustPills.map((pill) => (
									<span key={pill} className={'hero-trust-pill'}>
										{pill}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className={'hero-shell-right'}>
						<div className={'hero-brief'}>
							<div className={'hero-side-head'}>
								<strong>PERFORMANCE BRIEF</strong>
								<span>Key platform insights</span>
							</div>
							<div className={'hero-live'}>LIVE</div>
							<div className={'hero-mini-stats'}>
								{briefStats.map((stat) => (
									<div key={stat.label} className={`hero-mini-stat ${stat.accent ? 'accent' : 'plain'}`}>
										<strong>{stat.value}</strong>
										<span>{stat.label}</span>
										<small>{stat.delta}</small>
									</div>
								))}
							</div>
						</div>

						<div className={'hero-quick-nav'}>
							<div className={'hero-side-head'}>
								<strong>QUICK NAVIGATION</strong>
								<span>Jump to what you need</span>
							</div>
							<div className={'hero-link-list'}>
								{bentoTiles.map((item) => (
									<Link key={item.title} href={item.href} className={'hero-link-item'}>
										<div className={'hero-link-icon'}>{item.icon}</div>
										<div className={'hero-link-text'}>
											<small>{item.kicker}</small>
											<strong>{item.title}</strong>
										</div>
										<i>{'->'}</i>
									</Link>
								))}
							</div>
							<div className={'hero-nav-footer'}>
								<span>Explore Equipment</span>
								<Link href="/equipment" className={'hero-side-cta'}>
									View All {'->'}
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className={'hero-bottom-strip'}>
					{heroStats.map((stat) => (
						<div key={stat.label} className={'hero-bottom-item'}>
							<strong>{stat.value}</strong>
							<span>{stat.label}</span>
							<small>{stat.note}</small>
						</div>
					))}
				</div>
			</div>

			{/* SCROLL INDICATOR */}
			<div className={'scroll-indicator'}>
				<div className={'scroll-mouse'}>
					<div className={'scroll-wheel'}></div>
				</div>
				<span>Scroll</span>
			</div>
		</div>
	);
};

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const router = useRouter();
		const { themeMode } = useThemeMode();

		// Show HeroSection only on the homepage
		const isHomePage = router.pathname === '/';

		/** LIFECYCLE **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>EliteFit</title>
						<meta name={'title'} content={`EliteFit`} />
					</Head>
					<Stack id="mobile-wrap" className={themeMode}>
						<Stack id={'top'}><Top /></Stack>
						<Stack id={'main'}><Component {...props} /></Stack>
						<Stack id={'footer'}><Footer /></Stack>
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
					<div id="pc-wrap" className={`${themeMode} classic-modern layout-home`}>
						<div id={'top'}><Top /></div>

						{/* HeroSection only on the homepage */}
						{isHomePage && <HeroSection />}

						<div id={'main'}><Component {...props} /></div>
						<Basket floating />
						<Chat />
						<div id={'footer'}><Footer /></div>
					</div>
				</>
			);
		}
	};
};

export default withLayoutMain;
