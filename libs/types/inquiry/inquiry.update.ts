import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';

export interface InquiryUpdate {
	_id: string;
	inquiryType?: InquiryType;
	inquiryStatus?: InquiryStatus;
	inquiryTitle?: string;
	inquiryContent?: string;
	inquiryImages?: string[];
	adminResponse?: string;
}
