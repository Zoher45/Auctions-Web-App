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
import {
    AllAuctionsApi,
    AllCategoryApi,
    DeleteAuctionApi,
    GetAuctionBidsApi,
    GetAuctionByIdApi, PlaceBidApi
} from "../Service/AuctionsService";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Link from "@mui/material/Link";
import {Dialog, DialogActions, DialogContent, DialogContentText, FormControl, TextField} from "@mui/material";

const theme = createTheme();

const IndividualAuction = () => {
    const navigate = useNavigate()
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
    const [auctions, setAuctions] = React.useState<Array<auction>>([])
    const [categoryList, setCategoryList] = React.useState<Array<category>>()
    const [time, setTime] = React.useState("")
    const [bidList, setBidList] = React.useState<Array<bid>>()
    const [open, setOpen] = useState(false);
    const [bidOpen,setBidOpen] = useState(false)

    React.useEffect(() =>{
        const urlPath = window.location.pathname;
        const urlArray = urlPath.split("/");
        const auctionId = parseInt(urlArray[2])

        GetAuctionByIdApi(auctionId)
            .then((response) => {
                setAuction(response.data);
                const time = response.data.endDate.split("T");
                const timeString = "End Date: " + time[0] + " - " + time[1].split(".")[0]
                setTime(timeString)
            }, (error) => {
            })
        AllAuctionsApi()
            .then((response) => {
                setAuctions(response.data.auctions);
            }, (error) => {
            })
        AllCategoryApi()
            .then((response) => {
                setCategoryList(response.data);
                }, (error) => {
                })

        GetAuctionBidsApi(auctionId)
            .then((response) => {
                setBidList(response.data);
            }, (error) => {
            })

    }, [])

    const getTopBid = () => {
        if (bidList !== undefined && bidList.length > 0) {
                return (
                    <Stack justifyContent={"left"} direction={"row"} paddingLeft={1}>

                        <Typography style={{fontSize:15, paddingLeft: 5, paddingTop: 5, paddingRight: 10}}>
                            Top Bidder:
                        </Typography>
                        <Avatar src={"http://localhost:4941/api/v1/users/" + bidList[0].bidderId + "/image"} />
                        <Typography style={{fontSize:18, paddingLeft:20, paddingTop: 5}}>
                            {bidList[0].firstName}
                        </Typography>
                        <Typography style={{fontSize:18, paddingLeft: 5, paddingTop: 5}}>
                            {bidList[0].lastName}
                        </Typography>
                    </Stack>
                )}
        return false;
    }

    const addDefaultSrc = (ev: any) => {
        ev.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfoZjo2BFClW-L-P-jWaz699pTgyNV-H1ig&usqp=CAU"
    }



    const getBidsHistory = () => {
        if (bidList !== undefined && bidList.length > 0) {

            return (
                <Card sx={{padding: 1, width: "75vw"}}>
                    <Grid container spacing={2} >
                        {bidList.map((bids) => (
                            <Grid item key={bids.bidderId} xs={15} sm={5} md={20}>

                                <Card
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 1, borderColor: 'grey.500', padding: 1}}
                                >
                                    <Stack direction={'row'} spacing={1}  justifyContent={'space-between'}>
                                        <Typography style={{paddingLeft: 10, paddingTop: 5}}>
                                            ${bids.amount}
                                        </Typography>
                                        <Stack direction={'row'} spacing={2}>
                                            <Avatar src={"http://localhost:4941/api/v1/users/" + bids.bidderId +"/image"} />
                                            <Typography style={{paddingTop: 5}}>
                                                {bids.firstName + " " + bids.lastName}
                                            </Typography>
                                        </Stack>

                                        <Typography style={{paddingRight: 10, paddingTop: 5}}>
                                            { bids.timestamp.split("T")[0] + " - " + (bids.timestamp.split("T")[1]).split(".")[0]}
                                        </Typography>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))
                        }
                    </Grid>
                </Card>

            );
        }

    }

    const getCategoryName = (categoryId: number) => {
        let messageReturn = ''
        if (categoryList !== undefined) {
            const found = categoryList.find(e => e.categoryId === categoryId);
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

    const similarAuctions = () => {
        const similarAuctions = [];
        let counter = 0
        for (let i =0; i < auctions.length; i++) {
            if (auctions[i].auctionId !== auction.auctionId && (auctions[i].categoryId === auction.categoryId || auctions[i].sellerId === auction.sellerId)) {
                similarAuctions[counter] = auctions[i]
                counter++;
            }
        }
        return(
            <Card sx={{padding: 1, width: "75vw"}}>
                <Grid container spacing={2} >
                    {similarAuctions.map((eachAuction) => (
                        <Grid item key={eachAuction.auctionId} xs={12} sm={6} md={4}>
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
                                    image={'http://localhost:4941/api/v1/auctions/'+ eachAuction.auctionId + '/image'}
                                    alt={'Image Not Available'}
                                    onError={addDefaultSrc}

                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction={"row"} justifyContent={"space-between"} border={1} borderRadius={"10px"}>
                                        <Typography style={{fontSize:12, paddingLeft: 5}}>
                                            {getCategoryName(eachAuction.categoryId)}
                                        </Typography>

                                        <Typography style={{fontSize:12, paddingRight: 5}}>
                                            {dateDiffInDays(eachAuction.endDate)}
                                        </Typography>

                                    </Stack>
                                    <Typography gutterBottom style={{fontSize:18}} paddingTop={2}>
                                        {eachAuction.title}
                                    </Typography>
                                    <Stack justifyContent={"left"} direction={"row"} paddingTop={2}>
                                        <Avatar src={"http://localhost:4941/api/v1/users/" + eachAuction.sellerId + "/image"} />
                                        <Typography style={{fontSize:14, paddingLeft:20, paddingTop: 10}}>
                                            {eachAuction.sellerFirstName}
                                        </Typography>

                                        <Typography style={{fontSize:14, paddingLeft: 5, paddingTop: 10}}>
                                            {eachAuction.sellerLastName}
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
                                    <Link href={'/auction/'+eachAuction.auctionId}>
                                        <Button size="small">View</Button>
                                    </Link>

                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                    }
                </Grid>
            </Card>
        );
    }

    const deleteAuction = async () => {
        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        setOpen(false)

        await DeleteAuctionApi(auction.auctionId, getUser.token)
            .then((response) => {
                alert("Auction has been deleted!")
                navigate('/')
            }, (error) => {
                alert(error.response.statusText)

            })

    }

    const handleBid = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const getBidAmount = data.get('bid');

        if (getBidAmount === null) {
            alert("Please enter amount to bid")
            return
        }
        setBidOpen(false)

        const bidAmount =  parseInt(getBidAmount.toString(), 10)

        const isDecimal = (bidAmount - Math.floor(bidAmount)) !== 0;

        if (isDecimal) {
            alert("Amount cannot be a decimal")
            return
        }
        if (bidAmount <= 0) {
            alert("Minimum bid has to be $1")
            return
        }
        if (bidAmount <= auction.highestBid) {
            alert("Bid must be greater than the current highest bid")
            return
        }
        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        PlaceBidApi(auction.auctionId, bidAmount, getUser.token)
            .then((response) => {
                window.location.reload()
                alert("Bid made successfully!")

            }, (error) => {
                alert(error.response.statusText)
            })


    }


    const getButtons = () => {

        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

        const checkClosed = dateDiffInDays(auction.endDate)

        let editable = false;
        let loggedIn = false;

        if (getUser !== null) {

            editable = (auction.sellerId === getUser.userId)

            if(getUser.token) {
                loggedIn = true
            }
        }


        return (
            <Stack direction={'row'} spacing={2} paddingTop={2} paddingBottom={2}>

                <Button variant={'contained'} onClick={async () => await navigate('/')}>
                    Go Back
                </Button>

                {!editable && checkClosed !== 'Closed' && loggedIn?
                    <Stack>
                        <Button variant={'contained'} onClick={() => setBidOpen(true)}>
                            Make a Bid
                        </Button>

                        <Dialog open={bidOpen} onClose={() => setBidOpen(false)}>
                            <Box component={"form"} onSubmit={handleBid}>
                                <DialogContent>
                                    <TextField
                                        autoComplete="given-name"
                                        required
                                        name="bid"
                                        fullWidth
                                        id="bid"
                                        type={"number"}
                                        label="Enter Bid Amount ($)"
                                    />


                                </DialogContent>
                                <DialogActions>
                                    <Button variant={'contained'} autoFocus type={'submit'}> Submit Bid</Button>
                                    <Button variant={'contained'} color={'error'} onClick={() => setBidOpen(false)}> Cancel </Button>
                                </DialogActions>
                            </Box>
                        </Dialog>
                    </Stack>

                :   <Link onClick = {() => navigate('/login')}>
                        <Typography variant="h6" sx={{paddingTop: 2, paddingBottom: 2}}>
                            Login/Register to start bidding
                        </Typography>
                    </Link>}

                {editable && (bidList!== undefined && bidList.length === 0) && checkClosed !== 'Closed'?
                    <Button variant={'contained'} onClick={() =>  navigate('/edit/'+auction.auctionId)}>
                        Edit
                    </Button>
                :""}

                {editable?
                    <Stack>
                        <Button variant={'contained'} color={'error'} onClick={() => setOpen(true)}>
                            Delete
                        </Button>
                        <Dialog open={open} onClose={() => setOpen(false)}>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete this auction?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button variant={'contained'} autoFocus onClick={async () => await deleteAuction()}> Submit </Button>
                                <Button variant={'contained'} color={'error'} onClick={() => setOpen(false)}> Cancel </Button>
                            </DialogActions>
                        </Dialog>
                    </Stack>

                    :""}
            </Stack>

        )
    }


    return(
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <Container component="main" maxWidth="xl">
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
                        Auction Details
                    </Typography>

                    {getButtons()}

                    <Stack direction={"row"} spacing={3} >
                            <Card sx={{width: "75%"}}>
                                <CardMedia
                                    component="img"
                                    sx={{height: '100%',
                                        width: '100%',
                                        objectFit: 'fill'
                                    }}
                                    image={'http://localhost:4941/api/v1/auctions/'+ auction.auctionId + '/image'}
                                    onError={addDefaultSrc}
                                />
                            </Card>

                        <Card >
                            <Stack direction={"column"} spacing={2} >
                                <Stack justifyContent={'center'}>
                                    <Typography gutterBottom style={{fontSize:25}} justifyContent={'center'} paddingTop={2}>
                                        {auction.title}
                                    </Typography>

                                </Stack>


                                <Stack direction={"row"} justifyContent={"space-between"} border={1} borderRadius={"10px"}>
                                    <Typography style={{fontSize:12, paddingLeft: 10}}>
                                        {getCategoryName(auction.categoryId)}
                                    </Typography>

                                    <Typography style={{fontSize:12, paddingRight: 10}}>
                                        {time}
                                    </Typography>

                                </Stack>

                                <Stack justifyContent={"left"} direction={"row"} paddingTop={2} paddingLeft={3}>
                                    <Avatar src={"http://localhost:4941/api/v1/users/" + auction.sellerId + "/image"} />
                                    <Typography style={{fontSize:18, paddingLeft:20, paddingTop: 5}}>
                                        {auction.sellerFirstName}
                                    </Typography>

                                    <Typography style={{fontSize:18, paddingLeft: 5, paddingTop: 5}}>
                                        {auction.sellerLastName}
                                    </Typography>
                                </Stack>
                                <Stack>
                                    <Typography align={'left'} style={{fontSize:15, paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
                                        {auction.description}
                                    </Typography>

                                </Stack>

                                <Stack justifyContent={"left"} direction={"row"} paddingLeft={1}>

                                    <Typography style={{fontSize:16}}>
                                        Reserve{auction.highestBid === null || auction.highestBid < auction.reserve?"": "met"} ${auction.reserve>0?auction.reserve:0}
                                    </Typography>


                                </Stack>

                                <Stack justifyContent={"space-between"} direction={"row"} paddingTop={1}>
                                    <Typography style={{fontSize:16, paddingLeft: 10}}>
                                       Highest Bid ${auction.highestBid>0?auction.highestBid: 0}
                                    </Typography>
                                </Stack>

                                <Stack justifyContent={'left'}>
                                    <Typography>
                                        Number of bids {bidList === undefined || bidList.length === 0?0:bidList.length}
                                    </Typography>
                                </Stack>

                                {bidList === undefined?"": getTopBid()}
                                <Stack paddingBottom={3} />
                            </Stack>
                        </Card>
                    </Stack>
                    <Typography component="h1" variant="h5" sx={{paddingTop: 2, paddingBottom: 2}}>
                        Bid History
                    </Typography>

                    {bidList ===undefined || bidList.length<= 0?
                        <Typography variant="h6">
                            No Bid History
                        </Typography>

                        :getBidsHistory()}

                    <Typography component="h1" variant="h5" sx={{paddingTop: 2, paddingBottom: 2}}>
                        Similar Auctions
                    </Typography>

                    {similarAuctions()}

                    <Stack paddingBottom={3} />


                </Box>
            </Container>
        </ThemeProvider>
    );
}
export default IndividualAuction;