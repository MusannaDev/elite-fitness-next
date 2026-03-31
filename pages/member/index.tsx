import React, { useEffect, useRef } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberProperties from '../../libs/components/member/MemberProperties';
import MemberProducts from '../../libs/components/member/MemberProducts';
import MemberEquipments from '../../libs/components/member/MemberEquipments';
import MemberClothes from '../../libs/components/member/MemberClothes';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { MemberType } from '../../libs/enums/member.enum';

const isValidObjectId = (value?: string | null): boolean => /^[a-fA-F0-9]{24}$/.test(value ?? '');

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Default category per member type */
const getDefaultCategory = (type: MemberType | undefined): string => {
	switch (type) {
		case MemberType.TRAINER:       return 'products';
		case MemberType.SALESMANAGER: return 'equipments';
		default:                       return 'properties'; // AGENT + undefined
	}
};

const MemberPage: NextPage = () => {
	const device   = useDeviceDetect();
	const router   = useRouter();
	const category: string | undefined = router.query?.category as string | undefined;
	const rawMemberId = Array.isArray(router.query?.memberId) ? router.query.memberId[0] : router.query?.memberId;
	const memberId: string | undefined = isValidObjectId(rawMemberId) ? rawMemberId : undefined;
	const user = useReactiveVar(userVar);

	// Track whether we already redirected so we don't redirect twice
	const didRedirect = useRef(false);

	/** APOLLO REQUESTS **/
	const { data: getMemberData, loading: getMemberLoading } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
	});

	const memberType: MemberType | undefined = getMemberData?.getMember?.memberType;

	const [subscribe]        = useMutation(SUBSCRIBE);
	const [unsubscribe]      = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/**
	 * REDIRECT LOGIC
	 *
	 * We must wait until:
	 *   1. router is ready
	 *   2. GET_MEMBER has finished loading (so memberType is known)
	 *
	 * Then redirect if:
	 *   - There is no category at all, OR
	 *   - The current category doesn't belong to this member type
	 *     (e.g. URL still has ?category=properties but user is a TRAINER)
	 */
	useEffect(() => {
		if (!router.isReady)    return;
		if (getMemberLoading)   return;   // wait for memberType
		if (didRedirect.current) return;  // only redirect once per page visit

		const defaultCat = getDefaultCategory(memberType);

		// Valid categories per role
		const validCategories: Record<string, string[]> = {
			[MemberType.AGENT]:         ['properties', 'followers', 'followings', 'articles'],
			[MemberType.TRAINER]:       ['products',   'followers', 'followings', 'articles'],
			[MemberType.SALESMANAGER]: ['equipments', 'clothes',  'followers',  'followings', 'articles'],
		};

		const allowed = validCategories[memberType ?? MemberType.AGENT] ?? validCategories[MemberType.AGENT];
		const needsRedirect = !category || !allowed.includes(category);

		if (needsRedirect) {
			didRedirect.current = true;
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: defaultCat },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [router.isReady, getMemberLoading, memberType, category]);

	// Reset redirect flag when memberId changes (navigating to a different member)
	useEffect(() => {
		didRedirect.current = false;
	}, [memberId]);

	/** HANDLERS **/
	const runSafeRefetch = async (refetch: any, query: any) => {
		if (!refetch) return;
		if (typeof query === 'string' && query.length === 24) {
			await refetch({ input: query });
			return;
		}
		if (query?.search) {
			await refetch({ input: query });
			return;
		}
		await refetch();
	};

	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id)       throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			await runSafeRefetch(refetch, query);
			await sweetTopSmallSuccessAlert('Followed!', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id)       throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Unfollowed!', 800);
			await runSafeRefetch(refetch, query);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id)       return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('success', 800);
			await runSafeRefetch(refetch, query);
		} catch (err: any) {
			console.log('ERROR, likeTargetMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (id: string) => {
		try {
			if (id === user?._id) await router.push(`/mypage?memberId=${id}`);
			else                  await router.push(`/member?memberId=${id}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	/**
	 * RENDER CONTENT BY MEMBER TYPE
	 *
	 * While memberType is still loading we return null — nothing is shown
	 * until we know the real type (prevents flash of wrong content).
	 */
	const renderContent = () => {
		// Still fetching — don't render anything to avoid wrong-content flash
		if (getMemberLoading) return null;

		switch (memberType) {
			case MemberType.TRAINER:
				return category === 'products' ? <MemberProducts /> : null;

			case MemberType.SALESMANAGER:
				if (category === 'equipments') return <MemberEquipments />;
				if (category === 'clothes')    return <MemberClothes />;
				return null;

			// AGENT (default — also handles undefined while memberId resolves)
			default:
				return category === 'properties' ? <MemberProperties /> : null;
		}
	};

	if (device === 'mobile') {
		return <>MEMBER PAGE MOBILE</>;
	}

	return (
		<div id="member-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'member-page'}>
					<Stack className={'back-frame'}>
						<Stack className={'left-config'}>
							<MemberMenu
								subscribeHandler={subscribeHandler}
								unsubscribeHandler={unsubscribeHandler}
								memberType={memberType}
							/>
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{renderContent()}

								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'articles' && <MemberArticles />}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
