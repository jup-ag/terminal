import React, { useEffect, useMemo } from 'react';
import {  RgbColor, RgbColorPicker } from 'react-colorful';

interface ColorPickerProps {
  label: string;
  colorKey: string;
  currentColor: string;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  setValue:(rgb: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  currentColor,
  isActive,
  setIsActive,
  setValue,
}) => {
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isActive && !(event.target as Element).closest('.color-picker-container')) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, setIsActive]);

  const handleColorChange = (color: RgbColor) => {
    setValue(`${color.r}, ${color.g}, ${color.b}`);
  };

  const handleRgbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

 
  const {r, g, b} = useMemo(() => {
    const rgb = currentColor.split(',').map(Number);
    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    }
  }, [currentColor])

  return (
    <div className="mt-4">
      <p className="text-sm text-white/75 mb-2">{label}</p>
      <div className="flex items-center space-x-2">
        <div className="relative color-picker-container">
          <div
            className="w-8 h-8 rounded border border-neutral-500 cursor-pointer"
            style={{ backgroundColor:`rgb(${r}, ${g}, ${b})`}}
            onClick={() => setIsActive(!isActive)}
          />
          {isActive && (
            <div className="absolute z-20 mt-2">
              <RgbColorPicker
                color={{r, g, b}}
                
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>
        <input
          className="w-full text-white rounded-md bg-white/10 px-3 py-2 text-sm border border-white/10"
          value={currentColor}
          onChange={handleRgbInputChange}
        />
      </div>
    </div>
  );
};

export default ColorPicker; 