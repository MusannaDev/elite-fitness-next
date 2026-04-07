import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en" data-theme="light">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/elite.svg" />

				{/* SEO */}
				<meta name="keyword" content={'elitefit, elitefit.uz, adam mern, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={
						'Find the best fitness equipment, clothes, and gym memberships at EliteFit.uz | ' +
						'Покупайте спортивное оборудование, одежду и абонементы в тренажерный зал на EliteFit.uz | ' +
						'최고의 피트니스 장비, 운동복, 헬스장 멤버십을 EliteFit.uz에서 찾아보세요 | ' +
						"En iyi fitness ekipmanları, spor kıyafetleri ve spor salonu üyeliklerini EliteFit.uz'de bulun | " +
						'اعثر على أفضل معدات اللياقة البدنية والملابس الرياضية وعضويات الصالة الرياضية في EliteFit.uz | ' +
						'Find top fitness equipment, sportswear, and gym memberships at EliteFit.uz'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
