import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, CircularProgress } from "@mui/material";
import { isObject, toDisplayDateString } from "../../../../utils/utils";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import BasicDetailsCard from "../../shared/basic-details-card";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import numeral from "numeral";
import PropTypes from "prop-types";
import router from 'next/router';
import {
	Avatar,
	Box,
	Button,
	Checkbox,
	IconButton,
	Link,
	Menu,
	MenuItem,
	MenuList,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from "@mui/material";
import { ArrowRight as ArrowRightIcon } from "../../../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { getInitials } from "../../../../utils/get-initials";
import { Scrollbar } from "../../../scrollbar";
import { Buttons1 } from "../../../widgets/buttons/buttons-1";
import { Buttons2 } from "../../../widgets/buttons/buttons-2";
import { Buttons3 } from "../../../widgets/buttons/buttons-3";
import { Buttonfilter } from "../../../widgets/buttons/buttonfilter";
import WarningIcon from "@mui/icons-material/Warning";
import { useRouter } from "next/router";
import { width } from "@mui/system";

export const VideoRecorderCameras = ({recorder, cameras = []}, recorderid = '') => {
    return(
        <BasicDetailsCard
        	title = "Cameras"
        	subtitle = "Click on camera name below to go to live view">

		<div>
			<Box
				sx={{
					backgroundColor: "neutral.100",
					display: "none",
					px: 2,
					py: 0.5,
				}}
			>
			</Box>
			<Scrollbar>
				<Table sx={{ minWidth: 700 }}>
					<TableHead
					sx={{backgroundColor: "neutral.200",}}
					>
						<TableRow>
							<TableCell>NAME</TableCell>
							<TableCell>IP ADDRESS</TableCell>
							<TableCell>MODEL</TableCell>
							<TableCell>SERIA NO.</TableCell>
							<TableCell>STATUS</TableCell>
							<TableCell>LAST ONLINE</TableCell>
							<TableCell align="left"></TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{cameras.map((camera, index) => {
							return (
								<TableRow
									hover
									key={index}
								>
									<TableCell width="10%">
										<Box
											sx={{
												m: 1,
												alignItems: "center",
												display: "flex",
											}}
										>
											<Box sx={{ ml: 1, width:100}}>
											
													<Link color="inherit" variant="subtitle2">
														<Typography noWrap>
														
														</Typography>
													</Link>
											
												<Typography
													color="textSecondary"
													variant="body2"
													noWrap
												>
													{camera.name}
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell width="20%">
										<Typography width={180} noWrap>
											{camera.ip}
										</Typography>
									</TableCell>
									<TableCell width="20%">-</TableCell>
									<TableCell width="20%">-</TableCell>
									<TableCell width="20%">
										{ camera.online ? (
											<SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill> 
										) : (
											<SeverityPill color="error" style={{color: 'transparent'}}>_.</SeverityPill>
										) }
									</TableCell>
									<TableCell width="10%" align="left">
											
											<IconButton component="a">
												<PencilAltIcon fontSize="small" />
											</IconButton>
									
											<div onClick ={() => {
												if (camera.online)
													router.push({
													     pathname: `/dashboard/video-recorders/preview/3/${index + 1}`,
													  })
												else
													alert("Camera is offline")
											}}>
												<IconButton component="a">
													<ArrowRightIcon fontSize="small" />
												</IconButton>
											</div>
									
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Scrollbar>
		</div>
        </BasicDetailsCard>
    )
}