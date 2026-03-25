import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TrendProducts from '../libs/components/homepage/TrendProducts';
import TopTrainers from '../libs/components/homepage/TopTrainers';
import PopularProperties from '../libs/components/homepage/PopularProperties';
import TopAgents from '../libs/components/homepage/TopAgents';
import TopClothes from '../libs/components/homepage/TopClothes';
import TopSalesManagers from '../libs/components/homepage/TopSalesManagers';
import TopEquipments from '../libs/components/homepage/TopEquipments';
import Advertisement from '../libs/components/homepage/Advertisement';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<TrendProducts />
				<TopTrainers />
				<PopularProperties />
				<TopAgents />
				<TopClothes />
				<TopSalesManagers />
				<TopEquipments />
				<Advertisement />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<TrendProducts />
				<TopTrainers />
				<PopularProperties />
				<TopAgents />
				<TopClothes />
				<TopSalesManagers />
				<TopEquipments />
				<TopSalesManagers />
				<Advertisement />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);