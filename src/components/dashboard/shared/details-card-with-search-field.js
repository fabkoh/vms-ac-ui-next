import Warning from "@mui/icons-material/Warning";
import { Card, CardHeader, Grid, Link, Divider, Chip, TextField, Box, InputAdornment, Typography, Collapse, IconButton } from "@mui/material";
import NextLink from "next/link";
import { SeverityPill } from "../../severity-pill";
import { useState } from "react";
import { Search } from "../../../icons/search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "./expand-more";
import { Clear } from "@mui/icons-material";

/*
compulsory fields
    renderChip : function (entity) => JSX
    entities : list of entities
    getLabel : (entity) => string
    searchFilter : function (list of entities, string) => list of entities

optional fields
    title : string
    subheader : string
    emptyLabel : string
    placeholder : string
    noneFoundText : string
    icon : JSX
*/

const EndAdornment = ({ inputValue, clearInput }) => {
    if (inputValue) {
        return (
            <InputAdornment position="end">
                <IconButton  onClick={clearInput}> 
                    <Clear />
                </IconButton>
            </InputAdornment>
        )
    } else {
        return null
    }
}

export default function DetailsCardWithSearchField({
    title ="",
    subheader = "",
    entities,
    getLabel,
    getLink,
    emptyLabel = "",
    searchFilter,
    placeholder = "",
    noneFoundText = "",
    showErr = false,
    // boolean function that takes in the entity, true means it will be default color else it will be error color
    errFunction = (e) => {return true},
    icon = false
}) {

    const [inputValue, setInputValue] = useState('');
    const handleChange = (e) => setInputValue(e.target.value);
    const clearInput = () => setInputValue('');

    const renderContents = (entities) => {
        if (entities.length == 0) {
            return (
                <Grid
                    item
                    paddingRight={3}
                    paddingBottom={3}
                >
                    <Typography fontStyle="italic">{noneFoundText}</Typography>    
                </Grid>
            )
        } else {
            return(
                <>
                    {entities.map((e, i) => (
                        <Grid
                            item
                            paddingRight={3}
                            paddingBottom={3}
                            key={i}
                        >
                            <NextLink
                                href={ getLink(e) }
                                passHref
                            >
                                <Link component="a">
                                    <Chip color={showErr ? errFunction(e) ? "default" : "error" : "default"}
                                        icon={icon}
                                        label={getLabel(e)}
                                        clickable />
                                </Link>
                            </NextLink>
                        </Grid>
                    ))}
                </>
            );
        }
    }

    // expanding 
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    return (
        <Card>
            <CardHeader 
                title={title} 
                subheader={subheader} 
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />    
                    </ExpandMore>
                }
            />
            <Collapse in={expanded}>
                <Divider />
                <Box
                    component="form"
                    sx = {{
                        flexGrow: 1,
                        m: 1.5
                    }}
                >
                    <TextField 
                        fullWidth 
                        defaultValue=""
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <EndAdornment
                                    clearInput={clearInput}
                                    inputValue={inputValue}
                                />
                            )
                        }}
                        placeholder={placeholder}
                        onChange={handleChange}
                        value={inputValue}
                    />    
                </Box>
                <Divider />
                <Grid
                    container
                    flexDirection="row"
                    paddingLeft={3}
                    paddingTop={3}
                >
                    {
                        (Array.isArray(entities) && entities.length > 0) ? renderContents(searchFilter(entities, inputValue)) : (
                            <Grid
                                item
                                paddingRight={3}
                                paddingBottom={3}
                            >
                                <SeverityPill color="warning">
                                    <Warning
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                    />
                                    { emptyLabel }
                                </SeverityPill>
                            </Grid>
                        )
                    }
                </Grid>
            </Collapse>
        </Card>
    )
}