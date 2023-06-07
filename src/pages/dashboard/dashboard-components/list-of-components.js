import {
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ComponentNumbers } from './component-numbers';

const ComponentList = (props) => {
    const {
        name,
        link
    } = props;

    const router = useRouter();

    const handleClickController = () => {
        const currentUrl = router.asPath;
        router.push(`${currentUrl}/${link}`);
    };

    return (
            <Card>
                <CardActionArea onClick={handleClickController}>
                    <CardContent>
                    <Typography
                        fontSize={20}
                        color="textSecondary"
                        variant="overline"
                        >
                        {name}
                        <ArrowRightIcon fontSize="small" />
                    </Typography>
                    <Divider />
                        <ComponentNumbers numberType={name} />
                    </CardContent>
                </CardActionArea>
            </Card>
    );
}

export default ComponentList;

{/* <Card {...props}>
<CardContent>
  <Typography
    color="textSecondary"
    variant="overline"
  >
    Total balance
  </Typography>
  <Typography variant="h4">
    {numeral(3787681).format('$0,0.00')}
  </Typography>

  <Divider sx={{ my: 2 }} />
  <Typography
    color="textSecondary"
    variant="overline"
  >
    Available currency
  </Typography>
  <List
    disablePadding
    sx={{ pt: 2 }}
  >
    {currencies.map((currency) => (
      <ListItem
        disableGutters
        key={currency.name}
        sx={{
          pb: 2,
          pt: 0
        }}
      >
        <ListItemText
          disableTypography
          primary={(
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex'
                }}
              >
                <Box
                  sx={{
                    border: 3,
                    borderColor: currency.color,
                    borderRadius: '50%',
                    height: 16,
                    mr: 1,
                    width: 16
                  }}
                />
                <Typography variant="subtitle2">
                  {currency.name}
                </Typography>
              </Box>
              <Typography
                color="textSecondary"
                variant="subtitle2"
              >
                {numeral(currency.amount).format('$0,0.00')}
              </Typography>
            </Box>
          )}
        />
      </ListItem>
    ))}
  </List>
  <Divider />
  <Box
    sx={{
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      pt: 2
    }}
  >
    <Button endIcon={<ArrowRightIcon fontSize="small" />}>
      Add money
    </Button>
    <Button
      endIcon={<ArrowRightIcon fontSize="small" />}
      sx={{ mt: 2 }}
    >
      Withdraw funds
    </Button>
  </Box>
</CardContent>
</Card> */}