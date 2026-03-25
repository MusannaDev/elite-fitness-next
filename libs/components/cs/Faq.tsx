import React, { SyntheticEvent, useState } from 'react';
import { Box, Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const FAQ_DATA: Record<string, { id: string; subject: string; content: string }[]> = {
	property: [
		{ id: 'p1', subject: 'Are the properties displayed on the site reliable?', content: 'Of course — we only display verified properties that have passed our review process.' },
		{ id: 'p2', subject: 'What types of properties do you offer?', content: 'We offer single-family homes, condos, townhouses, apartments, and penthouses.' },
		{ id: 'p3', subject: 'How can I search for properties on your website?', content: 'Use our search bar to enter location, price range, bedrooms/bathrooms, and property type.' },
		{ id: 'p4', subject: 'Do you provide assistance for first-time homebuyers?', content: 'Yes, we guide you through the process and help find suitable financing options.' },
		{ id: 'p5', subject: 'What should I consider when buying a property?', content: 'Location, condition, size, amenities, and future development plans in the area.' },
		{ id: 'p6', subject: 'How long does the home-buying process typically take?', content: 'Usually 3 to 6 weeks, depending on financing, inspections, and closing procedures.' },
		{ id: 'p7', subject: 'What happens if I encounter issues after purchase?', content: 'We offer post-purchase support to address any concerns promptly.' },
		{ id: 'p8', subject: 'Do you offer properties in specific neighborhoods?', content: 'Yes, we have listings across various neighborhoods based on your preferences.' },
		{ id: 'p9', subject: 'Can I sell my property through your website?', content: 'Absolutely, we provide full-service support for selling properties as well.' },
		{ id: 'p10', subject: 'What if I need help with legal aspects of purchase?', content: 'Our team can provide basic guidance and recommend legal professionals if needed.' },
	],
	payment: [
		{ id: 'pay1', subject: 'How can I make the payment?', content: 'You make the payment securely through an authorized agent or our online portal.' },
		{ id: 'pay2', subject: 'Are there any additional fees for using your services?', content: 'No — our services are free for buyers. Sellers pay a commission upon successful sale.' },
		{ id: 'pay3', subject: 'Is there an option for installment payments?', content: 'Yes, we offer installment payment plans for certain properties. Please inquire for details.' },
		{ id: 'pay4', subject: 'Is my payment information secure?', content: 'Yes, we use industry-standard encryption technology to protect your payment data.' },
		{ id: 'pay5', subject: 'What happens if there is an issue with my payment?', content: 'Contact our support team immediately and we will resolve the issue promptly.' },
	],
	buyers: [
		{ id: 'b1', subject: 'What should buyers pay attention to?', content: 'Check whether the property suits your needs in terms of location, size, and condition.' },
		{ id: 'b2', subject: 'How can I determine if a property is within my budget?', content: 'Calculate based on income, down payment, and potential mortgage. Our agents can assist.' },
		{ id: 'b3', subject: 'What documents do I need when purchasing?', content: "You'll need ID, proof of income, bank statements, and any required loan documentation." },
		{ id: 'b4', subject: 'What factors matter when choosing a neighborhood?', content: 'Consider location, safety, schools, amenities, transportation, and future development.' },
		{ id: 'b5', subject: 'Can I negotiate the price of a property?', content: 'Yes — our agents will help you make competitive offers and negotiate terms effectively.' },
	],
	agents: [
		{ id: 'a1', subject: 'What do I need to do to become an agent?', content: 'Read our terms and conditions carefully, then contact the admin to begin the process.' },
		{ id: 'a2', subject: 'What qualifications do I need?', content: 'Complete a pre-licensing course, pass the licensing exam, and meet state requirements.' },
		{ id: 'a3', subject: 'How do I find clients as a new agent?', content: 'Build your network, use online and offline marketing, and join a reputable brokerage.' },
		{ id: 'a4', subject: 'What marketing strategies work best?', content: 'Social media, online listing platforms, networking events, and direct outreach.' },
		{ id: 'a5', subject: 'How do I stay updated with market trends?', content: 'Attend industry events, follow real estate news, and participate in ongoing training.' },
	],
	membership: [
		{ id: 'm1', subject: 'Do you have a membership service on your site?', content: 'Membership service is not available on our site yet — stay tuned for future updates.' },
		{ id: 'm2', subject: 'What are the benefits of becoming a member?', content: 'We currently do not offer membership benefits, but we are exploring future options.' },
		{ id: 'm3', subject: 'Is there a fee associated with becoming a member?', content: 'As membership services are not yet available, there are no associated fees at this time.' },
	],
	community: [
		{ id: 'c1', subject: 'What should I do if I see abusive behavior?', content: 'Please report it immediately through the report button, or contact the admin directly.' },
		{ id: 'c2', subject: 'Are there guidelines for posting?', content: 'Yes — follow our community guidelines to keep discussions respectful and relevant.' },
		{ id: 'c3', subject: 'How can I contribute positively?', content: 'Respect others, share relevant experiences, and engage constructively in discussions.' },
		{ id: 'c4', subject: 'Are there moderators in the community?', content: 'Yes, we have active moderators who monitor the community section regularly.' },
	],
	other: [
		{ id: 'o1', subject: 'Who should I contact if I want to buy your site?', content: 'We have no plans to sell the site at this time.' },
		{ id: 'o2', subject: 'Can I advertise my services on your website?', content: 'We currently do not offer advertising opportunities on our platform.' },
		{ id: 'o3', subject: 'Are there sponsorship opportunities available?', content: 'At this time, we do not have sponsorship opportunities.' },
		{ id: 'o4', subject: 'Is there a referral program?', content: "We don't have a referral program in place currently." },
	],
};

const CATEGORIES = [
	{ key: 'property', label: 'Property' },
	{ key: 'payment', label: 'Payment' },
	{ key: 'buyers', label: 'For Buyers' },
	{ key: 'agents', label: 'For Agents' },
	{ key: 'membership', label: 'Membership' },
	{ key: 'community', label: 'Community' },
	{ key: 'other', label: 'Other' },
];

const Faq = () => {
	const device = useDeviceDetect();
	const [category, setCategory] = useState<string>('property');
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleChange = (id: string) => {
		setExpanded(expanded === id ? false : id);
	};

	if (device === 'mobile') return <div>FAQ MOBILE</div>;

	return (
		<Stack className={'faq-timeline'}>
			{/* Category strip */}
			<div className={'faq-categories'}>
				{CATEGORIES.map((cat) => (
					<button
						key={cat.key}
						className={`faq-cat-btn ${category === cat.key ? 'active' : ''}`}
						onClick={() => { setCategory(cat.key); setExpanded(false); }}
					>
						{cat.label}
					</button>
				))}
			</div>

			{/* Accordion list */}
			<div className={'faq-list'}>
				{FAQ_DATA[category]?.map((item, index) => (
					<div
						key={item.id}
						className={`faq-item ${expanded === item.id ? 'is-open' : ''}`}
						style={{ animationDelay: `${index * 60}ms` }}
					>
						<button className={'faq-question'} onClick={() => handleChange(item.id)}>
							<span className={'faq-q-badge'}>Q</span>
							<span className={'faq-q-text'}>{item.subject}</span>
							<span className={`faq-chevron ${expanded === item.id ? 'rotated' : ''}`}>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</span>
						</button>
						{expanded === item.id && (
							<div className={'faq-answer'}>
								<span className={'faq-a-badge'}>A</span>
								<p className={'faq-a-text'}>{item.content}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</Stack>
	);
};

export default Faq;