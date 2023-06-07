// Import required functions from './utils.js'
import { getMousePos, getWinSize, isFirefox } from './utils.js';

// Initialize mouse position object
let mousepos = {x: 0, y: 0};

// Update 'mousepos' with the current mouse position
const updateMousePos = ev => {
    mousepos = getMousePos(ev);
};
  
// Listen for 'mousemove' and 'pointermove' events and update 'mousepos' accordingly
window.addEventListener('mousemove', updateMousePos);
window.addEventListener('pointermove', updateMousePos, { passive: true });

// Initialize window size object
let winsize = getWinSize();

// Recalculate window size on 'resize' event
window.addEventListener('resize', ev => {
    winsize = getWinSize();
});

// Class representing the Goo cursor
export class GooCursor {
    // Initialize DOM and style related properties
    DOM = {
        // Main DOM element
        el: null,
        // .cursor__inner element
        inner: null,
        // cells that get shown on mousemove
        cells: null,
    };
    // Size of one cell (.cursor__inner-box)
    cellSize;
    // Number of cell rows
    rows;
    // Number of cell columns
    columns;
    // Settings
    settings = {
        // Time that one cells gets visible before fading out
        ttl: 0.2
    };

    constructor(DOM_el) {
        this.DOM.el = DOM_el;

        // Cells wrapper element that gets the SVG filter applied
        this.DOM.inner = this.DOM.el.querySelector('.cursor__inner');

        // Too much for firefox...
        if ( !isFirefox() ) {
            this.DOM.inner.style.filter = 'url(#gooey)';
        }

        // ttl from data attr
        this.settings.ttl = this.DOM.el.getAttribute('data-ttl') || this.settings.ttl;
        
        // Calculate how many cells to insert into the .cursor__inner element:
        this.layout();

        // Initialize/Bind some events
        this.initEvents();
    }

    /**
     * Initialize/bind events
     */
    initEvents() {
        // Recalculate and create the .cursor__inner-box elements on 'resize'
        window.addEventListener('resize', () => this.layout());

        // Show/hide cells on 'mousemove' or 'pointermove' events
        const handleMove = () => {
            // Check which cell is being "hovered"
            const cell = this.getCellAtCursor();
          
            if (cell === null || this.cachedCell === cell) return;
            // Cache it
            this.cachedCell = cell;
            // Set opacity to 1
            gsap.set(cell, { opacity: 1 });
            // Set it back to 0 after a certain delay
            gsap.set(cell, { opacity: 0, delay: this.settings.ttl });
            // gsap.to(cell, { duration: 0.3, ease: 'expo', opacity: 0, delay: this.settings.ttl });
        }

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('pointermove', handleMove, { passive: true });
    }

    /**
     * Calculate and create the .cursor__inner-box elements.
     * These are the elements that get shown when moving the mouse
     */
    layout() {
        // The number of columns is defined in a CSS variable --columns
        this.columns = getComputedStyle(this.DOM.el).getPropertyValue('--columns');
        // Calculate cell size
        this.cellSize =  winsize.width/this.columns;
        // Calculate number of rows
        this.rows = Math.ceil(winsize.height/this.cellSize);
        // Calculate the total amount of cells (rows x columns)
        this.cellsTotal = this.rows * this.columns;
        // Insert [this.cellsTotal] cursor__inner-box elements inside the .cursor__inner element
        let innerStr = '';
        // Erase contents
        this.DOM.inner.innerHTML = '';
        
        const customColorsAttr = this.DOM.el.getAttribute('data-custom-colors');
        let customColorsArr;
        let customColorsTotal = 0;
        if ( customColorsAttr ) {
            customColorsArr = this.DOM.el.getAttribute('data-custom-colors').split(',');
            customColorsTotal = customColorsArr ? customColorsArr.length : 0;
        }
        for (let i = 0; i < this.cellsTotal; ++i) {
            innerStr += customColorsTotal === 0 ?  
                '<div class="cursor__inner-box"></div>' :
                `<div style="transform: scale(${gsap.utils.random(0.5,2)}); background:${customColorsArr[Math.round(gsap.utils.random(0,customColorsTotal-1))]}" class="cursor__inner-box"></div>`;
        }
        this.DOM.inner.innerHTML = innerStr;
        this.DOM.cells = this.DOM.inner.children;
    }

    /**
     * Gets the cell at the position of the cursor
     */
    getCellAtCursor() {
        const columnIndex = Math.floor(mousepos.x / this.cellSize);
        const rowIndex = Math.floor(mousepos.y / this.cellSize);
        const cellIndex = rowIndex * this.columns + columnIndex;

        if ( cellIndex >= this.cellsTotal || cellIndex < 0 ) {
            console.error('Cell index out of bounds');
            return null;
        }

        return this.DOM.cells[cellIndex];
    }
}