import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Inquiry {
	_id: string;
	inquiryType: InquiryType;
	inquiryStatus: InquiryStatus;
	inquiryTitle: string;
	inquiryContent: string;
	inquiryImages: string[];
	memberId: string;
	adminResponse?: string;
	respondedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Inquiries {
	list: Inquiry[];
	metaCounter: TotalCounter[];
}
