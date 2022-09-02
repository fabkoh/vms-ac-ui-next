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


const Rrule = (props) => {
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
		freq:RRule.DAILY,
		interval: null,
		byweekday: null, //[0,1,2,3,4,5,6]
		bymonthday: null,
		bysetpos: null,
		bymonth: null,
	});
	const [nonChangingRule, setNonChangingRule] = useState({
		dtstart: null,
		until: null,
		count: null,
		timeStart: null,
		timeEnd: null,
	})
	// const theme = useTheme();
	// const matches = useMediaQuery(theme.breakpoints.up);
	// console.log("asdasda",theme.breakpoints)

	//handle repeatToggle for conditional rendering
	const [repeatToggle, setRepeatToggle] = useState(false);
	const handleRepeatToggle = () => {
		repeatToggle
			? (setRepeatToggle(false), setRule({ freq: 3, interval: 1 }),setNonChangingRule(prevState=>({...prevState,until:null, count:1})))
			: (setRepeatToggle(true),
			  setRule({freq:2,interval:1}),setNonChangingRule(prevState=>({...prevState,until:null, count:null})));
	};

	useEffect(() => {
		setRule({freq:3,interval:1});
		setNonChangingRule({count:1,});
	}, [])



	const setrrule = () => {
		try {
			const { timeStart, timeEnd, ...newrule1} = nonChangingRule;
			const newRule2 = { ...rule, ...newrule1 };
			const rule2 = new RRule(newRule2);
			handleRrule(rule2);
		} catch(e) { console.log(e); };
	}

	
	useEffect(() => {
		setrrule()
		getStart(nonChangingRule.timeStart)
		getEnd(nonChangingRule.timeEnd)
	}, [rule,nonChangingRule])
	
	//handle dtstart
	const [dtstart, setDtstart] = useState(new Date());
	const handleDtstart = (e) => {
		//textfield date format yyyy-mm-dd but jan = 1 unlike rrule
		const dateobj = new Date(e.target.value)
		setDtstart(e.target.value);
		// console.log("date",e.target.value)
		// console.log("datetype",typeof(e.target.value))
		setNonChangingRule((prevState) => ({ ...prevState, dtstart:dateobj }))
	};
	//start of All Day toggle + renderer
	const [allDay, setAllDay] = useState(true);
	const handleAllDay = () => {
		allDay ? setAllDay(false) : setAllDay(true);
	};
	
	const [timeStart, setTimeStart] = useState(); //timeStart lift up state
	const handleTimeStart = (e) => {
		if(e.target.value==""){
			console.warn("START TIME IS EMPTYYYY")
		}
		console.log("time start value here",e.target.value)
		setTimeStart(e.target.value);
		setNonChangingRule(prevState=>({...prevState,timeStart:e.target.value}))
	};
	const [timeEnd, setTimeEnd] = useState(); //timeEnd lift up state
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
	const AllDayRenderer = (allDay) => {
		if (allDay) {
			return (
				<Grid container
					alignItems="center"
					xs={12}>
					<Grid item
						ml={2}
						mr={2} >
						<Typography mr={2}
							fontWeight="bold">From</Typography>
					</Grid>
					<Grid item
						ml={2}
						mr={2}
						mt={1}
						minWidth={150} >
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
					<Grid item
						ml={2}
						minWidth={50}>
						<Typography mr={2}
						fontWeight="bold">to</Typography>
					</Grid>
					<Grid item
						ml={2}
						mr={2}
						mt={1} >
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

	const today = new Date().toISOString().split("T")[0];
	//end of All Day toggle + renderer

	//handles interval
	const [interval, setInterval] = useState(1); //interval lift up state
	const handleInterval = (e) => {
		e.target.value <= 1
			? (setRule((prevState) => ({ ...prevState, interval: 1 })),setInterval(1))
			:(setRule((prevState) => ({ ...prevState, interval: e.target.value })),setInterval(e.target.value));
	};

	//start of Freq renderer to handle RRule freq conditional rendering
	const [freq, setFreq] = useState();
	const handleFreq = (e) => {
		setFreq(e.target.value);
		setRule((prevState) => ({
			...prevState,
			freq:e.target.value,
		}));
	};

	const [byweekday, setByweekday] = useState([]); 
	useEffect(() => {
	  handleYearly()
	}, [rule.handleDtstart])
	
	useEffect(() => { //reininitialize fields based on freq
		if (repeatToggle && rule.freq == RRule.WEEKLY) { //reinitialize for weekly options
			setMonthOptionsMenu(null)
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
		if (repeatToggle && rule.freq == RRule.MONTHLY) {//reinitialize for monthly options
			setMonthOptionsMenu("1")
			monthMenuSetter1()
			setRule((prevState) => ({
				...prevState,
				byweekday: null,bymonth:null,bymonthday:null
		  }));
		}
		if (repeatToggle && rule.freq == RRule.DAILY) {//reinitialize for daily options
			setMonthOptionsMenu(null)
			setRule((prevState) => ({
				...prevState,
				byweekday: null,bymonthday:null,bysetpos:null,bymonth:null
		  }));
		//   setMonthMenuState(null)
		}
		if (repeatToggle && rule.freq == RRule.YEARLY) {//reinitialize for yearly options
			setMonthOptionsMenu(null)
			setRule((prevState) => ({
				...prevState,
				byweekday: null,bysetpos:null,
		  }));
		  handleYearly();
		//   setMonthMenuState(null)
		}
	}, [rule.freq]);
	const handleYearly = () => {
		const dateobj = new Date(nonChangingRule.dtstart);
		const date = dateobj.getDate();
		const month = dateobj.getMonth();
		const newmonth = month + 1;
		if(rule.freq == RRule.YEARLY){
		setRule(prevState=>({...prevState,bymonth:newmonth , bymonthday:date}))}
	}

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
	

	const [bymonthday, setBymonthday] = useState()
	const [bymonth, setBymonth] = useState()
	const [bysetpos, setBysetpos] = useState()
	
	const weekarray = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
	const handleWeekarray = () => {
		let weekarrayno = nonChangingRule.dtstart.getDay();
		let newweekarrayno = weekarrayno - 1
		newweekarrayno==-1? newweekarrayno=6:false;
		return weekarray[newweekarrayno]
	}
	// const weektoday = weekarray[tempday-1] //needs rework
	const WeeknoHandler = () => {
		const date = nonChangingRule.dtstart.getDate();
		let weekno = Math.floor(date/7);
		if(weekno == 0 || date == 7){
			return weekno="1st"
		}
		if(weekno == 1 || date == 14){
			return weekno="2nd"
		}
		if(weekno == 2 || date == 21){
			return weekno="3rd"
		}
		if(weekno == 3 || date == 28){
			return weekno="4th"
		}
		return weekno="5th"
		
	}
	const WeeknoHandlerValue = () => {
		let date;
		let weekno;
		try {
			date = nonChangingRule.dtstart.getDate();
			weekno = Math.floor(date / 7);
		}
		catch (err) {
			console.log(err);
			return;
		}
		if(weekno == 0 || date == 7){
			return weekno=1
		}
		if(weekno == 1 || date == 14){
			return weekno=2
		}
		if(weekno == 2 || date == 21){
			return weekno=3
		}
		if(weekno == 3 || date == 28){
			return weekno=4
		}
		return weekno=5
		
	}

	const [monthOptionsMenu, setMonthOptionsMenu] = useState()
	const handleMonthOptionsMenu = (e) => {
		setMonthOptionsMenu(e.target.value)
	}
	const monthMenuSetter1 = () => {
		let date;
		try {
			date = nonChangingRule.dtstart?.getDate()
		} catch (err) {
			console.log(err);
			return;
		}	
		if(monthOptionsMenu=="1"){
			setRule(prevState=>({...prevState,byweekday:[],bysetpos:[]}))
			setRule(prevState=>({...prevState,bymonthday:date}))	
		}
	}
	const monthMenuSetter2 = () => {
		let newtempday;
		let tempday;
		try {
			tempday = nonChangingRule.dtstart?.getDay();
			newtempday = tempday-1;
			newtempday ==-1? newtempday=6:false
		} catch (err) {
			console.log(err);
			return;
		}	
		if(monthOptionsMenu=="2"){
			setRule(prevState=>({...prevState,bymonthday:[]}))
			setRule(prevState=>({...prevState,byweekday:[newtempday],bysetpos:[WeeknoHandlerValue()]}))	
		}
	}
	useEffect(() => {
		monthMenuSetter1()
		monthMenuSetter2()
	}, [monthOptionsMenu,nonChangingRule.dtstart])
	
	const montharray =["January","Feburary","March","April","May","June","July","August","September","October","November","December"]
	const monthconverter = () => {
		let tempmonth = rule.bymonth - 1
		tempmonth ==-1? tempmonth=1:false
		return montharray[tempmonth]
	}
	const FreqRender = (e) => {  //need to initialise ALL rule values except interval and freq.
		if (repeatToggle) {
			if (e == RRule.WEEKLY) {
				return (
					<Grid container
						alignItems="center"
						flexwrap="wrap">
						<Grid item>
							<Typography container
								ml={3}
								mr={3}
								mt={1}
								fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						<Grid item
							justifyContent="flex-start"
							required>
							<ToggleButtonGroup
								color="info"
								// flexwrap="wrap"
								value={rule.byweekday}
								required
								// onChange={(e)=>console.log(e.target.value)}
								onChange={handleByweekday}
								sx={{ mt: 1 ,flexWrap:"wrap"}}
							>
								<ToggleButton value={0}>Mon</ToggleButton>
								<ToggleButton value={1}>Tue</ToggleButton>
								<ToggleButton value={2}>Wed</ToggleButton>
								<ToggleButton value={3}>Thu</ToggleButton>
								<ToggleButton value={4}>Fri</ToggleButton>
								<ToggleButton value={5}>Sat</ToggleButton>
								<ToggleButton value={6}>Sun</ToggleButton>
							</ToggleButtonGroup>
						</Grid>
					</Grid>
				);
			}
			if (e == RRule.MONTHLY) {
				return (
					<Grid container
						alignItems="center"
						flexwrap="wrap">
						<Grid item>
							<Typography container
								ml={3}
								mr={3}
								mt={1}
								fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						{nonChangingRule.dtstart ?
							<Grid item
								mt={1}>
								<Select
									value={monthOptionsMenu}
									onChange={handleMonthOptionsMenu}
									defaultValue={rule.freq == RRule.WEEKLY ? "1" : null}
								// value={monthOptions}
								// onChange={handleMonthOptions}
								>
									<MenuItem value="1">
										{`Day ${nonChangingRule.dtstart.getDate()} of the month`}
									</MenuItem>
									<MenuItem value="2">
										{`The ${WeeknoHandler()} ${handleWeekarray()}`}
									</MenuItem>
								</Select>
							</Grid>
							: <Grid item
								mt={1}>
								<MenuItem >
									Select start date
								</MenuItem>
							</Grid>
						}
					</Grid>
				);
			}
			if (e == RRule.YEARLY) {
				// const month = nonChangingRule.dtstart.getMonth();
				// const day = nonChangingRule.dtstart.getDay();
				// const newmonth = month + 1;
				// setRule(prevState=>({...prevState,bymonth:newmonth,bymonthday:day}))
				return (
					<Grid container
						alignItems="center"
						flexWrap="wrap">
						<Grid item>
							<Typography container
								ml={3}
								mr={3}
								mt={1}
								fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						{nonChangingRule.dtstart ?
							<Grid item
								mt={1}>
								<MenuItem >
									{`${rule.bymonthday} ${monthconverter()}`}
								</MenuItem>
							</Grid>
							: <Grid item
								mt={1}>
								<MenuItem >
									Select start date
								</MenuItem>
							</Grid>
						}
					</Grid>
				);
			}
		}
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
	const [until, setUntil] = useState()
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
	const [count, setCount] = useState(1);
	const handleCount = (e) => {
		e.target.value <= 1
			? (setNonChangingRule((prevState) => ({ ...prevState, count: 1 })),setCount(1))
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
	useEffect(() => {
		invalidUntil()
		endRenderer(end)
	}, [monthOptionsMenu])
	
	const endRenderer = (e) => {
		if (e == "after") {
			return (
				<Grid container
					alignItems="center"
					mt={2}>
					<TextField
						sx={{ ml: 2, mr: 2, maxWidth: 150 }}
						type="number"
						helperText={" "}
						value={nonChangingRule.count}
						onChange={handleCount}
					></TextField>
					<Typography fontWeight="bold"
						sx={{ ml: 3, mr: 3, mb: 3 }}>
						occurences
					</Typography>
				</Grid>
			);
		}
		if (e == "on") {
			const startDate = new Date(dtstart).toISOString().split("T")[0];
			return (
				<Grid container
					alignItems="center"
					mt={2}>
					<TextField sx={{ ml: 2 }}
						required={end=="on"}
						type="date"
						value={until}
						onChange={handleUntil}
						defaultValue={startDate}
						inputProps={{
							min: startDate
						}}						
						error={invalidUntil()}
						helperText={invalidUntil()?"Error: end date must be greater than start date":" "}></TextField>
				</Grid> 								
			);
		}
		if (e == "never") {      //renders nothing but empty container is used for consistent sizing
			return(
				<Grid container
					mt={2}
					minHeight={79}>  
					<Grid item>
						<Typography>{" "}</Typography>
					</Grid>
				</Grid>
			)
			//set count and until to null.done
		}
	};
	//End of end options renderer
	//checkers before submit(lift state to form)
	//if freq=RRule.WEEKLY, byweekday must not be empty
	return (
		<Grid container
			justifyContent="space-between"
			sx={{ width: "100%" }}>
			<Grid
				container
				// md={6}
				mb={2}
				alignItems="center"
				justifyContent="flex-start"
				sx={{ width: "100%" }}
			>
				<Typography fontWeight="bold"
					mr={2}>
					Date of first occurrence :{" "}
				</Typography>
				<TextField
					type="date"
					value={dtstart}
					onChange={handleDtstart}
					onKeyDown={(e) => e.preventDefault()}
					defaultValue={today}
					inputProps={{
						min: today
					}}
					// onKeyPress={(e)=>e.preventDefault()}
					required
					sx={{ minWidth: 200, mr: 10 }}
					error={dtstart?false:true}
					helperText={dtstart?true :"Error: no start date"}
				/>
				<FormControl>
					<FormGroup>
						<FormControlLabel
							label={<Typography fontWeight="bold"> Repeat </Typography>}
							labelPlacement="start"
							control={<Switch onChange={handleRepeatToggle} />}
						/>
					</FormGroup>
				</FormControl>
			</Grid>
			<Divider style={{width:'100%'}}/>
			<Grid container>
				{repeatToggle && (
					<Grid container
						mt={2}
						mb={2}
						alignItems="center">
						<Grid item
							mr={2}
							mt={1}>
							<Typography fontWeight="bold">Repeats every{"  "}</Typography>
						</Grid>
						<Grid item
							mt={1}>
							<TextField
								type="number"
								sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
								onChange={handleInterval}
								value={rule.interval}
							/>
						</Grid>
						<Grid item
							mt={1}>
							<Select
								// required={repeatToggle?true:false}
								value={rule.freq}
								onChange={(e) => {
									handleFreq(e);
								}}
							>
								<MenuItem value={3}>Day</MenuItem>
								<MenuItem value={2}>Week</MenuItem>
								<MenuItem value={1}>Month</MenuItem>
								<MenuItem value={0}>Year</MenuItem>
							</Select>
						</Grid>
						<Grid item
							alignItems="center">
							{FreqRender(rule.freq)}
						</Grid>
					</Grid>
				)}
			</Grid>
			<Divider width={repeatToggle?"100%":"0"}/>
			<Grid item>
				{repeatToggle && (
					<Grid container
						alignItems="center"
						mb={2}>
						<Grid item>
							<Typography item
								fontWeight="bold"
								mr={2}>
								{" "}
								Ends
							</Typography>
						</Grid>
						<Grid item
							mt={1}>
							<Select
								value={end}
								onChange={(e) => {
									handleEndOption(e);
								}}
							>
								<MenuItem value="on">on this date</MenuItem>
								<MenuItem value="after">after a number of occurences</MenuItem>
								<MenuItem value="never">never</MenuItem>
							</Select>
						</Grid>
						<Grid item
						mt={2}>{endRenderer(end)}</Grid>
					</Grid>
				)}
			</Grid>
			<Divider width={repeatToggle?"100%":"0"} />
			<Grid container
				mt={2}
				ml={-2}
				alignItems="center"
				xs={12}>
				<Grid item
					mr={3}>
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

export default Rrule;
