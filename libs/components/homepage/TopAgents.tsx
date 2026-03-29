import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import Link from 'next/link';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topAgents, setTopAgents] = useState<Member[]>([]);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list);
		},
	});

	const likeAgentHandler = async (user: T, id: string) => {
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

	const followAgentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const isFollowing = topAgents.find((a) => a._id === id)?.meFollowed?.[0]?.myFollowing;
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
			<Stack className="top-agents">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-label">FITNESS EXPERTS</Typography>
						<Typography className="section-title">Meet The Agents</Typography>
					</Stack>
					<Stack className="agents-list">
						{topAgents.map((agent) => (
							<TopAgentCard
								key={agent._id}
								agent={agent}
								likeAgentHandler={likeAgentHandler}
								followAgentHandler={followAgentHandler}
							/>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="top-agents">
			<Stack className="container">
				<Stack className="info-box">
					<Stack className="info-row-top">
						<Typography className="section-label">— FITNESS EXPERTS</Typography>
						<Link href="/member?memberType=AGENT">
							<Box className="more-box">
								<Typography>All Agents</Typography>
								<img src="/img/icons/rightup.svg" alt="" />
							</Box>
						</Link>
					</Stack>
					<Box className="info-divider" />
					<Typography className="section-title">Meet The Agents</Typography>
					<Typography className="section-sub">Connecting athletes with the right services</Typography>
				</Stack>

				<Stack className="agents-strip">
					{topAgents.map((agent) => (
						<TopAgentCard
							key={agent._id}
							agent={agent}
							likeAgentHandler={likeAgentHandler}
							followAgentHandler={followAgentHandler}
						/>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;