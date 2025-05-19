import React, { useReducer, useEffect } from 'react';
import { validate } from '../../util/validators';
import './DateTimePicker.css';

const dateTimeReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators)
      };
    case 'TOUCH':
      return {
        ...state,
        isTouched: true
      };
    default:
      return state;
  }
};

// Helper to format to correct input type value
const formatToInputValue = (dateStr, type) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const iso = date.toISOString();

  switch (type) {
    case 'date':
      return iso.substring(0, 10); // YYYY-MM-DD
    case 'time':
      return iso.substring(11, 16); // HH:MM
    case 'datetime-local':
    default:
      return iso.substring(0, 16); // YYYY-MM-DDTHH:MM
  }
};

const DateTimePicker = props => {
  const inputType = props.mode || 'datetime'; // 'date', 'time', or 'datetime'

  const htmlInputType =
    inputType === 'date'
      ? 'date'
      : inputType === 'time'
      ? 'time'
      : 'datetime-local';

  const [inputState, dispatch] = useReducer(dateTimeReducer, {
    value: formatToInputValue(props.initialValue, htmlInputType),
    isTouched: false,
    isValid: props.initialValid || false
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    // Convert local string to UTC ISO string for form state
    let date;
    if (inputType === 'time') {
      date = new Date(`1970-01-01T${value}`);
    } else if (inputType === 'date') {
      date = new Date(`${value}T00:00`);
    } else {
      date = new Date(value);
    }
    onInput(id, value ? date.toISOString() : '', isValid);
  }, [id, value, isValid, onInput, inputType]);

  const changeHandler = event => {
    dispatch({
      type: 'CHANGE',
      val: event.target.value,
      validators: props.validators
    });
  };

  const touchHandler = () => {
    dispatch({ type: 'TOUCH' });
  };

  return (
    <div
      className={`form-control ${
        !inputState.isValid && inputState.isTouched && 'form-control--invalid'
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type={htmlInputType}
        id={props.id}
        value={inputState.value}
        onChange={changeHandler}
        onBlur={touchHandler}
      />
      {!inputState.isValid && inputState.isTouched && (
        <p>{props.errorText}</p>
      )}
    </div>
  );
};

export default DateTimePicker;
