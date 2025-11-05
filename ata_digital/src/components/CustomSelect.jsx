import { useState } from 'react';
import '../styles/CustomSelect.css';

const CustomSelect = ({ label, value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    // Se for um grupo, procurar em todos os grupos
    for (const group of options) {
      if (group.options) {
        const found = group.options.find(opt => opt.value === value);
        if (found) return found.label;
      } else {
        if (group.value === value) return group.label;
      }
    }
    return value;
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="custom-select-container">
        <div 
          className={`custom-select ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`select-value ${!value ? 'placeholder' : ''}`}>
            {getDisplayValue()}
          </span>
          <span className={`select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>
        
        {isOpen && (
          <div className="select-dropdown">
            {options.map((item, index) => (
              item.options ? (
                // Grupo de opções
                <div key={index} className="select-group">
                  <div className="select-group-label">{item.label}</div>
                  {item.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="select-option group-option"
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              ) : (
                // Opção simples
                <div
                  key={index}
                  className="select-option"
                  onClick={() => handleSelect(item.value)}
                >
                  {item.label}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;