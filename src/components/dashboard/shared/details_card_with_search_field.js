import Warning from "@mui/icons-material/Warning";
import { Card, CardHeader, Grid, Link, Divider, Chip } from "@mui/material";
import NextLink from "next/link";
import { SeverityPill } from "../../severity-pill";

/*
compulsory fields
    renderChip : function (entity) => JSX
    entities : list of entities
    getLabel : function (entity) => string

optional fields
    title : string
    subheader : string
    emptyLabel : string
*/

export default function DetailsCardWithSearchField({
    title ="",
    subheader = "",
    entities,
    getLabel,
    getLink,
    emptyLabel = ""
}) {
    // const [inputValue, setInputValue] = useState('');

    return (
        <Card>
            <CardHeader title={title} subheader={subheader} />
            <Divider />
            <Grid
                container
                flexDirection="row"
                paddingLeft={3}
                paddingTop={3}
            >
                {
                    (Array.isArray(entities) && entities.length > 0) ? entities.map((e, i) => (
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
                                    <Chip label={getLabel(e)} />
                                </NextLink>
                            </Link>
                        </Grid>
                    )) : (
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
        </Card>
    )
}