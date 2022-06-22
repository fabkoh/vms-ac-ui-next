import { Checkbox, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import ControllerRow from "./controller-list-row";

const ControllerListTable = ({ controllers, selectedAllControllers, selectedSomeControllers, handleSelectAllControllers, handleSelectFactory, selectedControllers, page, rowsPerPage, onPageChange, onRowsPerPageChange, controllerCount, controllersStatus }) => {
    
    return (
        <div>
            <Scrollbar>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ backgroundColor: "neutral.200" }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedAllControllers}
                                    indeterminate={selectedSomeControllers}
                                    onChange={handleSelectAllControllers}
                                />
                            </TableCell>
                            <TableCell>Controller Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ip Address</TableCell>
                            <TableCell>Entrance1</TableCell>
                            <TableCell>Entrance2</TableCell>
                            <TableCell>Readers status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            controllers.map(controller => (
                                <ControllerRow 
                                    key={controller?.controllerId}
                                    controller={controller}
                                    selectedControllers={selectedControllers}
                                    handleSelectFactory={handleSelectFactory}
                                />
                            ))
                        }
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={controllerCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
            />
        </div>
    );
};

export default ControllerListTable;