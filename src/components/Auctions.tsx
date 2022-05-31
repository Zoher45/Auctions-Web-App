import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavigationBar from "../Fragments/NavigationBar";
import {AllCategoryApi, searchAuctionApi} from "../Service/AuctionsService";
import Avatar from "@mui/material/Avatar";
import {useNavigate} from "react-router-dom";
import {Autocomplete, Chip, FormControl, InputLabel, Menu, Pagination, Select, TextField} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from "@mui/material/MenuItem";
const theme = createTheme();

const Auctions = () => {
    const [auctions, setAuctions] = React.useState<Array<auction>>([])
    const [category, setCategory] = React.useState<Array<category>>([])
    const [sortBy, setSortBy] = React.useState( "Reverse chronologically by closing date")
    const [pickedCategory, setPickedCategory] = React.useState<Array<category>>([])
    const [sortByOpenOrClosed, setSortByOpenOrClosed] = React.useState("ANY")
    const [sortByList, setSortByList] = React.useState([
        "Ascending Alphabetically",
        "Descending by alphabetically",
        "Ascending by current bid",
        "Descending by current bid",
        "Ascending by reserve price",
        "Descending by reserve price",
        "Chronologically by closing date",
        "Reverse chronologically by closing date"
    ])
    const [search, setSearch] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)

    const [count, setCount]=React.useState(0)
    const navigate = useNavigate()

    const getAuctions = async () => {
        await AllCategoryApi()
            .then((response) => {
                setCategory(response.data);
            }, (error) => {
                setCategory([]);
                alert(error.response.statusText)
            })
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

    const handlePagination = (event: any, value: any) => {
        setCurrentPage(value)
    }


    React.useEffect(() => {
        getAuctions()
    }, []);

    React.useEffect(() => {
        handleSearch()
    }, [sortBy, pickedCategory, search, sortByOpenOrClosed]);

    React.useEffect(() => {
        getPageWithAddedPaginated()
    }, [currentPage])

    const getPageWithAddedPaginated = async () => {
        const startIndex = (currentPage - 1) * 5
        let query = "?count=5&startIndex="+startIndex

        if (search !== "" ) {
            query += "&q=" + search
        }

        if (sortBy !== "" ){
            query += "&sortBy="
            if (sortBy === "Ascending Alphabetically"){ query += 'ALPHABETICAL_ASC'}
            else if (sortBy === "Descending by alphabetically"){ query += 'ALPHABETICAL_DESC'}
            else if (sortBy === "Ascending by current bid"){ query += 'BIDS_ASC'}
            else if (sortBy === "Descending by current bid"){ query += 'BIDS_DESC'}
            else if (sortBy === "Ascending by reserve price"){ query += 'RESERVE_ASC'}
            else if (sortBy === "Descending by reserve price"){ query += 'RESERVE_DESC'}
            else if (sortBy === "Chronologically by closing date"){ query += 'CLOSING_LAST'}
            else if (sortBy === "Reverse chronologically by closing date"){ query += 'CLOSING_SOON'}
        }

        if (pickedCategory.length > 0) {
            for (let i=0; i < pickedCategory.length; i++) {
                query += "&categoryIds="+pickedCategory[i].categoryId
            }
        }

        query += "&status="+sortByOpenOrClosed

        await searchAuctionApi(query)
            .then((response) => {
                setAuctions(response.data.auctions)
                setCount(response.data.count)

            }, (error) => {
                alert(error.response.statusText)
            })


    }


    const addDefaultSrc = (ev: any) => {
        ev.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfoZjo2BFClW-L-P-jWaz699pTgyNV-H1ig&usqp=CAU"
    }


    const handleSearch = async () => {

        let query = "?count=5&startIndex=0"

        if (search !== "" ) {
            query += "&q=" + search
        }

        if (sortBy !== "" ){
            query += "&sortBy="
            if (sortBy === "Ascending Alphabetically"){ query += 'ALPHABETICAL_ASC'}
            else if (sortBy === "Descending by alphabetically"){ query += 'ALPHABETICAL_DESC'}
            else if (sortBy === "Ascending by current bid"){ query += 'BIDS_ASC'}
            else if (sortBy === "Descending by current bid"){ query += 'BIDS_DESC'}
            else if (sortBy === "Ascending by reserve price"){ query += 'RESERVE_ASC'}
            else if (sortBy === "Descending by reserve price"){ query += 'RESERVE_DESC'}
            else if (sortBy === "Chronologically by closing date"){ query += 'CLOSING_LAST'}
            else if (sortBy === "Reverse chronologically by closing date"){ query += 'CLOSING_SOON'}
        }

        if (pickedCategory.length > 0) {
            for (let i=0; i < pickedCategory.length; i++) {
                query += "&categoryIds="+pickedCategory[i].categoryId
            }
        }

        query += "&status="+sortByOpenOrClosed

        await searchAuctionApi(query)
            .then((response) => {
                setAuctions(response.data.auctions)
                setCount(response.data.count)

            }, (error) => {
                    alert(error.response.statusText)
            })
        setCurrentPage(1)

    }

    const getOptions = () => {

        return (
            <Stack direction={'column'}  paddingTop={3}>

                <Container>
                    <Stack direction={"column"} spacing={2} justifyContent={'space-between'}>
                        <Stack direction={"row"} spacing={1}>
                            <TextField
                                autoComplete="given-name"
                                name="search"
                                id="search"
                                label="Search Auctions"
                                value={search}
                                sx={{width: "35%"}}
                                onChange={(event) => setSearch(event.target.value)}
                            />


                                <FormControl  sx={{width: "45%"}}>
                                    <InputLabel > Select Sort By </InputLabel>
                                    <Select  value={sortBy}>
                                        {sortByList.map((sortByEach) => (
                                                <MenuItem key={sortByEach} value={sortByEach} onClick={() => setSortBy(sortByEach)}>
                                                    {sortByEach}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>

                                </FormControl>

                            <FormControl sx={{width: "20%"}}>
                                <InputLabel > Select Status By </InputLabel>
                                <Select  value={sortByOpenOrClosed}>
                                    {["ANY", "CLOSED", "OPEN"].map((sortByEach) => (
                                            <MenuItem key={sortByEach} value={sortByEach} onClick={() => setSortByOpenOrClosed(sortByEach)}>
                                                {sortByEach}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>

                            </FormControl>

                        </Stack>
                        </Stack>



                        <Stack spacing={2} width={"100%"} direction={"row"}>
                            <Autocomplete
                                multiple
                                fullWidth
                                id="tags-standard"
                                options={category}
                                getOptionLabel={(option) => option.name}
                                onChange={(event, value) => setPickedCategory(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="Category"

                                    />
                                )}
                            />

                    </Stack>

                </Container>
            </Stack>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavigationBar/>
            <main>
                {/* Hero unit */}
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        pt: 8,
                        pb: 6,
                    }}
                >
                    <Container maxWidth="sm">
                        <Typography
                            component="h1"
                            variant="h2"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Auctions
                        </Typography>



                    </Container>
                </Box>
                {getOptions()}
                <Container sx={{ py: 4 }} maxWidth="md">
                    {/* End hero unit */}
                    <Grid container spacing={4}>
                        {auctions.map((auction) => (
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
                    <Stack direction="row" spacing={2} justifyContent={"center"} paddingTop={4} paddingBottom={5}>
                        <Pagination count={(Math.ceil(count / 5))} page={currentPage} style={{justifyContent: "center", alignItems: "center"}} onChange={handlePagination}/>
                    </Stack>
                </Container>
            </main>


            {/* End footer */}
        </ThemeProvider>
    );
};

export default Auctions;