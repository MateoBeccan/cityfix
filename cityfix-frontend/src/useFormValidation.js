import { useState } from 'react';

export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
    setErrors
  };
};

// Reglas de validación comunes
export const validationRules = {
  required: (value) => !value?.toString().trim() ? 'Este campo es obligatorio' : '',
  
  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Email inválido' : '';
  },
  
  minLength: (min) => (value) => {
    if (!value) return '';
    return value.length < min ? `Mínimo ${min} caracteres` : '';
  },
  
  maxLength: (max) => (value) => {
    if (!value) return '';
    return value.length > max ? `Máximo ${max} caracteres` : '';
  },
  
  imageUrl: (value) => {
    if (!value) return '';
    const imageRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    return !imageRegex.test(value) ? 'Debe ser una URL de imagen válida' : '';
  }
};