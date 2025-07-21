


export const formatSalary = (salary) => {
  if (!salary) return 'Salary not specified';
  return typeof salary === 'number' ? `₹${salary.toLocaleString()}` : salary;
};


export const formatDate = (date) => {
  if (!date) return 'Date not available';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};


export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
};
