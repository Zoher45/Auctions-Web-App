import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Alert, Badge, FormControl, InputAdornment, InputLabel, Select, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {Image, Visibility, VisibilityOff} from "@mui/icons-material";
import axios from "axios";

import {LoginApi} from '../Service/UserService';
import {useUserStore} from "../StateManagement/AuthMangement";
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
import {AllCategoryApi, GetAuctionByIdApi, UpdateAuctionApi, UploadAuctionImageApi} from "../Service/AuctionsService";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import StoreIcon from "@mui/icons-material/Store";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";

const theme = createTheme();
const mimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
const EditAuction = () => {

    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [title, setTitle] = useState('')
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState("")
    const [reserve, setReserve] = useState("")
    const [category, setCategory] = useState<any | null>(null);


    const [auction, setAuction] = React.useState<auctions>({
        title: "",
        description: "",
        categoryId: 0,
        sellerId: 0,
        reserve: 0,
        endDate: "",
        auctionId: 0,
        sellerFirstName: "",
        sellerLastName: "",
        highestBid: 0,
        numBids: 0,
    })

    const [categoryList, setCategoryList] = React.useState<Array<category>>([{categoryId:-1, name:""}])
    const navigate = useNavigate()

    React.useEffect(() => {




        AllCategoryApi()
            .then((response) => {
                setCategoryList(response.data);
            }, (error) => {
            })

        const urlPath = window.location.pathname;
        const urlArray = urlPath.split("/");
        const auctionId = parseInt(urlArray[2])

        setOriginalPicture('http://localhost:4941/api/v1/auctions/'+ auctionId + '/image')
        setImageSource('http://localhost:4941/api/v1/auctions/'+ auctionId + '/image')
        GetAuctionByIdApi(auctionId)
            .then((response) => {

                const auctionData = response.data


                setTitle(auctionData.title)
                setDescription(auctionData.description)
                setEndDate(endDate)
                setAuction(auctionData);
                setReserve(auctionData.reserve)


                const owner = response.data.sellerId;

                let getUser: AuthenticationCookie;
                getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

                if (getUser !== null) {
                    if (getUser.userId !== owner) {
                        navigate('/');
                    }
                } else { navigate('/')}

            }, (error) => {
            })
    }, [])

    const [imageSource, setImageSource] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [originalPicture, setOriginalPicture] = useState('');


    const updateDisplayPicture = async (event: any) => {
        const uploadPicture = event.target.files[0]
        setProfilePicture(uploadPicture)
        if (uploadPicture === undefined) {
            setImageSource(originalPicture);
            return;
        }
        if (!mimeTypes.includes(uploadPicture.type)) {
            setImageSource(originalPicture);
            return;
        }
        const imageSource = URL.createObjectURL(uploadPicture)
        setImageSource(imageSource)
    }


    const addDefaultSrc = (ev: any) => {
        ev.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfoZjo2BFClW-L-P-jWaz699pTgyNV-H1ig&usqp=CAU"
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("herer")

        if (title.trim().length === 0 || description.trim().length === 0 || category === null) {
            setErrorFlag(true);
            setErrorMessage("Please enter a value in the required field (*)")
            return
        }

        if (parseInt(reserve, 10) < 1) {
            setErrorFlag(true)
            setErrorMessage("Reserve must be a at least $1")
            return
        }
        let auctionReserve;
        if (reserve === "") {auctionReserve = null}
        auctionReserve = parseInt(reserve, 10)


        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)


        let data

        if(!parseInt(reserve, 10)) {
            data = {
                "title": title,
                "description": description,
                "endDate": endDate,
                "categoryId": category,
                "reserve": 0
            }

        } else {
            data = {
                "title": title,
                "description": description,
                "endDate": endDate,
                "categoryId": category,
                reserve: auctionReserve

            }
        }

        UpdateAuctionApi(auction.auctionId, getUser.token, data)
            .then((response) => {
                if (originalPicture !== imageSource && profilePicture !== null && profilePicture !== undefined) {
                    UploadAuctionImageApi(profilePicture, auction.auctionId, getUser.token)
                        .then((response) => {
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.response.statusText)
                        })
                }

                alert("Auction has been updated!")
                navigate('/myAuction')

            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })

    }

    const getCategory = () => {
        let message = ""
        if (categoryList !== undefined) {
            const found = categoryList.find(e => e.categoryId === auction.categoryId);
            if (found !== undefined) {
                message = found.name
            }
        }
        return message
    }



    return (
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <Container component="form" onSubmit={handleSubmit}  maxWidth={'md'} style={{paddingBottom:50}}>
                <Typography component="h1" variant="h4" sx ={{paddingTop: 5}}>
                    Auction Edit Page
                </Typography>

                {errorFlag ? <Alert onClose={() => {setErrorFlag(false)}} severity={'error'}>  {errorMessage}</Alert> : <></>}

                <Card sx={{ marginTop: 8, border: 1, padding: 1}}
                >

                    <Box
                        component={"img"}
                        sx={{
                          height: 300,
                          width: 300,
                          objectFit: 'contain'
                        }}
                        src={imageSource}
                        onError={addDefaultSrc}
                    />

                    <Stack direction={'column'} padding={1} spacing={2}>
                        <CardMedia
                            component="img"
                            sx={{height: '50%',
                                width: '50%',
                                objectFit: 'fill',
                            }}

                        />
                        <input
                            accept=".jpg,.jpeg,.png,.gif"
                            id='fileInput'
                            multiple
                            type="file"
                            onChange={async (event) => await updateDisplayPicture(event)}
                        />
                        <TextField
                            autoComplete="given-name"
                            required
                            name="title"
                            fullWidth
                            id="title"
                            label="Edit Title"
                            value={title}
                            onChange={(e)=> setTitle(e.target.value)}
                        />

                        <FormControl required>
                            <InputLabel > Edit Category </InputLabel>
                            <Select id={"category"} defaultValue={getCategory()}>
                                {categoryList.map((eachCategory) => (
                                    <MenuItem key={eachCategory.categoryId} value={eachCategory.name} onClick={() => setCategory(eachCategory.categoryId)}>
                                        {eachCategory.name}
                                    </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>



                        <TextField
                            label={"Edit End Date"}
                            required
                            type={"datetime-local"}
                            name="endDate"
                            id="endDate"
                            value={endDate}
                            InputLabelProps={{shrink: true}}
                            onChange={(e)=> setEndDate(e.target.value)}
                        />

                        <TextField
                            autoComplete="given-name"
                            required
                            name="description"
                            fullWidth
                            multiline
                            rows={6}
                            id="description"
                            label="Edit Description"
                            value={description}
                            onChange={(e)=> setDescription(e.target.value)}
                        />

                        <TextField
                            autoComplete="given-name"
                            name="reserve"
                            fullWidth
                            id="reserve"
                            label="Edit Reserve ($)"
                            type={'number'}
                            value={reserve}
                            onChange={(e)=> setReserve(e.target.value)}
                        />


                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            type={"submit"}
                        >
                            Submit Changes
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color={"error"}
                            onClick={() => navigate(`/auction/${auction.auctionId}`)}
                        >
                            Cancel
                        </Button>
                    </Stack>


                </Card>

            </Container>
        </ThemeProvider>
    )

}
export default EditAuction;