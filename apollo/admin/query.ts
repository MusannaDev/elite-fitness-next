import { gql } from '@apollo/client';
import exp from 'constants';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberProperties
				memberRank
				memberArticles
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const GET_ALL_PROPERTIES_BY_ADMIN = gql`
	query GetAllPropertiesByAdmin($input: AllPropertiesInquiry!) {
		getAllPropertiesByAdmin(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBaths
				propertyRooms
				propertyViews
				propertyLikes
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;


/* **********************
*    PRODUCTS           *
************************/

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
  query GetAllProductsByAdmin($input: AllProductsInquiry!) {
    getAllProductsByAdmin(input: $input) {
        list {
            _id
            productCategory
            productStatus
            productName
            productBrand
            productPrice
            productWeight
            productLeftCount
            productBenefits
            productFlavor
            productCalories
            productProteinPerServing
            productDesc
            productImages
            isBestseller
            productViews
            productLikes
            productComments
            productRank
            memberId
            soldAt
            deletedAt
            createdAt
            updatedAt
        }
        metaCounter {
            total
        }
    }
  }
`

/* ********************
*       CLOTHES       *
**********************/

export const GET_ALL_CLOTHES_BY_ADMIN = gql`
  query GetAllClothesByAdmin($input: AllClotheInquiry!) {
    getAllClothesByAdmin(input: $input) {
        list {
            _id
            clotheCategory
            clotheStatus
            clotheName
            clotheBrand
            clothePrice
            clotheMaterial
            clotheSize
            clotheGender
            clotheColor
            clotheLeftCount
            clotheImages
            clotheDesc
            isBestseller
            clotheViews
            clotheLikes
            clotheComments
            clotheRank
            memberId
            soldAt
            deletedAt
            createdAt
            updatedAt
        }
        metaCounter {
            total
        }
    }
  }

`

/* **********************
*     EQUIPMENTS        *
*************************/

export const GET_ALL_EQUIPMENTS_BY_ADMIN = gql`
  query GetAllEquipmentsByAdmin($input:AllEquipmentsInquiry!) {
    getAllEquipmentsByAdmin(input: $input) {
        list {
            _id
            equipmentCategory
            equipmentStatus
            equipmentName
            equipmentBrand
            equipmentPrice
            equipmentMaterial
            equipmentWeightCapacity
            equipmentLocation
            equipmentWeight
            equipmentLeftCount
            equipmentImages
            equipmentDesc
            isBestseller
            equipmentViews
            equipmentLikes
            equipmentComments
            equipmentRank
            memberId
            soldAt
            deletedAt
            createdAt
            updatedAt
        }
        metaCounter {
            total
        }
    }
  }
`


/**************************
 *         ORDER        *
 *************************/

export const GET_ORDERS_BY_ADMIN = gql`
  query GetMyOrders($input: OrderInquiry!) {
    getMyOrders(input: $input) {
        _id
        orderTotal
        orderDelivery
        orderStatus
        paymentMethod
        memberId
        createdAt
        updatedAt
        orderItems {
            _id
            itemQuantity
            itemPrice
            itemType
            orderId
            itemId
            createdAt
            updatedAt
        }
    }
  }
`

/**************************
 *        INQUIRY         *
 *************************/

export const GET_INQUIRIES_BY_ADMIN = gql`
	query GetInquiriesByAdmin($input: InquiriesInquiry!) {
		getInquiriesByAdmin(input: $input) {
			list {
				_id
				inquiryType
				inquiryStatus
				inquiryTitle
				inquiryContent
				inquiryImages
				memberId
				adminResponse
				respondedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_INQUIRIES_BY_ADMIN = GET_INQUIRIES_BY_ADMIN;

/**************************
 *         NOTICE         *
 *************************/

export const GET_NOTICES_BY_ADMIN = gql`
	query GetNoticesByAdmin($input: NoticesInquiry!) {
		getNoticesByAdmin(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_NOTICES_BY_ADMIN = GET_NOTICES_BY_ADMIN;
