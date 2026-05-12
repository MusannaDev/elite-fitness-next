import React, { useEffect, useMemo, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { Direction, Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';
import { sortByEngagement } from '../../utils/ranking';

interface PopularPropertiesProps {
	initialInput: PropertiesInquiry;
}

const PopularProperties = (props: PopularPropertiesProps) => {
	const { initialInput } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [popularProperties, setPopularProperties] = useState<Property[]>([]);
	const [active, setActive] = useState<number>(0);
	const propertiesInput: PropertiesInquiry = {
		...initialInput,
		sort: 'propertyLikes',
		direction: Direction.DESC,
	};
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const { refetch: getPropertiesRefetch } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: propertiesInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPopularProperties(
				sortByEngagement(
					data?.getProperties?.list ?? [],
					(property: Property) => ({
						likes: property.propertyLikes,
						views: property.propertyViews,
						comments: property.propertyComments,
						rank: property.propertyRank,
					}),
					propertiesInput.limit,
				),
			);
		},
	});

	const likePropertyHandler = async (id?: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: propertiesInput });
			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const items = useMemo(() => popularProperties.slice(0, 6), [popularProperties]);

	useEffect(() => {
		if (items.length === 0) return;
		if (active > items.length - 1) setActive(0);
	}, [active, items.length]);

	const activeItem = items[active];
	const activeImage = activeItem?.propertyImages?.[0]
		? `${NEXT_PUBLIC_API_URL}/${activeItem.propertyImages[0]}`
		: '/img/home/property1.svg';

	const goPropertyDetail = async (id?: string) => {
		if (!id) return;
		await router.push({ pathname: '/property/detail', query: { id } });
	};

	if (!items.length) return null;

	return (
		<Stack className="popular-properties cinematic-mode">
			<div className="cinematic-bg" style={{ backgroundImage: `url(${activeImage})` }} />

			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— MOST POPULAR</Typography>
						<Link href="/property">
							<div className="more-box">
								<Typography>All Locations</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Link>
					</Stack>
					<div className="info-divider" />
					<Typography className="section-title">Gym Spaces</Typography>
					<Typography className="section-sub">Top viewed training locations</Typography>
				</Stack>

				<div className="carousel-shell">
					<div className="image-accordion">
						{items.map((item, index) => {
							const imageUrl = item?.propertyImages?.[0]
								? `${NEXT_PUBLIC_API_URL}/${item.propertyImages[0]}`
								: '/img/home/property1.svg';
							const isActive = index === active;

							return (
								<div
									key={item._id}
									className={`accordion-item ${isActive ? 'active' : ''}`}
									style={{ backgroundImage: `url(${imageUrl})` }}
									onClick={() => setActive(index)}
								>
										<div className="item-content">
											<div className="item-meta">
												<div className="item-icon">
													<CameraAltIcon />
												</div>
												<div>
													<h3 onClick={() => goPropertyDetail(item._id)}>{item.propertyTitle}</h3>
													<p>{item.propertyAddress}</p>
												</div>
											</div>
											<div className="item-stats">
												<div className="stat-chip">
													<BedIcon />
													<span>{item.propertyBaths} bath</span>
												</div>
												<div className="stat-chip">
													<MeetingRoomIcon />
													<span>{item.propertyRooms} rooms</span>
												</div>
												<div className="stat-chip">
													<SquareFootIcon />
													<span>{item.propertySquare} m²</span>
												</div>
											</div>
											<div className="item-actions">
												<div className="action-box">
													<RemoveRedEyeIcon />
													<span>{item.propertyViews}</span>
												</div>
												<button
													className={`action-box like ${item?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
													onClick={(e) => {
														e.stopPropagation();
														likePropertyHandler(item._id);
													}}
												>
													<FavoriteIcon />
													<span>{item.propertyLikes}</span>
												</button>
											</div>
										</div>
									</div>
								);
						})}
					</div>
				</div>

				<div className="carousel-dots">
					{items.map((item, index) => (
						<button
							key={item._id}
							className={`dot ${index === active ? 'active' : ''}`}
							onClick={() => setActive(index)}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>
			</Stack>
		</Stack>
	);
};

PopularProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
};

export default PopularProperties;
