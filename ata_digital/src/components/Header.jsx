import { useNavigate } from 'react-router-dom';

const Header = ({ title, showBackButton = false, actions = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="card mb-6">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-secondary btn-sm"
              >
                ← Voltar
              </button>
            )}
            <div>
              <h1 className="mb-0">{title}</h1>
            </div>
          </div>
          
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`btn ${action.variant || 'btn-primary'}`}
                  disabled={action.disabled}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;