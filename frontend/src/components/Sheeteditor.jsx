import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spreadsheet from 'react-spreadsheet';
import { useParams } from 'react-router-dom';
import { Button, IconButton, Tooltip, CircularProgress, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem as MItem, InputLabel, FormControl } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import TextRotationAngleupIcon from '@mui/icons-material/TextRotationAngleup';
import * as XLSX from 'xlsx'; 
const createGrid = (rows, cols) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({ value: '', style: {} });
    }
    grid.push(row);
  }
  return grid;
};
const Sheeteditor = () => {
    const [data, setData] = useState(createGrid(10,20 ));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [zoomLevel, setZoom] = useState(1);
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortDimension, setSortDimension] = useState('row');
    const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
    const { id: sheetId } = useParams();
    
    useEffect(() => {
        axios.get(`http://localhost:8080/sheets/${sheetId}`)
        .then(response => {
            setData(  response.data.data  || createGrid(20, 15)    );
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching sheet data:', error);
            setError('Failed to load the spreadsheet data.');
            setLoading(false);
        }); 
    }, [sheetId]);
    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
      };
      

    const handleSave = async () => {
        setSaving(true);
        try {
        await axios.put(`http://localhost:8080/sheets/${sheetId}`, { data });
        alert('Sheet saved successfully');
        } catch (error) {
        console.error('Error saving sheet:', error);
        setError('Failed to save the spreadsheet.');
        } finally {
        setSaving(false);
        }
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data.flat().map(cell => ({
        value: cell.value,
        style: cell.style,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'spreadsheet.xlsx');
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        setData(json.map(row => row.map(value => ({ value, style: {} }))));
        };
        reader.readAsArrayBuffer(file);
    };

  const handleFilter = () => {
    const filteredData = data.map(row => row.filter(cell => cell.value.includes(filterValue)));
    setData(filteredData);
    setDialogOpen(false);
  };

    const handleSort = () => {
        let sortedData;
        if (sortDimension === 'col') {
        sortedData = [...data].sort((a, b) => {
            const aVal = a.map(cell => cell.value).join(',');
            const bVal = b.map(cell => cell.value).join(',');
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        } else {
        const transposed = data[0].map((_, colIndex) => data.map(row => row[colIndex]));
        const sortedTransposed = transposed.sort((a, b) => {
            const aVal = a.map(cell => cell.value).join(',');
            const bVal = b.map(cell => cell.value).join(',');
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        sortedData = sortedTransposed[0].map((_, colIndex) => sortedTransposed.map(row => row[colIndex]));
    }
        setData(sortedData);
        handleMenuClose();
    };
    const applyFormatting = () => {
        if (selectedCell.row === null || selectedCell.col === null) return;
      
        const { row, col } = selectedCell;
        const newData = data.map((rowData, rIndex) =>
          rowData.map((cell, cIndex) => ({
            ...cell,
            style: rIndex === row && cIndex === col ? {
              fontWeight: bold ? 'bold' : 'normal',
              fontStyle: italic ? 'italic' : 'normal',
              textDecoration: underline ? 'underline' : 'none',
            } : cell.style,
          }))
        );
        setData(newData);
      };
      
      
  const handleBold = () => {
    setBold(!bold);
    applyFormatting();
  };

  const handleItalic = () => {
    setItalic(!italic);
    applyFormatting();
  };

  const handleUnderline = () => {
    setUnderline(!underline);
    applyFormatting();
  };


  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><CircularProgress /></div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 border-b p-4 flex items-center flex-wrap gap-2">
        <Tooltip title="Undo">
          <IconButton>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton>
            <RedoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Sheet">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print">
          <IconButton>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bold">
          <IconButton onClick={handleBold}>
            <FormatBoldIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton onClick={handleItalic}>
            <FormatItalicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton onClick={handleUnderline}>
            <FormatUnderlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import/Export">
          <IconButton onClick={handleMenuClick}>
            <ImportExportIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton onClick={() => setDialogOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sort">
          <IconButton onClick={handleSort}>
            <SortIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="fill">
          <IconButton >
            <FormatColorFillIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="paste">
          <IconButton >
            <ContentPasteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="cut">
          <IconButton >
            <ContentCutIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip title="border-color">
          <IconButton >
            <BorderColorIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip title="text">
          <IconButton >
            <TextFormatIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip title="text">
          <IconButton >
            <TextRotationAngleupIcon/>
          </IconButton>
        </Tooltip>

        
        <FormControl>
          <InputLabel>Sort Dimension</InputLabel>
          <Select
            value={sortDimension}
            onChange={(e) => setSortDimension(e.target.value)}
          >
            <MItem value="row">Row</MItem>
            <MItem value="column">Column</MItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MItem value="asc">Ascending</MItem>
            <MItem value="desc">Descending</MItem>
          </Select>
        </FormControl>
      </div>
      <div className="flex-1 overflow-auto">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }}
          className="w-full h-full"
        >
          <Spreadsheet
            data={data}
            onChange={setData}
            cellStyle={(row, col) => data[row][col].style}
            onCellClick={handleCellClick}
          />
        </div>
      </div>
      <div className="bg-gray-100 border-t p-4 flex justify-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <input
            accept=".xlsx"
            id="import-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <label htmlFor="import-file">
            Import
          </label>
        </MenuItem>
        <MenuItem onClick={handleExport}>
          Export
        </MenuItem>
      </Menu>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Filter Value"
            type="text"
            fullWidth
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilter}>Apply</Button>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sheeteditor;
