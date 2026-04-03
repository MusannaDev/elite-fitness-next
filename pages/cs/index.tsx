import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const tab = router.query.tab ?? 'notice';

	const changeTabHandler = (tab: string) => {
		router.push({ pathname: '/cs', query: { tab } }, undefined, { scroll: false });
	};

	if (device === 'mobile') return <h1>CS PAGE MOBILE</h1>;

	return (
		<Stack className={'cs-page'}>
			<Stack className={'container'}>
				{/* Hero header */}
				<Box component={'div'} className={'cs-hero'}>
					<div className={'hero-eyebrow'}>Support Center</div>
					<h1 className={'hero-title'}>How can we help you?</h1>
					<p className={'hero-sub'}>Browse announcements, find answers, or send us your inquiry</p>

					{/* Tab switcher */}
					<div className={'cs-tab-switcher'}>
						<button
							className={`tab-pill ${tab === 'notice' ? 'active' : ''}`}
							onClick={() => changeTabHandler('notice')}
						>
							<span className={'tab-dot'} />
							Notices
						</button>
						<button
							className={`tab-pill ${tab === 'faq' ? 'active' : ''}`}
							onClick={() => changeTabHandler('faq')}
						>
							<span className={'tab-dot'} />
							FAQ
						</button>
						<button
							className={`tab-pill ${tab === 'inquiry' ? 'active' : ''}`}
							onClick={() => changeTabHandler('inquiry')}
						>
							<span className={'tab-dot'} />
							Inquiry
						</button>
					</div>
				</Box>

				{/* Content area */}
				<Box component={'div'} className={'cs-body'}>
					{tab === 'notice' && <Notice />}
					{tab === 'faq' && <Faq />}
					{tab === 'inquiry' && <Inquiry />}
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(CS);
