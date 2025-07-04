import React, { useState, useEffect } from 'react';
import {
    TextField,
    Chip,
    Box,
    IconButton,
    Paper,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

/**
 * ModelEntry Component for managing AI model vendors and their associated models.
 * This component is designed to be controlled by a parent component, passing its
 * data up via the `onEntriesChange` prop.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.entries - The array of model vendor entries.
 * Each entry object should have an `id`, `vendor` (string), and `models` (array of strings).
 * @param {Function} props.onEntriesChange - Callback function to update the parent's state
 * when the entries array changes. It receives the new array of entries as an argument.
 */
function ModelEntry({ entries, onEntriesChange }) {
    // currentModelInput holds the temporary text input for adding new chips for each entry.
    // It's an object where keys are entry IDs and values are the current input string.
    const [currentModelInput, setCurrentModelInput] = useState({});

    // Add this useEffect to ensure at least one entry exists
    useEffect(() => {
        if (entries.length === 0) {
            onEntriesChange([{ id: Date.now(), vendor: '', values: [] }]);
        }
        // Only run on mount or when entries changes
    }, [entries, onEntriesChange]);

    // handleVendorChange: Updates the vendor name for a specific entry.
    const handleVendorChange = (id, event) => {
        const newEntries = entries.map((entry) => {
            return entry.id === id ? { ...entry, vendor: event.target.value } : entry;
        });
        onEntriesChange(newEntries);
    };

    // handleModelInputChange: Updates the temporary input string for adding a model chip
    // for a specific entry.
    const handleModelInputChange = (id, event) => {
        setCurrentModelInput((prevInput) => ({
            ...prevInput,
            [id]: event.target.value,
        }));
    };

    // handleAddModelChip: Adds a new model chip to the values array of a specific entry
    // when the Enter key is pressed. It checks if the model already exists to avoid duplicates
    const handleAddModelChip = (id, event) => {
        if (event.key === 'Enter' && currentModelInput[id] && currentModelInput[id].trim() !== '') {
            const newModel = currentModelInput[id].trim();

            const newEntries = entries.map((entry) => {
                if (entry.id === id) {
                    // Check if the new model already exists in the values array
                    if (!entry.values.includes(newModel)) {
                        return { ...entry, values: [...entry.values, newModel] };
                    }
                    return entry;
                }
                return entry;
            });

            onEntriesChange(newEntries);
            setCurrentModelInput((prevInput) => ({ ...prevInput, [id]: '' }));
        }
    };

    // handleDeleteModelChip: Removes a specific model chip from an entry.
    const handleDeleteModelChip = (entryId, modelToDelete) => {
        const newEntries = entries.map((entry) => {
            return entry.id === entryId
                ? { ...entry, values: entry.values.filter((model) => model !== modelToDelete) }
                : entry;
        });
        onEntriesChange(newEntries);
    };

    // handleAddEntry: Adds a new, empty model vendor entry.
    const handleAddEntry = () => {
        const newEntry = { id: Date.now(), vendor: '', values: [] }; // Use Date.now() for unique ID
        onEntriesChange([...entries, newEntry]);
    };

    // handleRemoveEntry: Removes a specific model vendor entry.
    const handleRemoveEntry = (idToRemove) => {
        const newEntries = entries.filter((entry) => entry.id !== idToRemove);
        onEntriesChange(newEntries);
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Render existing entries */}
            {entries.map((entry) => (
                <Paper
                    key={entry.id}
                    elevation={1}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'left',
                        gap: 2,
                        borderRadius: '8px',
                    }}
                >
                    <TextField
                        label='Model Vendor'
                        variant='outlined'
                        value={entry.vendor}
                        onChange={(e) => handleVendorChange(entry.id, e)}
                        sx={{ flexShrink: 0 }}
                    />

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            p: 1,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minHeight: '56px',
                            alignItems: 'center',
                        }}
                    >
                        {entry.values.map((model) => (
                            <Chip
                                key={`${entry.id}-${model}`}
                                label={model}
                                onDelete={() => handleDeleteModelChip(entry.id, model)}
                                sx={{ mr: 0.5, mb: 0.5 }}
                            />
                        ))}
                        <TextField
                            variant='standard'
                            placeholder='Type models and press Enter'
                            value={currentModelInput[entry.id] || ''}
                            onChange={(e) => handleModelInputChange(entry.id, e)}
                            onKeyDown={(e) => handleAddModelChip(entry.id, e)}
                            InputProps={{
                                disableUnderline: true,
                            }}
                            sx={{
                                flexGrow: 1,
                                minWidth: '150px',
                            }}
                        />
                    </Box>

                    <IconButton onClick={handleAddEntry} color='primary'>
                        <AddCircleOutlineIcon />
                    </IconButton>
                    {/* Only show remove button if there's more than one entry */}
                    {entries.length > 1 && (
                        <IconButton onClick={() => handleRemoveEntry(entry.id)} color='error'>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Paper>
            ))}
        </Box>
    );
}

export default ModelEntry;
