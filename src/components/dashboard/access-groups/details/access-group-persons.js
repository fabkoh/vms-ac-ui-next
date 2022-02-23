import { Card, CardHeader, Chip, Grid, Link, Divider } from "@mui/material";
import NextLink from "next/link";
import Warning from "@mui/icons-material/Warning";
import { SeverityPill } from "../../../severity-pill";

export const AccessGroupPersons = (props) => {
    const { persons } = props.accessGroup;

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
                { Array.isArray(persons) && persons.length > 0 && persons.map((p,i) => (
                    <Grid 
                        item
                        padding={3}
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
                { (Array.isArray(persons) && persons.length > 0) || (
                    <Grid
                        item
                        padding={3}
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