import React from 'react';
import './CheckBox.css';
const CheckBox = ({ id, label, onChange, checked }) => {
  return (
    <label htmlFor={id} className="CheckBoxContainer">
      <input
        onChange={onChange}
        type="checkbox"
        checked={checked}
        id={id}
        className="CheckBoxInput"
      />
      <span className="CheckBoxLabel">{label}</span>
    </label>
  );
};
export default CheckBox;
