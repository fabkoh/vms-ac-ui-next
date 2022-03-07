import Warning from "@mui/icons-material/Warning";
import { Card, CardHeader, Grid, Link, Divider, Chip, TextField, Box, InputAdornment, Typography, Collapse } from "@mui/material";
import NextLink from "next/link";
import { SeverityPill } from "../../severity-pill";
import { useState } from "react";
import { Search } from "../../../icons/search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "./expand-more";

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
    icon = false
}) {

    const [inputValue, setInputValue] = useState('');
    const handleChange = (e) => setInputValue(e.target.value);

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
                            <Link component="a">
                                <NextLink
                                    href={ getLink(e) }
                                    passHref
                                >
                                    <Chip icon={icon} label={getLabel(e)} />
                                </NextLink>
                            </Link>
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
                            )
                        }}
                        placeholder={placeholder}
                        onChange={handleChange}
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