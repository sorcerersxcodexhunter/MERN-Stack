import React, { useState } from 'react';

function Darkmode() {
    const [darkMode, setDarkMode] = useState(false);

    function toggleDarkMode() {
        setDarkMode((prev) => {
            const newMode = !prev;
            if (newMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            return newMode;
        });
    }

    return (
        <div className="form-check form-switch position-absolute top-0 end-0 m-3" >
            <input
                className="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                checked={darkMode}
                onChange={toggleDarkMode}
            />
        </div>
    );
}

export default Darkmode;
