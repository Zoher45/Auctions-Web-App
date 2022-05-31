import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {getUserByIdApi, getProfilePictureId} from '../Service/UserService';
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import {AllCategoryApi, DeleteAuctionApi, getAuctionByBidderId, getAuctionBySellerId} from "../Service/AuctionsService";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import {Dialog, DialogActions, DialogContent, DialogContentText} from "@mui/material";


const theme = createTheme();

const MyAuctionPage = () => {

    const navigate = useNavigate()

    const [myAuctions, setMyAuctions] = React.useState<Array<auction>>([])
    const [myBidAuctions, setMyBidAuctions] = React.useState<Array<auction>>([])
    const [category, setCategory] = React.useState<Array<category>>()
    const [open, setOpen] = useState(false);


    React.useEffect(() => {
        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        if (getUser === null) {
            navigate('/');
            return;
        } else {
            if (getUser.token === null || getUser.token === '') {
                navigate('/');
                return;
            }
        }

        getAuctionBySellerId(getUser.userId)
            .then((response) => {
                setMyAuctions(response.data.auctions)
            }, (error) => {
            })

        getAuctionByBidderId(getUser.userId)
            .then((response) => {
                setMyBidAuctions(response.data.auctions)
            }, (error) => {
            })

        AllCategoryApi()
            .then((response) => {
                setCategory(response.data);
            }, (error) => {
                setCategory([]);
                alert(error.response.statusText)
            })


    }, [])

    const addDefaultSrc = (ev: any) => {
        ev.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfoZjo2BFClW-L-P-jWaz699pTgyNV-H1ig&usqp=CAU"
    }

    const getCategory = (categoryId: number) => {
        let messageReturn = ''
        if (category !== undefined) {
            const found = category.find(e => e.categoryId === categoryId);
            if (found != undefined) {
                messageReturn = found.name
            }
        }
        return messageReturn;
    }


    const dateDiffInDays = (endDateString: String) => {
        const today = new Date()
        const endDate = new Date(endDateString.toString())
        const utc1 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        const timeRemaining = Math.floor((utc1 - utc2) / _MS_PER_DAY)
        let returnMessage;

        if (timeRemaining <= 0) {
            returnMessage = "Closed"
        } else {
            returnMessage = "Closes in: " + Math.floor((utc1 - utc2) / _MS_PER_DAY) + " days"
        }
        return returnMessage;
    }

    const deleteAuction = async (auctionId: number) => {
        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        setOpen(false)

        await DeleteAuctionApi(auctionId, getUser.token)
            .then((response) => {
                alert("Auction has been deleted!")
                navigate('/myAuction')
                window.location.reload();

            }, (error) => {
                alert(error.response.statusText)

            })

    }

    const getMyAuctions = () => {

        return (
            <Grid container spacing={4} paddingTop={3}>
                {myAuctions.map((auction) => (
                    <Grid item key={auction.auctionId} xs={12} sm={6} md={4}>
                        <Card
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    1:1,
                                    width: '100%',
                                    height: 200,
                                }}
                                image={'http://localhost:4941/api/v1/auctions/'+ auction.auctionId + '/image'}
                                alt={'Image Not Available'}
                                onError={addDefaultSrc}

                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Stack direction={"row"} justifyContent={"space-between"} border={1} borderRadius={"10px"}>
                                    <Typography style={{fontSize:12, paddingLeft: 5}}>
                                        {getCategory(auction.categoryId)}
                                    </Typography>

                                    <Typography style={{fontSize:12, paddingRight: 5}}>
                                        {dateDiffInDays(auction.endDate)}
                                    </Typography>

                                </Stack>
                                <Typography gutterBottom style={{fontSize:18}} paddingTop={2}>
                                    {auction.title}
                                </Typography>
                                <Stack justifyContent={"left"} direction={"row"} paddingTop={2}>
                                    <Avatar src={"http://localhost:4941/api/v1/users/" + auction.sellerId + "/image"} />
                                    <Typography style={{fontSize:14, paddingLeft:20, paddingTop: 10}}>
                                        {auction.sellerFirstName}
                                    </Typography>

                                    <Typography style={{fontSize:14, paddingLeft: 5, paddingTop: 10}}>
                                        {auction.sellerLastName}
                                    </Typography>
                                </Stack>

                                <Stack justifyContent={"space-between"} direction={"row"} paddingTop={3}>
                                    <Typography style={{fontSize:13}}>
                                        Highest Bid
                                    </Typography>

                                    <Typography style={{fontSize:13}}>
                                        Reserve {auction.highestBid === null || auction.highestBid < auction.reserve?"": "met"}
                                    </Typography>
                                </Stack>

                                <Stack justifyContent={"space-between"} direction={"row"} paddingTop={1}>
                                    <Typography style={{fontSize:16}}>
                                        ${auction.highestBid>0?auction.highestBid: 0}
                                    </Typography>

                                    <Typography style={{fontSize:16}}>
                                        ${auction.reserve>0?auction.reserve:0}
                                    </Typography>
                                </Stack>

                            </CardContent>

                            <Stack direction={'row'}>
                                <CardActions>
                                    <Button size="small" onClick={() => navigate('/auction/'+auction.auctionId)}>View</Button>
                                </CardActions>

                                {dateDiffInDays(auction.endDate) !== 'Closed'?
                                    <CardActions>
                                        <Button size="small" onClick={() => navigate('/edit/'+auction.auctionId)}>Edit</Button>
                                    </CardActions>
                                    :""}

                                <CardActions>
                                    <Button size="small" style={{color:'red'}} onClick={() => setOpen(true)}>Delete</Button>
                                </CardActions>





                                <Dialog open={open} onClose={() => setOpen(false)}>
                                    <DialogContent>
                                        <DialogContentText>
                                            Are you sure you want to delete this auction?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button variant={'contained'} autoFocus onClick={async () => await deleteAuction(auction.auctionId)}> Submit </Button>
                                        <Button variant={'contained'} color={'error'} onClick={() => setOpen(false)}> Cancel </Button>
                                    </DialogActions>
                                </Dialog>



                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )
    }

    const getMyBidAuctions = () => {
        return (
            <Grid container spacing={4} paddingTop={3}>
                {myBidAuctions.map((auction) => (
                    <Grid item key={auction.auctionId} xs={12} sm={6} md={4}>
                        <Card
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    1:1,
                                    width: '100%',
                                    height: 200,
                                }}
                                image={'http://localhost:4941/api/v1/auctions/'+ auction.auctionId + '/image'}
                                alt={'Image Not Available'}
                                onError={addDefaultSrc}

                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Stack direction={"row"} justifyContent={"space-between"} border={1} borderRadius={"10px"}>
                                    <Typography style={{fontSize:12, paddingLeft: 5}}>
                                        {getCategory(auction.categoryId)}
                                    </Typography>

                                    <Typography style={{fontSize:12, paddingRight: 5}}>
                                        {dateDiffInDays(auction.endDate)}
                                    </Typography>

                                </Stack>
                                <Typography gutterBottom style={{fontSize:18}} paddingTop={2}>
                                    {auction.title}
                                </Typography>
                                <Stack justifyContent={"left"} direction={"row"} paddingTop={2}>
                                    <Avatar src={"http://localhost:4941/api/v1/users/" + auction.sellerId + "/image"} />
                                    <Typography style={{fontSize:14, paddingLeft:20, paddingTop: 10}}>
                                        {auction.sellerFirstName}
                                    </Typography>

                                    <Typography style={{fontSize:14, paddingLeft: 5, paddingTop: 10}}>
                                        {auction.sellerLastName}
                                    </Typography>
                                </Stack>

                                <Stack justifyContent={"space-between"} direction={"row"} paddingTop={3}>
                                    <Typography style={{fontSize:13}}>
                                        Highest Bid
                                    </Typography>

                                    <Typography style={{fontSize:13}}>
                                        Reserve {auction.highestBid === null || auction.highestBid < auction.reserve?"": "met"}
                                    </Typography>
                                </Stack>

                                <Stack justifyContent={"space-between"} direction={"row"} paddingTop={1}>
                                    <Typography style={{fontSize:16}}>
                                        ${auction.highestBid>0?auction.highestBid: 0}
                                    </Typography>

                                    <Typography style={{fontSize:16}}>
                                        ${auction.reserve>0?auction.reserve:0}
                                    </Typography>
                                </Stack>

                            </CardContent>

                            <CardActions>
                                <Button size="small" onClick={() => navigate('/auction/'+auction.auctionId)}>View</Button>
                            </CardActions>

                        </Card>
                    </Grid>
                ))}
            </Grid>
        )
    }


    return (
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <Container component="main" maxWidth="lg">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{paddingTop: 2, paddingBottom: 2}}>
                        My Auction Page
                    </Typography>

                    <Button variant={'contained'} onClick={() => navigate('/createAuction')}>
                        Create Auction
                    </Button>


                    <Typography component="h1" variant="h4" sx={{paddingTop: 5, paddingBottom: 3}}>
                        My Auctions
                    </Typography>


                    {getMyAuctions()}


                    <Typography component="h1" variant="h4" sx={{paddingTop: 5, paddingBottom: 3}}>
                        My Bid Auction List
                    </Typography>

                    {getMyBidAuctions()}





                </Box>
            </Container>
        </ThemeProvider>
    )


}
export default MyAuctionPage;