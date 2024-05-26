import React, { useState } from 'react';

function DropdownButton({ insertNewPage }) {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleOptionClick = (option) => {
        setDropdownVisible(false);
        insertNewPage(option);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginTop: "1%", marginBottom: "1%" }}>
            <button 
                onClick={() => setDropdownVisible(!dropdownVisible)} 
                style={{ fontSize: 25 }}
            >
                <i className="fa fa-plus"></i>
            </button>
            {dropdownVisible && (
                <div style={{
                    position: 'absolute',
                    top: '100%',  // Positions the dropdown below the button
                    left: '50%',  // Adjusts the left position
                    transform: 'translateX(-50%)',  // Centers the dropdown
                    backgroundColor: 'white',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    zIndex: 999,
                    minWidth: '150px'  // Ensures the dropdown has a minimum width
                }}>
                    <div 
                        onClick={() => handleOptionClick('Title Page')} 
                        style={{ padding: '10px', cursor: 'pointer' }}
                    >
                        Title Page
                    </div>
                    <div 
                        onClick={() => handleOptionClick('Cover Page 1')} 
                        style={{ padding: '10px', cursor: 'pointer' }}
                    >
                        Cover Page 1
                    </div>
                    <div 
                        onClick={() => handleOptionClick('Cover Page 2')} 
                        style={{ padding: '10px', cursor: 'pointer' }}
                    >
                        Cover Page 2
                    </div>
                    {/* Add more options as needed */}
                </div>
            )}
        </div>
    );
}

export default DropdownButton;
