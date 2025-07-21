import React from 'react';

const BootstrapSearchBar = ({ value = '', onChange, onSearch, placeholder = "Search for jobs, companies, or keywords..." }) => {
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

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="input-group shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
            <input
              type="text"
              className="form-control border-0"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{
                padding: '1rem 1.25rem',
                fontSize: '1rem',
                borderRadius: '12px 0 0 12px',
                border: '2px solid #e2e8f0',
                borderRight: 'none',
                backgroundColor: '#fff',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSearchClick}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '0 12px 12px 0',
                border: '2px solid #2563eb',
                borderLeft: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="bi bi-search" style={{fontSize: '1.1rem'}}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootstrapSearchBar;
