import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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
			memberProperties
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_BY_ADMIN = gql`
	mutation UpdatePropertyByAdmin($input: PropertyUpdate!) {
		updatePropertyByAdmin(input: $input) {
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
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($input: String!) {
		removePropertyByAdmin(propertyId: $input) {
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
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
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
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
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
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/******************* 
*.   PRODUCT       *
*******************/

export const UPDATE_PRODUCT_BY_ADMIN = gql`
  mutation UpdateProductByAdmin($input: ProductUpdate!) {
    updateProductByAdmin(input: $input) {
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
            memberProperties
            memberProducts
            memberClothes
            memberEquipments
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
        }
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
    }
  }
`

export const REMOVE_PRODUCT_BY_ADMIN = gql`
  mutation RemoveProductByAdmin($input: String!) {
    removeProductByAdmin(productId: $input) {
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
            memberProperties
            memberProducts
            memberClothes
            memberEquipments
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
        }
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
    }
  }

`

/* ***********************
*.      CLOTHES          *
**************************/

export const UPDATE_CLOTHE_BY_ADMIN = gql`
  mutation UpdateClotheByAdmin($input: ClotheUpdate!) {
    updateClotheByAdmin(input: $input) {
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
  }
  
`

export const REMOVE_CLOTHE_BY_ADMIN = gql`
  mutation RemoveClotheByAdmin($input: String!) {
    removeClotheByAdmin(clotheId: $input) {
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
  }
`


/* **********************
*     EQUIPMENTS        *
*************************/

export const UPDATE_EQUIPMENT_BY_ADMIN = gql`
  mutation UpdateEquipmentByAdmin($input: EquipmentUpdate!) {
    updateEquipmentByAdmin(input: $input) {
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
  }

`

export const REMOVE_EQUIPMENT_BY_ADMIN = gql`
  mutation RemoveEquipmentByAdmin($input: String!) {
    removeEquipmentByAdmin(propertyId: $input) {
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
  }
`


/**************************
 *         ORDER        *
 *************************/

export const UPDATE_ORDER_BY_ADMIN = gql`
  mutation UpdateOrderByAdmin($input: OrderUpdate!) {
    updateOrderByAdmin(input: $input) {
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

export const UPDATE_INQUIRY_BY_ADMIN = gql`
	mutation UpdateInquiryByAdmin($input: InquiryUpdate!) {
		updateInquiryByAdmin(input: $input) {
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
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const UPDATE_NOTICE_BY_ADMIN = gql`
	mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
		updateNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
	mutation RemoveNoticeByAdmin($input: String!) {
		removeNoticeByAdmin(noticeId: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			memberId
			createdAt
			updatedAt
		}
	}
`;
