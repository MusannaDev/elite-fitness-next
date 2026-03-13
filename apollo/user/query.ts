import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TRAINERS = gql(`
	query GetTrainers($input: TrainersInquiry!) {
    getTrainers(input: $input) {
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
            memberProperties
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
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        metaCounter {
            total
        }
    }
  }
`)


export const GET_SALES_MANAGERS = gql(`
	query GetSalesManagers($input: SalesManagerInquiry!) {
    getSalesManagers(input: $input) {
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
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        metaCounter {
            total
        }
    }
  }
`)

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
	getMember(memberId: $input) {
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
		memberArticles
		memberPoints
		memberLikes
		memberViews
		memberFollowings
		memberFollowers
		memberRank
		memberWarnings
		memberBlocks
		deletedAt
		createdAt
		updatedAt
		accessToken
		meFollowed {
			followingId
			followerId
			myFollowing
		}
}
}
`);

/**************************
 *        PROPERTY        *
 *************************/

export const GET_PROPERTY = gql`
	query GetProperty($input: String!) {
		getProperty(propertyId: $input) {
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
				memberPoints
				memberLikes
				memberViews
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
`;

export const GET_PROPERTIES = gql`
	query GetProperties($input: PropertiesInquiry!) {
		getProperties(input: $input) {
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
				propertyRank
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
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PROPERTIES = gql`
	query GetAgentProperties($input: AgentPropertiesInquiry!) {
		getAgentProperties(input: $input) {
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
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
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
				propertyComments
				propertyRank
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
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
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
				propertyComments
				propertyRank
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
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
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

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
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

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
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
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/*************************
*         PRODUCT        *
*************************/

export const GET_PRODUCT = gql`
  query GetProduct($input: String!) {
    getProduct(productId: $input) {
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

export const GET_TRAINER_PRODUCTS = gql`
  query GetTrainerProducts($input: TrainerProductsInquiry!) {
    getTrainerProducts(input: $input) {
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

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
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

export const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts($input: ProductOrdinaryInquiry!) {
    getFavoriteProducts(input: $input) {
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

export const GET_VISITED_PRODUCTS = gql`
  query GetVisitedProducts($input: ProductOrdinaryInquiry!) {
    getVisitedProducts(input: $input) {
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

export const GET_CLOTHE = gql`
  query GetClothe($input: String!) {
    getClothe(clotheId: $input) {
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

export const GET_SALES_MANAGER_CLOTHES = gql`
  query GetSalesManagerClothes($input: SalesManagerClotheInquiry!) {
    getSalesManagerClothes(input: $input) {
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

export const GET_CLOTHES = gql`
  query GetClothes($input: ClotheInquiry!) {
    getClothes(input: $input) {
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
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
        }
        metaCounter {
            total
        }
    }
  }
`

export const GET_FAVORITE_CLOTHES = gql`
  query GetFavoriteClothes($input: ClotheOrdinaryInquiry!) {
    getFavoriteClothes(input: $input) {
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

export const GET_VISITED_CLOTHES = gql`
  query GetVisitedClothes($input: ClotheOrdinaryInquiry!) {
    getVisitedClothes(input: $input) {
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

export const GET_EQUIPMENT = gql`
  query GetEquipment($input: String!) {
    getEquipment(equipmentId: $input) {
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

export const GET_SALES_MANAGER_EQUIPMENTS = gql`
  query GetSalesManagerEquipments($input: SalesManagerEquipmentsInquiry!) {
    getSalesManagerEquipments(input: $input) {
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

export const GET_EQUIPMENTS = gql`
  query GetEquipments($input: EquipmentsInquiry!) {
    getEquipments(input: $input) {
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
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
        }
        metaCounter {
            total
        }
    }
  }
`

export const GET_LIKED_EQUIPMENTS = gql`
  query GetLikedEquipments($input: BasicInquiry!) {
    getLikedEquipments(input: $input) {
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

export const GET_SEEN_EQUIPMENTS = gql`
  query GetSeenEquipments($input: BasicInquiry!) {
    getSeenEquipments(input: $input) {
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
