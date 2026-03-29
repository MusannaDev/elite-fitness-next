import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import PopularPropertyCard from './PopularPropertyCard';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface PopularPropertiesProps {
	initialInput: PropertiesInquiry;
}

const PopularProperties = (props: PopularPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularProperties, setPopularProperties] = useState<Property[]>([]);

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const { refetch: getPropertiesRefetch } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPopularProperties(data?.getProperties?.list);
		},
	});

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!popularProperties) return null;

	if (device === 'mobile') {
		return (
			<Stack className="popular-properties">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">Most Viewed</Typography>
						<Typography className="section-title">Popular Properties</Typography>
					</Stack>
					<Stack className="card-box">
						<Swiper
							className="popular-property-swiper"
							slidesPerView={'auto'}
							centeredSlides
							spaceBetween={16}
							modules={[Autoplay]}
						>
							{popularProperties.map((property) => (
								<SwiperSlide key={property._id} className="popular-property-slide">
									<PopularPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="popular-properties">
			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— MOST POPULAR</Typography>
						<Link href="/property">
							<Box className="more-box">
								<Typography>All Locations</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Gym Spaces</Typography>
					<Typography className="section-sub">Top viewed training locations</Typography>
				</Stack>

				<Stack className="card-box">
					<Swiper
						className="popular-property-swiper"
						slidesPerView={'auto'}
						spaceBetween={20}
						modules={[Autoplay, Navigation, Pagination]}
						navigation={{
							nextEl: '.swiper-popular-next',
							prevEl: '.swiper-popular-prev',
						}}
						pagination={{ el: '.swiper-popular-pagination' }}
					>
						{popularProperties.map((property) => (
							<SwiperSlide key={property._id} className="popular-property-slide">
								<PopularPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
							</SwiperSlide>
						))}
					</Swiper>
				</Stack>

				<Stack className="pagination-box">
					<WestIcon className="swiper-popular-prev" />
					<Box className="swiper-popular-pagination" />
					<EastIcon className="swiper-popular-next" />
				</Stack>
			</Stack>
		</Stack>
	);
};

PopularProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'propertyViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularProperties;