import { Direction } from '../../enums/common.enum';
import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';

export interface InquiryInput {
	inquiryType: InquiryType;
	inquiryTitle: string;
	inquiryContent: string;
	inquiryImages?: string[];
	memberId?: string;
}

interface IISearch {
	inquiryType?: InquiryType;
	inquiryStatus?: InquiryStatus;
	text?: string;
}

export interface InquiriesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: IISearch;
}
