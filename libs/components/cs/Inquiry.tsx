import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const Inquiry = () => {
	const device = useDeviceDetect();

	/** APOLLO REQUESTS **/
	/** LIFECYCLE **/
	/** HANDLERS **/

	if (device === 'mobile') {
		return <div>Inquiry MOBILE</div>;
	} else {
		return <div>Inquiry PC</div>;
	}
};

export default Inquiry;
