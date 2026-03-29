import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';

const Footer = () => {
	const device = useDeviceDetect();

	const FooterContent = () => (
		<Stack className={'footer-container'}>
			{/* TOP ACCENT LINE */}
			<div className={'footer-accent-line'}>
				<span></span><span></span><span></span>
			</div>

			<Stack className={'footer-top'}>
				{/* BRAND COL */}
				<Box component={'div'} className={'footer-brand'}>
					<div className={'brand-logo'}>
						<img src="/img/logo/elite.webp" alt="EliteFit" />
						<div className={'brand-name'}>
							<strong>ELITE</strong><em>FIT</em>
						</div>
					</div>
					<p className={'brand-tagline'}>Push Beyond Your Limits. Every Day.</p>
					<div className={'footer-contact'}>
						<div className={'contact-item'}>
							<span className={'contact-label'}>HOTLINE</span>
							<a href="tel:+821048672909">+82 10 4867 2909</a>
						</div>
						<div className={'contact-item'}>
							<span className={'contact-label'}>LIVE SUPPORT</span>
							<a href="tel:+821048672909">+82 10 4867 2909</a>
						</div>
					</div>
					<div className={'social-links'}>
						<a href="#" aria-label="Facebook"><FacebookOutlinedIcon /></a>
						<a href="#" aria-label="Telegram"><TelegramIcon /></a>
						<a href="#" aria-label="Instagram"><InstagramIcon /></a>
						<a href="#" aria-label="Twitter"><TwitterIcon /></a>
						<a href="#" aria-label="YouTube"><YouTubeIcon /></a>
					</div>
				</Box>

				{/* LINKS COLS */}
				<Box component={'div'} className={'footer-links-grid'}>
					<div className={'footer-col'}>
						<h4>Explore</h4>
						<Link href={'/property'}><span>Properties</span></Link>
						<Link href={'/product'}><span>Products</span></Link>
						<Link href={'/equipment'}><span>Equipment</span></Link>
						<Link href={'/clothes'}><span>Apparel</span></Link>
					</div>
					<div className={'footer-col'}>
						<h4>Members</h4>
						<Link href={'/agent'}><span>Agents</span></Link>
						<Link href={'/trainer'}><span>Trainers</span></Link>
						<Link href={'/seller'}><span>Sales Managers</span></Link>
						<Link href={'/community?articleCategory=FREE'}><span>Community</span></Link>
					</div>
					<div className={'footer-col'}>
						<h4>Support</h4>
						<span>Terms of Use</span>
						<span>Privacy Policy</span>
						<span>Pricing Plans</span>
						<Link href={'/cs'}><span>Contact Support</span></Link>
						<span>FAQs</span>
					</div>
					<div className={'footer-col'}>
						<h4>Discover</h4>
						<span>Seoul</span>
						<span>Gyeongido</span>
						<span>Busan</span>
						<span>Jejudo</span>
					</div>
				</Box>
			</Stack>

			{/* NEWSLETTER */}
			<Box component={'div'} className={'newsletter-band'}>
				<div className={'newsletter-left'}>
					<span className={'newsletter-label'}>STAY IN THE GAME</span>
					<p>Get the latest workouts, deals & fitness tips</p>
				</div>
				<div className={'newsletter-form'}>
					<input type="email" placeholder={'Enter your email address'} />
					<button>Subscribe</button>
				</div>
			</Box>

			{/* BOTTOM */}
			<Stack className={'footer-bottom'}>
				<span>© {moment().year()} EliteFit — All Rights Reserved</span>
				<div className={'footer-bottom-links'}>
					<span>Privacy</span>
					<span>Terms</span>
					<span>Sitemap</span>
				</div>
			</Stack>
		</Stack>
	);

	return (
		<div id="footer-wrapper">
			<FooterContent />
		</div>
	);
};

export default Footer;