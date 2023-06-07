// Returns the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

// Returns the window width and height
const getWinSize = () => {
    return { 
        width: window.innerWidth, 
        height: window.innerHeight 
    };
};

const isFirefox = () => navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export {
    getMousePos,
    getWinSize,
    isFirefox,
};