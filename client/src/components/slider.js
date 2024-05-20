import React, { useState } from 'react';
import { Range } from 'react-range';

const Slider2 = () => {
    const [values, setValues] = useState([1980, 1985]);

    return (
        <div className="flex flex-col items-center justify-center w-10/12 h-screen bg-gray-100 p-4">
            <h2 className="mb-4 text-lg font-semibold">Select Time Interval</h2>
            <Range
                step={1}
                min={1950}
                max={2024}
                values={values}
                onChange={(values) => setValues(values)}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        className="w-full h-2 bg-gray-300 rounded"
                        style={{
                            ...props.style,
                            height: '6px',
                            background: 'linear-gradient(to right, #ccc, #888)',
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props, isDragged }) => (
                    <div
                        {...props}
                        className={`w-4 h-4 bg-blue-500 rounded-full ${isDragged ? 'shadow-lg' : ''}`}
                        style={{
                            ...props.style,
                        }}
                    />
                )}
            />
            <div className="flex justify-between w-full mt-4">
                <span>{values[0]}</span>
                <span>{values[1]}</span>
            </div>
        </div>
    );
};

export default Slider2;
