import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const FAQ_DATA: Record<string, { id: string; subject: string; content: string }[]> = {
	property: [
		{ id: 'p1', subject: 'What types of fitness facilities are listed on EliteFit?', content: 'We list gyms, fitness studios, yoga centers, boxing clubs, swimming pools, and multi-sport complexes.' },
		{ id: 'p2', subject: 'Are the listed facilities verified?', content: 'Yes — every facility goes through our review process before being published on the platform.' },
		{ id: 'p3', subject: 'How can I find a facility near me?', content: 'Use the location filter on the Properties page to search by city, district, or map area.' },
		{ id: 'p4', subject: 'Can I list my own gym or fitness studio?', content: 'Yes. Register as an agent or sales manager and submit your facility details for review.' },
		{ id: 'p5', subject: 'What information is shown for each facility?', content: 'You can see photos, address, amenities, working hours, pricing, and available membership plans.' },
		{ id: 'p6', subject: 'Can I rent a facility for a private event or session?', content: 'Some facilities offer short-term rental options. Check the listing details or contact the agent directly.' },
		{ id: 'p7', subject: 'How do I report incorrect information about a facility?', content: 'Use the "Report" button on the listing page or contact our support team with the details.' },
		{ id: 'p8', subject: 'Are there facilities with swimming pools or spa services?', content: 'Yes, use the advanced filter to find facilities with specific amenities like pools or spa.' },
		{ id: 'p9', subject: 'Can I compare multiple facilities?', content: 'You can bookmark favorites and review them side by side on your My Page.' },
		{ id: 'p10', subject: 'What should I look for when choosing a fitness facility?', content: 'Consider location, equipment quality, cleanliness, trainer availability, pricing, and opening hours.' },
	],
	products: [
		{ id: 'pr1', subject: 'What kinds of fitness products are available on EliteFit?', content: 'We offer protein supplements, vitamins, recovery tools, resistance bands, gym bags, and more.' },
		{ id: 'pr2', subject: 'Are the products on EliteFit authentic?', content: 'Yes — all products are sourced from verified suppliers and undergo a quality check before listing.' },
		{ id: 'pr3', subject: 'How do I search for a specific product?', content: 'Use the search bar or apply filters by category, price range, or brand on the Products page.' },
		{ id: 'pr4', subject: 'Can I sell my own fitness products on EliteFit?', content: 'Yes. Reach out to our sales team to register as a seller and list your products.' },
		{ id: 'pr5', subject: 'How long does product delivery take?', content: 'Delivery times vary by seller and location. Estimated delivery is shown on each product page.' },
		{ id: 'pr6', subject: 'What is the return policy for products?', content: 'Products can be returned within 7 days if they are unused and in original packaging.' },
		{ id: 'pr7', subject: 'Do you offer bulk purchase discounts?', content: 'Some sellers offer bulk discounts. Contact the seller directly through the product page.' },
		{ id: 'pr8', subject: 'Can I leave a review for a product I purchased?', content: 'Yes, after your purchase is confirmed you can leave a rating and review on the product page.' },
		{ id: 'pr9', subject: 'Are nutritional supplements safe to purchase here?', content: 'All listed supplements are from registered brands. Always consult a professional before use.' },
		{ id: 'pr10', subject: 'What payment methods are accepted for products?', content: 'We accept credit/debit cards, online transfers, and other payment methods shown at checkout.' },
	],
	clothes: [
		{ id: 'cl1', subject: 'What types of sportswear are available on EliteFit?', content: 'We offer training tops, leggings, shorts, hoodies, sports bras, compression wear, and footwear.' },
		{ id: 'cl2', subject: 'How do I find the right size?', content: 'Each product has a size guide. Measure your chest, waist, and hips and compare with the chart.' },
		{ id: 'cl3', subject: 'Are the clothes suitable for both men and women?', content: 'Yes, we have a wide range of sportswear designed for men, women, and unisex categories.' },
		{ id: 'cl4', subject: 'Can I return clothes if they do not fit?', content: 'Yes — unworn items with original tags can be returned within 7 days of delivery.' },
		{ id: 'cl5', subject: 'Do you carry international sportswear brands?', content: 'Yes, we list products from both local and international brands including premium collections.' },
		{ id: 'cl6', subject: 'How do I care for my EliteFit sportswear?', content: 'Follow the care label on each item. Most performance fabrics require cold wash and air dry.' },
		{ id: 'cl7', subject: 'Can I sell my own sportswear brand on EliteFit?', content: 'Yes. Register as a seller through our partner program and submit your collection for review.' },
		{ id: 'cl8', subject: 'Are there seasonal sales or discounts on clothes?', content: 'Yes, we run seasonal promotions. Follow our community board for the latest offers.' },
		{ id: 'cl9', subject: 'Is custom or personalized sportswear available?', content: 'Some sellers offer custom printing or embroidery. Check the individual product listings for details.' },
		{ id: 'cl10', subject: 'What if I receive a damaged or wrong item?', content: 'Contact support within 48 hours with photos and your order number — we will resolve it quickly.' },
	],
	equipments: [
		{ id: 'eq1', subject: 'What fitness equipment categories does EliteFit offer?', content: 'We offer cardio machines, free weights, resistance machines, yoga mats, pull-up bars, and more.' },
		{ id: 'eq2', subject: 'Is the equipment listed new or second-hand?', content: 'Both options are available. Each listing clearly states the condition of the equipment.' },
		{ id: 'eq3', subject: 'Can I buy equipment for a home gym setup?', content: 'Absolutely — we have a dedicated home gym section with compact and budget-friendly options.' },
		{ id: 'eq4', subject: 'Do you offer equipment for commercial gyms?', content: 'Yes, commercial-grade equipment is available. Contact our sales team for bulk pricing.' },
		{ id: 'eq5', subject: 'Is installation or assembly service available?', content: 'Some sellers offer installation services. Check the listing or contact the seller directly.' },
		{ id: 'eq6', subject: 'What warranty comes with the equipment?', content: 'Warranty terms vary by seller. The warranty period is clearly stated on each product page.' },
		{ id: 'eq7', subject: 'How do I know if equipment is compatible with my space?', content: 'Product dimensions are listed on each page. Measure your space before purchasing.' },
		{ id: 'eq8', subject: 'Can I list my own equipment for sale?', content: 'Yes — register as a seller and submit your equipment listing for admin approval.' },
		{ id: 'eq9', subject: 'Is there after-sales support for equipment?', content: 'Yes — our support team can help connect you with the seller for maintenance or spare parts.' },
		{ id: 'eq10', subject: 'Are spare parts available for the equipment sold here?', content: 'Spare parts availability depends on the seller. Contact them directly through the listing page.' },
	],
	agents: [
		{ id: 'ag1', subject: 'What does an EliteFit agent do?', content: 'Agents manage and promote fitness facility listings, assist clients in finding the right gym, and handle inquiries.' },
		{ id: 'ag2', subject: 'How do I become an agent on EliteFit?', content: 'Register an account, select the Agent role, complete your profile, and submit it for admin approval.' },
		{ id: 'ag3', subject: 'What qualifications are needed to become an agent?', content: 'A background in fitness, sports management, or real estate is preferred but not required.' },
		{ id: 'ag4', subject: 'How do agents earn on EliteFit?', content: 'Agents earn a commission for each successful facility booking or membership deal closed through their listings.' },
		{ id: 'ag5', subject: 'Can an agent manage multiple facility listings?', content: 'Yes — agents can manage multiple listings from their dashboard with no limit.' },
		{ id: 'ag6', subject: 'What tools are available for agents?', content: 'Agents have access to listing management, inquiry tracking, performance analytics, and messaging tools.' },
		{ id: 'ag7', subject: 'How can clients contact an agent?', content: 'Clients can message agents directly through the agent profile page or by phone if listed.' },
		{ id: 'ag8', subject: 'Can I follow or save a preferred agent?', content: 'Yes — you can like and follow agents to get notified of their new listings.' },
		{ id: 'ag9', subject: 'What happens if an agent violates platform rules?', content: 'Violations are reviewed by our admin team and may result in suspension or permanent removal.' },
		{ id: 'ag10', subject: 'How do I report an issue with an agent?', content: 'Use the "Report" button on the agent profile or contact our support team directly.' },
	],
	trainers: [
		{ id: 'tr1', subject: 'What services do trainers offer on EliteFit?', content: 'Trainers offer personal training, group classes, online coaching, diet planning, and fitness assessments.' },
		{ id: 'tr2', subject: 'How do I find a trainer that suits my goals?', content: 'Filter trainers by specialization (weight loss, muscle gain, yoga, etc.), location, and availability.' },
		{ id: 'tr3', subject: 'Are the trainers on EliteFit certified?', content: 'Yes — all trainers must submit their certifications during registration for admin verification.' },
		{ id: 'tr4', subject: 'How do I become a trainer on EliteFit?', content: 'Register with the Trainer role, upload your certifications, complete your profile, and await approval.' },
		{ id: 'tr5', subject: 'Can I book a trainer for online sessions?', content: 'Yes — many trainers offer online coaching via video call. Check their profile for available formats.' },
		{ id: 'tr6', subject: 'How are trainer session fees determined?', content: 'Each trainer sets their own pricing. Fees are shown on their profile page.' },
		{ id: 'tr7', subject: 'Can I read reviews before choosing a trainer?', content: 'Yes — client reviews and ratings are visible on each trainer profile page.' },
		{ id: 'tr8', subject: 'What if I am unsatisfied with a training session?', content: 'Contact our support team within 24 hours and we will work to resolve the issue fairly.' },
		{ id: 'tr9', subject: 'Do trainers specialize in specific fitness disciplines?', content: 'Yes — trainers list their specializations such as CrossFit, yoga, boxing, swimming, and more.' },
		{ id: 'tr10', subject: 'Can a trainer create a customized workout plan for me?', content: 'Absolutely — many trainers offer personalized programs. Discuss your goals directly with them.' },
	],
	salesmanagers: [
		{ id: 'sm1', subject: 'What is the role of a sales manager on EliteFit?', content: 'Sales managers handle product and equipment sales, manage seller accounts, and support customer transactions.' },
		{ id: 'sm2', subject: 'How do I become a sales manager on EliteFit?', content: 'Register with the Sales Manager role, complete your profile with relevant experience, and get admin approval.' },
		{ id: 'sm3', subject: 'What products can a sales manager list?', content: 'Sales managers can list fitness products, sportswear, equipment, and gym accessories.' },
		{ id: 'sm4', subject: 'How does a sales manager earn on EliteFit?', content: 'Sales managers earn a commission on each completed sale processed through their listings.' },
		{ id: 'sm5', subject: 'Can a sales manager manage both products and equipment?', content: 'Yes — sales managers can list and manage multiple product categories from their dashboard.' },
		{ id: 'sm6', subject: 'What analytics are available to sales managers?', content: 'Sales managers can view views, inquiries, conversion rates, and revenue reports from their dashboard.' },
		{ id: 'sm7', subject: 'How do customers contact a sales manager?', content: 'Customers can reach out through the messaging feature on the sales manager profile page.' },
		{ id: 'sm8', subject: 'Can a sales manager offer promotional discounts?', content: 'Yes — sales managers can set promotional prices and limited-time offers on their listings.' },
		{ id: 'sm9', subject: 'What happens if a sales manager receives a complaint?', content: 'Complaints are reviewed by our admin team. Repeated violations may lead to account suspension.' },
		{ id: 'sm10', subject: 'How do I report a sales manager for misconduct?', content: 'Use the "Report" button on their profile or submit a complaint through our support page.' },
	],
	payment: [
		{ id: 'pay1', subject: 'What payment methods does EliteFit accept?', content: 'We accept credit/debit cards, bank transfers, and popular e-wallets shown at checkout.' },
		{ id: 'pay2', subject: 'Is my payment information secure?', content: 'Yes — all transactions are protected with industry-standard SSL encryption.' },
		{ id: 'pay3', subject: 'Are there any extra fees when purchasing on EliteFit?', content: 'No hidden fees — the price shown on the listing is the final price unless stated otherwise.' },
		{ id: 'pay4', subject: 'Can I get a refund if I cancel my order?', content: 'Refunds are processed within 5–7 business days depending on your payment provider.' },
		{ id: 'pay5', subject: 'What should I do if my payment fails?', content: 'Check your card details and balance. If the problem persists, contact your bank or our support team.' },
	],
	community: [
		{ id: 'c1', subject: 'What topics can I discuss in the EliteFit community?', content: 'Fitness tips, workout experiences, nutrition advice, equipment reviews, and motivational stories.' },
		{ id: 'c2', subject: 'What should I do if I see inappropriate content?', content: 'Click the "Report" button on the post or contact our admin team directly.' },
		{ id: 'c3', subject: 'Are there community posting guidelines?', content: 'Yes — keep posts respectful, relevant to fitness, and free of spam or offensive language.' },
		{ id: 'c4', subject: 'Can I share my fitness progress in the community?', content: 'Absolutely — sharing progress, milestones, and tips is highly encouraged.' },
	],
	other: [
		{ id: 'o1', subject: 'How do I contact EliteFit support?', content: 'Visit the CS page and submit your question, or reach us through the contact form.' },
		{ id: 'o2', subject: 'Can I advertise my fitness brand on EliteFit?', content: 'We are currently exploring advertising partnerships. Reach out to our team for more info.' },
		{ id: 'o3', subject: 'Is EliteFit available as a mobile app?', content: 'A mobile app is in development. Stay tuned to our community board for updates.' },
		{ id: 'o4', subject: 'Does EliteFit have a referral program?', content: 'A referral program is planned for the future. Subscribe to our updates to be notified.' },
	],
};

const CATEGORIES = [
	{ key: 'property', label: 'Properties' },
	{ key: 'products', label: 'Products' },
	{ key: 'clothes', label: 'Clothes' },
	{ key: 'equipments', label: 'Equipments' },
	{ key: 'agents', label: 'Agents' },
	{ key: 'trainers', label: 'Trainers' },
	{ key: 'salesmanagers', label: 'Sales Managers' },
	{ key: 'payment', label: 'Payment' },
	{ key: 'community', label: 'Community' },
	{ key: 'other', label: 'Other' },
];

const GROUPS = [
	{ label: 'Shop', keys: ['property', 'products', 'clothes', 'equipments'] },
	{ label: 'Team', keys: ['agents', 'trainers', 'salesmanagers'] },
	{ label: 'Support', keys: ['payment', 'community', 'other'] },
];

const Faq = () => {
	const device = useDeviceDetect();
	const [category, setCategory] = useState<string>('property');
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleChange = (id: string) => {
		setExpanded(expanded === id ? false : id);
	};

	const activeCat = CATEGORIES.find((c) => c.key === category);

	if (device === 'mobile') return <div>FAQ MOBILE</div>;

	return (
		<div className={'faq-panel'}>
			{/* ── LEFT SIDEBAR ── */}
			<aside className={'faq-sidebar'}>
				{GROUPS.map((group) => (
					<div key={group.label} className={'sidebar-group'}>
						<span className={'group-label'}>{group.label}</span>
						{CATEGORIES.filter((c) => group.keys.includes(c.key)).map((cat) => (
							<button
								key={cat.key}
								className={`sidebar-item ${category === cat.key ? 'active' : ''}`}
								onClick={() => { setCategory(cat.key); setExpanded(false); }}
							>
								<span className={'item-label'}>{cat.label}</span>
								<span className={'item-count'}>{FAQ_DATA[cat.key]?.length}</span>
							</button>
						))}
					</div>
				))}
			</aside>

			{/* ── RIGHT CONTENT ── */}
			<div className={'faq-content'}>
				<div className={'content-head'}>
					<span className={'head-eyebrow'}>{activeCat?.label}</span>
					<h2 className={'head-title'}>Frequently Asked</h2>
					<span className={'head-meta'}>{FAQ_DATA[category]?.length} questions</span>
				</div>

				<div className={'faq-list'}>
					{FAQ_DATA[category]?.map((item, index) => (
						<div
							key={item.id}
							className={`faq-item ${expanded === item.id ? 'is-open' : ''}`}
							style={{ animationDelay: `${index * 35}ms` }}
						>
							<button className={'faq-trigger'} onClick={() => handleChange(item.id)}>
								<span className={'faq-num'}>{String(index + 1).padStart(2, '0')}</span>
								<span className={'faq-question'}>{item.subject}</span>
								<span className={`faq-icon ${expanded === item.id ? 'open' : ''}`}>+</span>
							</button>
							{expanded === item.id && (
								<div className={'faq-answer'}>
									<p>{item.content}</p>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Faq;