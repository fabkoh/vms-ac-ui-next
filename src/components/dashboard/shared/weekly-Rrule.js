import {
	Link,
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Grid,
	TextField,
	Switch,
	FormControl,
	FormControlLabel,
	FormGroup,
	Paper,
	Select,
	MenuItem,
	ToggleButton,
	ToggleButtonGroup,
	Divider,
	FormControlUnstyledContext,
} from "@mui/material";
import { set } from "nprogress";
import { useEffect, useState } from "react";
import { RRule, RRuleSet, rrulestr } from "rrule";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/styles";


const WeeklyRrule = (props) => {
	const {
		//only pass RRuleobj, timestart, timeend.
		handleRrule,
		getStart,
		getEnd,
		timeEndInvalid,
		handleInvalidUntil,
	} = props;

	const [rule, setRule] = useState({
		//rule object use to create the string and text description
        freq:RRule.WEEKLY,
		interval,
		byweekday, //[0,1,2,3,4,5,6]


	});
	const [nonChangingRule, setNonChangingRule] = useState({
		dtstart,
		until,
		count,
		timeStart,
		timeEnd,
	})


	// const theme = useTheme();
	// const matches = useMediaQuery(theme.breakpoints.up);
	// console.log("asdasda",theme.breakpoints)

	//handle repeatToggle for conditional rendering
	const repeatToggle = true
    const dtstart = new Date();

	useEffect(() => {
		setRule({freq:2,interval:1});
		setNonChangingRule({dtstart:dtstart,});
	}, [])



	const setrrule = () => {
		try {
			const { timeStart, timeEnd, ...newrule1} = nonChangingRule;
			const newRule2 = { ...rule, ...newrule1 };
			const rule2 = new RRule(newRule2);
			console.log(rule2.toText()); // DELETE THIS
			handleRrule(rule2);
		} catch(e) { console.log(e); };
	}

	

	
	//handle dtstart

	//start of All Day toggle + renderer
	const [allDay, setAllDay] = useState(true);
	const handleAllDay = () => {
		allDay ? setAllDay(false) : setAllDay(true);
	};
	
	const [timeStart, setTimeStart] = useState(""); //timeStart lift up state
	const handleTimeStart = (e) => {
		if(e.target.value==""){
			console.warn("START TIME IS EMPTYYYY")
		}
		console.log("time start value here",e.target.value)
		setTimeStart(e.target.value);
		setNonChangingRule(prevState=>({...prevState,timeStart:e.target.value}))
	};
	const [timeEnd, setTimeEnd] = useState(""); //timeEnd lift up state
	const handleTimeEnd = (e) => {
		if(timeEnd<timeStart){
			// console.warn("invalid time")
			setTimeEnd(timeStart);
			setNonChangingRule(prevState=>({...prevState,timeEnd:timeStart}))
		}
		setTimeEnd(e.target.value);
		setNonChangingRule(prevState=>({...prevState,timeEnd:e.target.value}))

	};
	useEffect(() => {
		//reset timeStart and timeEnd if allDay is false.
		allDay ? (setNonChangingRule(prevState=>({...prevState,timeStart:"00:00",timeEnd:"00:00"}))) : (setNonChangingRule(prevState=>({...prevState,timeStart:"00:00",timeEnd:"24:00"})));
	}, [allDay]);

	// const AllDayRenderer = (allDay) => {
	// 	if (allDay) {
	// 		return (
	// 			// <Grid container alignItems="center" xs={12}>
	// 			<>
	// 			<Grid container xs={4}>
	// 				<Grid item ml={2} mr={1}>
	// 					<Typography mr={2} fontWeight="bold">From</Typography>
	// 				</Grid>
	// 				<Grid item ml={2} mr={2} mt={1}>
	// 					<TextField
	// 						type="time"
	// 						// label="Start Time"
	// 						onChange={handleTimeStart}
	// 						helperText={nonChangingRule.timeStart==""?"Error: invalid start time": " "}
	// 						required={allDay?false:true}
	// 						// onKeyDown={(e)=>e.preventDefault()}
	// 						error={nonChangingRule.timeStart==""?true:false}
	// 						value={nonChangingRule.timeStart}
	// 						></TextField>
	// 					</Grid>
	// 			</Grid>
	// 			<Grid container xs={4}>
	// 				<Grid item ml={2} mr={1}>
	// 					<Typography mr={2} fontWeight="bold">to</Typography>
	// 				</Grid>
	// 				<Grid item ml={2} mr={2} mt={1}>
	// 					<TextField
	// 						type="time"
	// 						// label="End Time"
	// 						onChange={handleTimeEnd}
	// 						error={Boolean(timeEndInvalid)}
	// 						required={allDay?false:true}
	// 						// onKeyDown={(e)=>e.preventDefault()}
	// 						helperText={
	// 							(timeEndInvalid && "Error: end time must be greater than start time")||
	// 							" "
	// 						}
	// 						value={nonChangingRule.timeEnd}
	// 					></TextField>
	// 				</Grid>
	// 			</Grid>
	// 				</>
	// 			// </Grid>
	// 		);
	// 	}
	// };

    useEffect(() => {
		setrrule()
		getStart(nonChangingRule.timeStart)
		getEnd(nonChangingRule.timeEnd)
	}, [rule,nonChangingRule])


	const AllDayRenderer = (allDay) => {
		if (allDay) {
			return (
				<Grid container alignItems="center" >
					<Grid item ml={2} mr={2} >
						<Typography mr={2} fontWeight="bold">From</Typography>
					</Grid>
					<Grid item ml={2} mr={2} mt={1} minWidth={150} >
						<TextField
							type="time"
							onChange={handleTimeStart}
							helperText={nonChangingRule.timeStart==""?"Error: invalid start time": " "}
							required={allDay?false:true}
							// onKeyDown={(e)=>e.preventDefault()}
							error={nonChangingRule.timeStart==""?true:false}
							value={nonChangingRule.timeStart}
							></TextField>
					</Grid>
					<Grid item ml={2} minWidth={50}>
						<Typography mr={2} fontWeight="bold">to</Typography>
					</Grid>
					<Grid item ml={2} mr={2} mt={1} >
						<TextField
							type="time"
							onChange={handleTimeEnd}
							error={Boolean(timeEndInvalid)}
							required={allDay?false:true}
							// onKeyDown={(e)=>e.preventDefault()}
							helperText={
								(timeEndInvalid && "Error: end time must be greater than start time")||
								" "
							}
							value={nonChangingRule.timeEnd}
						></TextField>
					</Grid>
				</Grid>
			);
		}
	};
	//end of All Day toggle + renderer

	//handles interval
	const [interval, setInterval] = useState(1); //interval lift up state
	const handleInterval = (e) => {
		e.target.value <= 1
			? (setRule((prevState) => ({ ...prevState, interval: 1 })),setInterval(1))
			:(setRule((prevState) => ({ ...prevState, interval: e.target.value })),setInterval(e.target.value));
	};

	//start of Freq renderer to handle RRule freq conditional rendering
	const [freq, setFreq] = useState("");
	const handleFreq = (e) => {
		setFreq(e.target.value);
		setRule((prevState) => ({
			...prevState,
			freq:e.target.value,
		}));
	};

	const [byweekday, setByweekday] = useState([]); 
	useEffect(() => {
	}, [rule.handleDtstart])
	
	useEffect(() => { //reininitialize fields based on freq
		if (repeatToggle && rule.freq == RRule.WEEKLY) { //reinitialize for weekly options
			const date = new Date();
			const day = date.getDay();
			const f = day;
			const fnew = f - 1;
			setRule(prevState=>({...prevState, bymonthday:null,bysetpos:null,bymonth:null}))
			f == 0
				? setRule((prevState) => ({
						...prevState,
						byweekday: [6],
				  }))
				: setRule((prevState) => ({
						...prevState,
						byweekday: [fnew],
				  })); // getDay maps sun to 0. rrule maps sun to 6.
				//   setMonthMenuState(null)
		} 

	}, [rule.freq]);

	const handleByweekday = (event, newByweekday) => {
		if(newByweekday.length){
		setByweekday(newByweekday);
		setRule((prevState) => ({
			...prevState,
			byweekday: newByweekday,
		}));
		}
	};
	
	useEffect(() => {
	  if(rule.freq == RRule.YEARLY){
		const dateobj = new Date(nonChangingRule.dtstart);
		const date = dateobj.getDate();
		const month = dateobj.getMonth();
		const newmonth = month + 1;
		setRule(prevState=>({...prevState,bymonth:newmonth , bymonthday:date}))
	  }
	}, [nonChangingRule.dtstart,rule.freq])
	
	
	const weekarray = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
	const handleWeekarray = () => {
		const weekarrayno = nonChangingRule.dtstart.getDay();
		const newweekarrayno = weekarrayno - 1
		newweekarrayno==-1? newweekarrayno=6:false;
		return weekarray[newweekarrayno]
	}

	
	const FreqRender = () => {  //need to initialise ALL rule values except interval and freq.
				return (
					<Grid container alignItems="center" flexwrap="wrap">
						<Grid item justifyContent="flex-start" required>
							<ToggleButtonGroup
								color="info"
								// flexwrap="wrap"
								value={rule.byweekday}
								required
								// onChange={(e)=>console.log(e.target.value)}
								onChange={handleByweekday}
								sx={{ mt: 1 ,flexWrap:"wrap"}}
							>
								<ToggleButton value={0}>M</ToggleButton>
								<ToggleButton value={1}>T</ToggleButton>
								<ToggleButton value={2}>W</ToggleButton>
								<ToggleButton value={3}>T</ToggleButton>
								<ToggleButton value={4}>F</ToggleButton>
								<ToggleButton value={5}>S</ToggleButton>
								<ToggleButton value={6}>S</ToggleButton>
							</ToggleButtonGroup>
						</Grid>
					</Grid>
				);
			};
			
		
	//end of freq renderer

	//start of End options renderer
	const [end, setEnd] = useState("never");
	const handleEndOption = (e) => {
		setEnd(e.target.value);
		if(e.target.value == "after"){
			setUntil("")
			handleInvalidUntil(false)
			setNonChangingRule(prevState=>({...prevState,until:null,count:1}))
		}
		if(e.target.value == "on"){
			setNonChangingRule(prevState=>({...prevState,count:null}))
		}
		if(e.target.value == "never"){
			setUntil("")
			handleInvalidUntil(false)
			setNonChangingRule(prevState=>({...prevState,until:null,count:null}))
		}
	};

	
	//handle until
	const [until, setUntil] = useState("")
	const handleUntil = (e) => {
		const dateobj = new Date(e.target.value)
		if(dateobj<nonChangingRule.dtstart){
			// console.warn("INVALID DATE")
		}
		// console.warn("this runs after")
		setUntil(e.target.value)
		setNonChangingRule(prevState=>({...prevState, until:dateobj}))
	}
	//handle count for number of occurrences
	const [count, setCount] = useState("");
	const handleCount = (e) => {
		e.target.value <= 1
			? (setNonChangingRule((prevState) => ({ ...prevState, count: 1 })))
			: (setNonChangingRule((prevState) => ({ ...prevState, count: e.target.value })),setCount(e.target.value));
	};
	const invalidUntil = () => {
		//if end options != "on" , setdelete block = false. else,     fn should be passed to handle end options
		if(end=="on" && nonChangingRule.until<nonChangingRule.dtstart){
			handleInvalidUntil(true)
			return true
		}
		//set delete block false
		else{
		handleInvalidUntil(false)
		// console.log("this until is valid")
		return false
		}
	}

	//End of end options renderer
	//checkers before submit(lift state to form)
	//if freq=RRule.WEEKLY, byweekday must not be empty
	return (
		<Grid container justifyContent="space-between" sx={{ width: "100%" }}>
				
			<Divider style={{width:'100%'}}/>
			<Grid container>
				{repeatToggle && (
					<Grid container mt={2} mb={2} alignItems="center">
						<Grid item mr={2} mt={1}>
							<Typography fontWeight="bold">Repeats every week on</Typography>
						</Grid>
						<Grid item alignItems="center">
							{FreqRender(rule.freq)}
						</Grid>
					</Grid>
				)}
			</Grid>
			<Divider width={repeatToggle?"100%":"0"}/>

			<Grid container mt={2} ml={-2} alignItems="center">
				<Grid item mr={3}>
					<FormControl>
						<FormGroup>
							<FormControlLabel
								label={<Typography fontWeight="bold">All Day</Typography>}
								labelPlacement="start"
								control={<Switch onChange={handleAllDay}></Switch>}
							/>
						</FormGroup>
					</FormControl>
				</Grid>
				<Grid item>
					{AllDayRenderer(allDay)}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default WeeklyRrule;
