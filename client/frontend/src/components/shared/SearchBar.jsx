import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.common.white, 0.95),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 1),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  '&:focus-within': {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  margin: '0 auto',
  width: '100%',
  maxWidth: 450,
  transition: 'all 0.3s ease-in-out',
  display: 'flex',
  alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  position: 'absolute',
  height: '100%',
  top: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  paddingRight: theme.spacing(0.5),
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  padding: theme.spacing(0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    color: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '&:active': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    transform: 'scale(0.95)',
  },
  transition: 'all 0.2s ease-in-out',
  '& .MuiSvgIcon-root': {
    fontSize: '1.4rem',
    fontWeight: 'bold',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: '100%',
  paddingLeft: theme.spacing(2),
  paddingRight: `calc(1em + ${theme.spacing(5)})`,
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  transition: theme.transitions.create('width'),
  '& .MuiInputBase-input': {
    padding: 0,
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: alpha(theme.palette.text.secondary, 0.7),
      opacity: 1,
      fontWeight: 400,
    },
  },
}));



export default function SearchBar({ value, onChange, onSearch, placeholder = "Search for jobs, companies, or keywords..." }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      console.log('SearchBar: Enter key pressed, calling onSearch with:', value);
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      console.log('SearchBar: Search button clicked, calling onSearch with:', value);
      onSearch(value);
    }
  };

  return (
    <Search>
      <StyledInputBase
        placeholder={placeholder}
        inputProps={{ 'aria-label': 'search' }}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <SearchIconWrapper>
        <SearchButton
          onClick={handleSearchClick}
          aria-label="search"
          size="small"
        >
          <SearchIcon />
        </SearchButton>
      </SearchIconWrapper>
    </Search>
  );
}
