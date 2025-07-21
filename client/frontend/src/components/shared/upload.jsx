

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function InputFileUpload({ onFileSelect }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Profile Picture (Optional)</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <Form.Control 
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <Button 
          variant="outline-primary"
          onClick={() => document.getElementById('file-upload').click()}
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-cloud-upload"></i>
          Upload files
        </Button>
      </div>
    </Form.Group>
  );
}
