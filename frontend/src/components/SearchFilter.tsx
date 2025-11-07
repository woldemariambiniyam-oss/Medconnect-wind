import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
      onChange: (value: string) => void;
    };
  };
  onClearFilters?: () => void;
  placeholder?: string;
  showClearButton?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters = {},
  onClearFilters,
  placeholder = 'Search...',
  showClearButton = true,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filters[filterKey]) {
      filters[filterKey].onChange(value);
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const hasActiveFilters = searchValue || Object.values(filters).some(filter => filter.value);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Input */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <ClearIcon
                    sx={{ cursor: 'pointer' }}
                    onClick={handleClearSearch}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Filters */}
        {Object.entries(filters).map(([key, filter]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filter.value}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                label={filter.label}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && onClearFilters && (
          <Grid item xs={12} md="auto">
            <Button
              variant="outlined"
              onClick={onClearFilters}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        )}
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {searchValue && (
            <Chip
              label={`Search: "${searchValue}"`}
              onDelete={handleClearSearch}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {Object.entries(filters).map(([key, filter]) => {
            if (filter.value) {
              const option = filter.options.find(opt => opt.value === filter.value);
              return (
                <Chip
                  key={key}
                  label={`${filter.label}: ${option?.label || filter.value}`}
                  onDelete={() => handleFilterChange(key, '')}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              );
            }
            return null;
          })}
        </Box>
      )}
    </Box>
  );
};

export default SearchFilter;
