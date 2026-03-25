import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import TopTrainerCard from './TopTrainerCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_TRAINERS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface TopTrainersProps {
	initialInput: AgentsInquiry;
}

const TopTrainers = (props: TopTrainersProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topTrainers, setTopTrainers] = useState<Member[]>([]);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { refetch } = useQuery(GET_TRAINERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopTrainers(data?.getTrainers?.list);
		},
	});

	const likeTrainerHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const followTrainerHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const isFollowing = topTrainers.find((t) => t._id === id)?.meFollowed?.[0]?.myFollowing;
			if (isFollowing) {
				await unsubscribe({ variables: { input: id } });
			} else {
				await subscribe({ variables: { input: id } });
			}
			await refetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-trainers">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">Expert Staff</Typography>
						<Typography className="section-title">Top Trainers</Typography>
					</Stack>
					<Stack className="trainer-list">
						{topTrainers.map((trainer) => (
							<TopTrainerCard
								key={trainer._id}
								trainer={trainer}
								likeTrainerHandler={likeTrainerHandler}
								followTrainerHandler={followTrainerHandler}
							/>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="top-trainers">
			<Stack className="container">
				<Stack className="info-box">
					<Box className="left">
						<Typography className="section-label">— CERTIFIED PROS</Typography>
						<Typography className="section-title">Elite Coaches</Typography>
						<Typography className="section-sub">Train with the best — results guaranteed</Typography>
					</Box>
					<Box className="right">
						<Link href="/member?memberType=TRAINER">
							<Box className="more-box">
								<Typography>All Coaches</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Box>
				</Stack>

				<Box className="trainers-strip">
					{topTrainers.map((trainer) => (
						<TopTrainerCard
							key={trainer._id}
							trainer={trainer}
							likeTrainerHandler={likeTrainerHandler}
							followTrainerHandler={followTrainerHandler}
						/>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

TopTrainers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopTrainers;