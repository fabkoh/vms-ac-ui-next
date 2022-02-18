import { Card, CardHeader, Chip, Grid, Link } from "@mui/material";
import NextLink from "next/link";
import Warning from "@mui/icons-material/Warning";
import { SeverityPill } from "../../../severity-pill";

export const AccessGroupPersons = (props) => {
    const { person } = props.accessGroup;

    return (
        <Card>
            <CardHeader 
                title="Persons"
                subheader="Click on person name below to go to person details page" 
            />
            <Divider />
            <Grid
                container
                flexDirection="row"
            >
                { person && person.map((p,i) => (
                    <Grid 
                        item
                        paddingBottom={3}
                        paddingLeft={3}
                        key={i}
                    >                   
                         { /* Link and NextLink order reverse to have pointer + underline when hover */ }
                        <Link component="a">       
                            <NextLink
                                href={`/dashboard/persons/details/${p.personId}`}
                                passHref
                            >

                                    <Chip label={p.personFirstName + ' ' + p.personLastName} />

                            </NextLink>
                        </Link>
                    </Grid>
                )) }
                { !person && (
                    <Grid
                        item
                        paddingBottom={3}
                        paddingLeft={3}
                    >
                        <SeverityPill color="warning">
                            <Warning 
                                fontSize="small" 
                                sx={{ mr: 1 }} 
                            />
                            No persons
                        </SeverityPill>
                    </Grid>
                )}
            </Grid>
        </Card>
    )
}