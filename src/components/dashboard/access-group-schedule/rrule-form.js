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

//pass in ONLY updatable RRule fields here from addaccgrpsched
const Rrule = (props) => {
	const {
		//only pass rule.totext,rule.tostring, timestart, timeend
		handleRrule,
		getStart,
		getEnd,
	} = props;

	const [rule, setRule] = useState({
		//rule object use to create the string and text description
		freq:RRule.DAILY,
		interval,
		byweekday, //[0,1,2,3,4,5,6]
		bymonthday,
		bysetpos,
		bymonth,
	});
	const [nonChangingRule, setNonChangingRule] = useState({
		dtstart,
		until,
		count,
		timeStart,
		timeEnd,
	})


	
	
	// useEffect(() => {
	//   console.log(JSON.stringify(nonChangingRule))
	// }, [rule,nonChangingRule,allDay])
	

	// useEffect(() => {
	// 	console.log(JSON.stringify(rule));
	// }, [rule]);

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
		const {timeStart,timeEnd,...newrule1} =nonChangingRule
		const newrule2 = {...rule,...newrule1}
		const rule2 = new RRule(newrule2);
		try{console.log(rule2.toText()),handleRrule(rule2)}catch(e){console.log(e)}
		console.log(rule2.toString());
	}

	
	useEffect(() => {
		setrrule()
		getStart(nonChangingRule.timeStart)
		getEnd(nonChangingRule.timeEnd)
	}, [rule,nonChangingRule])
	
	//handle dtstart
	const [dtstart, setDtstart] = useState();
	const handleDtstart = (e) => {
		//textfield date format yyyy-mm-dd but jan = 1 unlike rrule
		const dateobj = new Date(e.target.value)
		setDtstart(e.target.value);
		setNonChangingRule((prevState) => ({ ...prevState, dtstart:dateobj }))
		// if(rule.freq == RRule.YEARLY){
		// 	setDtstart(e.target.value);
		// 	setNonChangingRule((prevState) => ({ ...prevState, dtstart:dateobj }));
		// }
	};
	//start of All Day toggle + renderer
	const [allDay, setAllDay] = useState(true);
	const handleAllDay = () => {
		allDay ? setAllDay(false) : setAllDay(true);
	};
	
	const [timeStart, setTimeStart] = useState(); //timeStart lift up state
	const handleTimeStart = (e) => {
		setTimeStart(e.target.value);
		setNonChangingRule(prevState=>({...prevState,timeStart:e.target.value}))
	};
	const [timeEnd, setTimeEnd] = useState(); //timeEnd lift up state
	const handleTimeEnd = (e) => {
		setTimeEnd(e.target.value);
		setNonChangingRule(prevState=>({...prevState,timeEnd:e.target.value}))

	};
	useEffect(() => {
		//reset timeStart and timeEnd if allDay is false.
		allDay ? (setNonChangingRule(prevState=>({...prevState,timeStart:"00:00",timeEnd:"00:00"}))) : (setNonChangingRule(prevState=>({...prevState,timeStart:"00:00",timeEnd:"23:59"})));
	}, [allDay]);

	const AllDayRenderer = (allDay) => {
		if (allDay) {
			return (
				<Grid container alignItems="center">
					<Grid item ml={3} mr={2} mt={1}>
						<Typography fontWeight="bold">From</Typography>
					</Grid>
					<Grid item ml={2} mr={2} mt={1}>
						<TextField
							type="time"
							onChange={handleTimeStart}
							value={nonChangingRule.timeStart}
						></TextField>
					</Grid>
					<Grid item ml={2} mr={2} mt={1}>
						<Typography fontWeight="bold">to</Typography>
					</Grid>
					<Grid item ml={2} mr={2} mt={1}>
						<TextField
							type="time"
							onChange={handleTimeEnd}
							value={nonChangingRule.timeEnd}
						></TextField>
					</Grid>
				</Grid>
			);
		}
	};
	//end of All Day toggle + renderer

	//handles interval
	const [interval, setInterval] = useState(); //interval lift up state
	const handleInterval = (e) => {
		e.target.value < 1
			? setRule((prevState) => ({ ...prevState, interval: 1 }))
			: setRule((prevState) => ({ ...prevState, interval: e.target.value }));
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
			setMonthOptionsMenu()
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
			setRule((prevState) => ({
				...prevState,
				byweekday: null,bymonth:null,bymonthday:null
		  }));
		}
		if (repeatToggle && rule.freq == RRule.DAILY) {//reinitialize for daily options
			setMonthOptionsMenu()
			setRule((prevState) => ({
				...prevState,
				byweekday: null,bymonthday:null,bysetpos:null,bymonth:null
		  }));
		//   setMonthMenuState(null)
		}
		if (repeatToggle && rule.freq == RRule.YEARLY) {//reinitialize for yearly options
			setMonthOptionsMenu()
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
		setByweekday(newByweekday);
		setRule((prevState) => ({
			...prevState,
			byweekday: newByweekday,
		}));
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
	// const date = new Date();
	// const DD = date.getDate();
	// const tempday = date.getDay();
	// tempday == 0? tempday=6:false;
	// const weekno = Math.floor(DD/7)
	const weekarray = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
	const handleWeekarray = () => {
		const weekarrayno = nonChangingRule.dtstart.getDay();
		const newweekarrayno = weekarrayno - 1
		newweekarrayno==-1? newweekarrayno=6:false;
		return weekarray[newweekarrayno]
	}
	// const weektoday = weekarray[tempday-1] //needs rework
	const WeeknoHandler = () => {
		const date = nonChangingRule.dtstart.getDate();
		const weekno = Math.floor(date/7);
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
		try{const date = nonChangingRule.dtstart.getDate();
		const weekno = Math.floor(date/7);}catch(err){console.log(err)}
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
		try{const date = nonChangingRule.dtstart.getDate()}catch(err){console.log(err)}	
		if(monthOptionsMenu=="1"){
			setRule(prevState=>({...prevState,byweekday:[],bysetpos:[]}))
			setRule(prevState=>({...prevState,bymonthday:date}))	
		}
	}
	const monthMenuSetter2 = () => {
		try{
			const tempday = nonChangingRule.dtstart.getDay();
			const newtempday = tempday-1;
			newtempday ==-1? newtempday=6:false
		}catch(err){console.log(err)}	
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
		const tempmonth = rule.bymonth - 1
		tempmonth ==-1? tempmonth=1:false
		return montharray[tempmonth]
	}
	const FreqRender = (e) => {  //need to initialise ALL rule values except interval and freq.
		if (repeatToggle) {
			if (e == RRule.WEEKLY) {
				return (
					<Grid container alignItems="center" flexwrap="wrap">
						<Grid item>
							<Typography container ml={3} mr={3} mt={1} fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						<Grid item justifyContent="flex-start">
							<ToggleButtonGroup
								color="info"
								flexwrap="wrap"
								value={rule.byweekday}
								required
								onChange={handleByweekday}
								sx={{ mt: 1 }}
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
			}
			if (e == RRule.MONTHLY) {
				return (
					<Grid container alignItems="center" flexwrap="wrap">
						<Grid item>
							<Typography container ml={3} mr={3} mt={1} fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						<Grid item mt={1}>
							<Select
							value={monthOptionsMenu}
							onChange={handleMonthOptionsMenu}
							// value={monthOptions}
							// onChange={handleMonthOptions}
							>
								<MenuItem value="1">
									 {nonChangingRule.dtstart?`day ${nonChangingRule.dtstart.getDate()} of the month` :"select start date"}
									{/* {monthMenuRenderer1(monthOptionsMenu)} */}
									 </MenuItem>
								<MenuItem value="2">
									{nonChangingRule.dtstart?
									(`the ${WeeknoHandler()} ${handleWeekarray()} of every month`):
										("select start date")
								}
								</MenuItem>
							</Select>
						</Grid>
					</Grid>
				);
			}
			if (e == RRule.YEARLY) {
				// const month = nonChangingRule.dtstart.getMonth();
				// const day = nonChangingRule.dtstart.getDay();
				// const newmonth = month + 1;
				// setRule(prevState=>({...prevState,bymonth:newmonth,bymonthday:day}))
				return (
					<Grid container alignItems="center" flexWrap="wrap">
						<Grid item>
							<Typography container ml={3} mr={3} mt={1} fontWeight="bold">
								{" "}
								on
							</Typography>
						</Grid>
						<Grid item mt={1}>
							<MenuItem >
							{nonChangingRule.dtstart?` ${rule.bymonthday} ${monthconverter()}` :"select start date"}
							</MenuItem>
						</Grid>
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
			setNonChangingRule(prevState=>({...prevState,until:null}))
		}
		if(e.target.value == "on"){
			setNonChangingRule(prevState=>({...prevState,count:null}))
		}
		if(e.target.value == "never"){
			setNonChangingRule(prevState=>({...prevState,until:null,count:null}))
		}
	};
	//handle until
	const [until, setUntil] = useState()
	const handleUntil = (e) => {
		const dateobj = new Date(e.target.value)
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
	
	const endRenderer = (e) => {
		if (e == "after") {
			return (
				<Grid container alignItems="center">
					<TextField
						sx={{ ml: 2, mr: 2, maxWidth: 150, maxWidth: 150 }}
						type="number"
						value={count}
						onChange={handleCount}
					></TextField>
					<Typography fontWeight="bold" sx={{ ml: 3, mr: 3 }}>
						occurences
					</Typography>
				</Grid>
			);
		}
		if (e == "on") {
			return (
				<Grid container alignItems="center" value={until} onChange={handleUntil}>
					<TextField sx={{ ml: 2 }} type="date"></TextField>
				</Grid>
			);
		}
		if (e == "never") {
			//set count and until to null.done
		}
	};
	//End of end options renderer
	//checkers before submit(lift state to form)
	//if freq=RRule.WEEKLY, byweekday must not be empty
	return (
		<Grid container justifyContent="space-between" sx={{ width: "100%" }}>
			<Grid
				container
				// md={6}
				mb={2}
				alignItems="center"
				justifyContent="flex-start"
				sx={{ width: "100%" }}
			>
				<Typography fontWeight="bold" mr={2}>
					Date of first occurrence :{" "}
				</Typography>
				<TextField
					type="date"
					value={dtstart}
					onChange={handleDtstart}
					required
					sx={{ minWidth: 200, mr: 10 }}
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
			<Divider />
			<Grid container>
				{repeatToggle && (
					<Grid container mt={2} mb={2} alignItems="center">
						<Grid item mr={2} mt={1}>
							<Typography fontWeight="bold">Repeats every{"  "}</Typography>
						</Grid>
						<Grid item mt={1}>
							<TextField
								type="number"
								sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
								onChange={handleInterval}
								value={rule.interval}
							/>
						</Grid>
						<Grid item mt={1}>
							<Select
								required
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
						<Grid item alignItems="center">
							{FreqRender(rule.freq)}
						</Grid>
					</Grid>
				)}
			</Grid>
			<Divider />
			<Grid item>
				{repeatToggle && (
					<Grid container alignItems="center" sx={{ mt: 2, mb: 2 }}>
						<Grid item>
							<Typography item fontWeight="bold" sx={{ mr: 2 }}>
								{" "}
								Ends
							</Typography>
						</Grid>
						<Grid item mt={1}>
							<Select
								value={end}
								onChange={(e) => {
									handleEndOption(e);
								}}
							>
								<MenuItem value="on">on</MenuItem>
								<MenuItem value="after">after</MenuItem>
								<MenuItem value="never">never</MenuItem>
							</Select>
						</Grid>
						<Grid item>{endRenderer(end)}</Grid>
					</Grid>
				)}
			</Grid>
			<Divider />
			<Grid container mt={2} ml={-2} alignItems="center">
				<Grid item>
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
				<Grid item>{AllDayRenderer(allDay)}</Grid>
			</Grid>
		</Grid>
	);
};

export default Rrule;
