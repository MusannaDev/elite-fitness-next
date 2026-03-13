import { gql } from '@apollo/client';
import exp from 'constants';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
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
`;

/**************************
 *        PROPERTY        *
 *************************/

export const CREATE_PROPERTY = gql`
	mutation CreateProperty($input: PropertyInput!) {
		createProperty(input: $input) {
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

export const UPDATE_PROPERTY = gql`
	mutation UpdateProperty($input: PropertyUpdate!) {
		updateProperty(input: $input) {
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

export const LIKE_TARGET_PROPERTY = gql`
	mutation LikeTargetProperty($input: String!) {
		likeTargetProperty(propertyId: $input) {
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

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
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

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
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

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
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

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      PRODUCT
 **************************/

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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
  }
`

export const UPDATE_PRODUCT = gql `
  mutation UpdateProduct($input: ProductUpdate!) {
    updateProduct(input: $input) {
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
  }

`

export const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($input: String!) {
    likeTargetProduct(productId: $input) {
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
  }
`

/* **************************
*       CLOTHES             *
*****************************/

export const CREATE_CLOTHE = gql`
  mutation CreateClothe($input: ClotheInput!) {
    createClothe(input: $input) {
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

export const UPDATE_CLOTHE = gql`
  mutation UpdateClothe($input: ClotheUpdate!) {
    updateClothe(input: $input) {
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

export const LIKE_TARGET_CLOTHE = gql`
  mutation LikeTargetClothe($input: String!) {
    likeTargetClothe(clotheId: $input) {
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

export const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: EquipmentInput!) {
    createEquipment(input: $input) {
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

export const UPDATE_EQUIPMENT = gql`
  mutation UpdateEquipment($input: EquipmentUpdate!) {
    updateEquipment(input: $input) {
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

export const LIKE_TARGET_EQUIPMENT = gql`
  mutation LikeTargetEquipment($input: String!) {
    likeTargetEquipment(equipmentId: $input) {
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