import axios from "axios";
import auctions from "../components/Auctions";

const AllAuctionsApi = async () =>{
    return await axios.get('http://localhost:4941/api/v1/auctions')
}

const AllCategoryApi = async () => {
    return await axios.get('http://localhost:4941/api/v1/auctions/categories')
}

const GetAuctionImageApi = async (auctionId: number) => {
    return await axios.get('http://localhost:4941/api/v1/auctions/'+ auctionId + '/image')
}

const GetAuctionByIdApi = async (auctionId: number) => {
    return await axios.get('http://localhost:4941/api/v1/auctions/'+ auctionId)
}


const GetAuctionBidsApi = async (auctionId: number) => {
    return await axios.get('http://localhost:4941/api/v1/auctions/'+ auctionId + '/bids')
}

const DeleteAuctionApi = async (auctionId: number, token: any) => {

    return await axios.delete('http://localhost:4941/api/v1/auctions/'+ auctionId, {headers: {"X-Authorization": token}})
}

const UpdateAuctionApi = async (auctionId: number, token: any, data: any) => {

    const header = {
        headers: {
            "X-Authorization": token
        }
    }
    return await axios.patch('http://localhost:4941/api/v1/auctions/'+ auctionId, data, header)
}

const UploadAuctionImageApi = async (photo: any, auctionId: number, token: any) => {
    let photoType = photo.type;
    if (photoType === 'image/jpg') {photoType = 'image/jpeg' }
    const header =  {headers: {"content-type": photoType, "X-Authorization": token}};
    return await axios.put('http://localhost:4941/api/v1/auctions/'+ auctionId +'/image', photo, header)
}

const PlaceBidApi = async (auctionId: number, bidAmount: number, token: any) => {
    const header =  {headers: {"X-Authorization": token}};

    return await axios.post('http://localhost:4941/api/v1/auctions/' + auctionId + '/bids', {
        "amount": bidAmount
    }, header)
}

const getAuctionBySellerId = async (sellerId: number) => {
    return await axios.get('http://localhost:4941/api/v1/auctions?sellerId=' + sellerId)
}

const getAuctionByBidderId = async (bidderId: number) => {
    return await axios.get('http://localhost:4941/api/v1/auctions?bidderId=' + bidderId)
}

const CreateAuctionApi = async (token: any, data: any) => {
    const header =  {headers: {"X-Authorization": token}};
    return await axios.post(`http://localhost:4941/api/v1/auctions`, data, header)
}

const searchAuctionApi = async  (search: string) => {
    return await axios.get('http://localhost:4941/api/v1/auctions' + search)
}
export {CreateAuctionApi, searchAuctionApi, getAuctionByBidderId, PlaceBidApi, AllAuctionsApi, AllCategoryApi, GetAuctionImageApi, GetAuctionByIdApi, GetAuctionBidsApi, DeleteAuctionApi, UpdateAuctionApi, UploadAuctionImageApi, getAuctionBySellerId};

