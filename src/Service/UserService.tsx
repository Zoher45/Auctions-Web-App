import axios from "axios";

const RegisterApi = async (firstName: string, lastName: string, email: string, password: string) => {
    return await axios.post('http://localhost:4941/api/v1/users/register', {"firstName": firstName, "lastName": lastName, "email": email, "password": password})
}

const DeleteProfileImageApi = async (userId: number, token: any) => {
    const header =  {headers: {"X-Authorization": token}};
    return await axios.delete('http://localhost:4941/api/v1/users/' + userId + '/image' , header)
}

const LoginApi = async (email:string, password:string) => {
    return await axios.post('http://localhost:4941/api/v1/users/login', {"email": email, "password": password})
}

const UploadPictureApi = async (userId: number, photo: any, token: any) => {
    let photoType = photo.type;
    if (photoType === 'image/jpg') {photoType = 'image/jpeg' }
    const header =  {headers: {"content-type": photoType, "X-Authorization": token}};

    return await axios.put('http://localhost:4941/api/v1/users/'+ userId +'/image', photo, header)
}

const LogOutApi = async (token: any) => {
    const header =  {headers: {"X-Authorization": token}};
    return await axios.post('http://localhost:4941/api/v1/users/logout', {}, header)
}

const getProfilePictureId = async (id: number) => {
    return await axios.get( "http://localhost:4941/api/v1/users/" + id + "/image")
}

const getUserByIdApi = async (userId: number, token: any) => {
    const header =  {headers: {"X-Authorization": token}};
    return await axios.get('http://localhost:4941/api/v1/users/' + userId, header)
}

const patchUserInformationApi = async (userInfo: any, userId: number, token: any) => {
    const header =  {headers: {"X-Authorization": token}};

    return await axios.patch('http://localhost:4941/api/v1/users/'+ userId, userInfo, header)
}

export {RegisterApi, LoginApi, UploadPictureApi, LogOutApi, getProfilePictureId, getUserByIdApi, DeleteProfileImageApi,patchUserInformationApi};

