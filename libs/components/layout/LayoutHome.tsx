import React, { useEffect, useRef, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSection = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoLoaded, setVideoLoaded] = useState(false);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// Imperativ ravishda muted o'rnatish (autoplay uchun zarur)
		video.muted = true;

		// Videoni yuklash va o'ynash
		video.load();
		const playPromise = video.play();
		if (playPromise !== undefined) {
			playPromise.catch((error) => {
				console.warn('Autoplay blocked by browser:', error);
			});
		}
	}, []);

	return (
		<div className={'hero-section'}>
			{/* VIDEO BACKGROUND */}
			<div className={'hero-video-wrap'}>
				<video
					ref={videoRef}
					className={`hero-video ${videoLoaded ? 'loaded' : ''}`}
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					onCanPlayThrough={() => setVideoLoaded(true)}
				>
					<source src="/video/gym.mp4" type="video/mp4" />
				</video>

				{/* OVERLAY LAYERS */}
				<div className={'hero-overlay'}></div>
				<div className={'hero-overlay-gradient'}></div>
				<div className={'hero-noise'}></div>
			</div>

			{/* HERO CONTENT */}
			<div className={'hero-content'}>
				<div className={'hero-eyebrow'}>
					<span className={'hero-badge'}>⚡ ELITE FITNESS PLATFORM</span>
				</div>
				<h1 className={'hero-headline'}>
					FORGE YOUR<br />
					<em>LEGACY</em>
				</h1>
				<p className={'hero-sub'}>
					Premium gyms · Expert trainers · Pro equipment<br />
					Everything you need to dominate.
				</p>

				<div className={'hero-cta-row'}>
					<a href="/property" className={'hero-btn primary'}>Explore Now</a>
					<a href="/agent" className={'hero-btn secondary'}>Meet Trainers</a>
				</div>

				{/* STATS ROW */}
				<div className={'hero-stats'}>
					<div className={'stat-item'}>
						<strong>500+</strong>
						<span>Trainers and SalesManagers</span>
					</div>
					<div className={'stat-divider'}></div>
					<div className={'stat-item'}>
						<strong>12K+</strong>
						<span>Members</span>
					</div>
					<div className={'stat-divider'}></div>
					<div className={'stat-item'}>
						<strong>10K+</strong>
						<span>Supplements and Clothings</span>
					</div>
					<div className={'stat-divider'}></div>
					<div className={'stat-item'}>
						<strong>100+</strong>
						<span>Equipments</span>
					</div>
					<div className={'stat-divider'}></div>
					<div className={'stat-item'}>
						<strong>98%</strong>
						<span>Success Rate</span>
					</div>
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
		const user = useReactiveVar(userVar);
		const router = useRouter();
		const { isDark } = useTheme();

		// Faqat homepage da HeroSection ko'rsatish
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
					<Stack id="mobile-wrap">
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
					<div id="pc-wrap" className={isDark ? 'dark' : 'light'}>
						<div id={'top'}><Top /></div>

						{/* HeroSection faqat bosh sahifada */}
						{isHomePage && <HeroSection />}

						<div id={'main'}><Component {...props} /></div>
						<Chat />
						<div id={'footer'}><Footer /></div>
					</div>
				</>
			);
		}
	};
};

export default withLayoutMain;