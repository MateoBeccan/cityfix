const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Pendiente': { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: '⏳' 
      },
      'En Proceso': { 
        className: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: '🔄' 
      },
      'Resuelto': { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        icon: '✅' 
      },
      'Rechazado': { 
        className: 'bg-red-100 text-red-800 border-red-200', 
        icon: '❌' 
      }
    };
    return configs[status] || configs['Pendiente'];
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizes[size]}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;