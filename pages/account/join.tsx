import React, { useCallback, useRef, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MEMBER_TYPES = [
	{ label: 'User', value: 'USER' },
	{ label: 'Agent', value: 'AGENT' },
	{ label: 'Trainer', value: 'TRAINER' },
	{ label: 'Sales Manager', value: 'SALES_MANAGER' },
];

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [input, setInput] = useState({
		nick: '',
		password: '',
		phone: '',
		type: 'USER',
	});
	const [loginView, setLoginView] = useState<boolean>(true);
	const [avatarPreview, setAvatarPreview] = useState<string>('');
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleTypeSelect = (value: string) => {
		handleInput('type', value);
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarFile(file);
		const reader = new FileReader();
		reader.onload = (ev) => {
			setAvatarPreview(ev.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const uploadAvatarForSignup = useCallback(async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
					imageUploader(file: $file, target: $target)
				}`,
				variables: {
					file: null,
					target: 'member',
				},
			}),
		);
		formData.append(
			'map',
			JSON.stringify({
				'0': ['variables.file'],
			}),
		);
		formData.append('0', file);

		const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
			},
		});

		const uploadedPath = response?.data?.data?.imageUploader;
		if (!uploadedPath) throw new Error('Image upload failed');
		return uploadedPath;
	}, []);

	const doSignUp = useCallback(async () => {
		try {
			let memberImage: string | undefined = undefined;
			if (avatarFile) {
				memberImage = await uploadAvatarForSignup(avatarFile);
			}
			await signUp(input.nick, input.password, input.phone, input.type, memberImage);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [avatarFile, input, router, uploadAvatarForSignup]);

	if (device === 'mobile') {
		return <div>JOIN MOBILE</div>;
	}

	return (
		<Stack className={'join-page'}>
			<Stack className={'container'}>
				<Stack className={'main'}>
					{/* ──────── LEFT FORM ──────── */}
					<Stack className={'left'}>
						{/* Logo */}
						<Box className={'logo'}>
							<img src="/img/logo/elite.webp" alt="EliteFit" className={'logo-img'} />
							<div className={'logo-text'}>
								<strong>ELITE</strong><em>FIT</em>
							</div>
						</Box>

						{/* Tabs */}
						<Box className={'tabs'}>
							<button
								className={`tab ${loginView ? 'active' : ''}`}
								onClick={() => viewChangeHandler(true)}
							>
								LOGIN
							</button>
							<button
								className={`tab ${!loginView ? 'active' : ''}`}
								onClick={() => viewChangeHandler(false)}
							>
								SIGN UP
							</button>
						</Box>

						{/* ── LOGIN FORM ── */}
						{loginView && (
							<Box className={'form-wrap'}>
								<Box className={'input-wrap'}>
									<div className={'input-box'}>
										<span>Nickname</span>
										<input
											type="text"
											placeholder="Enter Nickname"
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
									</div>
									<div className={'input-box'}>
										<span>Password</span>
										<input
											type="password"
											placeholder="••••••••"
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
									</div>
								</Box>

								<Box className={'remember-info'}>
									<label className={'check-label'}>
										<input type="checkbox" defaultChecked />
										Remember me
									</label>
									<a className={'forgot-link'}>Forgot password?</a>
								</Box>

								<button
									className={'submit-btn'}
									disabled={!input.nick || !input.password}
									onClick={doLogin}
								>
									LOGIN →
								</button>

								<Box className={'ask-info'}>
									<p>
										No account?
										<b onClick={() => viewChangeHandler(false)}>SIGN UP</b>
									</p>
								</Box>
							</Box>
						)}

						{/* ── SIGNUP FORM ── */}
						{!loginView && (
							<Box className={'form-wrap'}>
								{/* Avatar upload */}
								<Box className={'avatar-section'}>
									<span className={'field-label'}>Profile photo</span>
									<Box className={'avatar-row'}>
										<div className={'avatar-preview'} onClick={handleAvatarClick}>
											{avatarPreview ? (
												<img src={avatarPreview} alt="preview" />
											) : (
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
													<circle cx="12" cy="8" r="4" />
													<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
												</svg>
											)}
										</div>
										<div className={'avatar-upload-btn'} onClick={handleAvatarClick}>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="17 8 12 3 7 8" />
												<line x1="12" y1="3" x2="12" y2="15" />
											</svg>
											{avatarPreview ? 'Change photo' : 'Upload photo'}
										</div>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											style={{ display: 'none' }}
											onChange={handleAvatarChange}
										/>
									</Box>
								</Box>

								<Box className={'input-wrap'}>
									<div className={'input-box'}>
										<span>Nickname</span>
										<input
											type="text"
											placeholder="Enter Nickname"
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'input-box'}>
										<span>Password</span>
										<input
											type="password"
											placeholder="••••••••"
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'input-box'}>
										<span>Phone</span>
										<input
											type="text"
											placeholder="+998 90 000 00 00"
											onChange={(e) => handleInput('phone', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
								</Box>

								{/* Member type */}
								<Box className={'type-section'}>
									<span className={'field-label'}>Account type</span>
									<div className={'type-grid'}>
										{MEMBER_TYPES.map((t) => (
											<button
												key={t.value}
												className={`type-btn ${input.type === t.value ? 'active' : ''}`}
												onClick={() => handleTypeSelect(t.value)}
											>
												{t.label}
											</button>
										))}
									</div>
								</Box>

								<button
									className={'submit-btn'}
									disabled={!input.nick || !input.password || !input.phone}
									onClick={doSignUp}
								>
									SIGN UP →
								</button>

								<Box className={'ask-info'}>
									<p>
										Have account?
										<b onClick={() => viewChangeHandler(true)}>LOGIN</b>
									</p>
								</Box>
							</Box>
						)}
					</Stack>

					{/* ──────── RIGHT IMAGE ──────── */}
					<Stack className={'right'}>
						<div className={'overlay'}>
							<p className={'overlay-tag'}>Premium Fitness</p>
							<h2 className={'overlay-big'}>
								TRAIN<br />HARD<br /><span>WIN.</span>
							</h2>
						</div>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
