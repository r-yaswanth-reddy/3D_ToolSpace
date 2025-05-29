let display = document.getElementById('input1');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        // Replace % operator with /100 for percentage calculations
        let expression = display.value.replace(/%/g, '/100');
        
        // Evaluate the expression and handle decimals appropriately
        let result = eval(expression);
        
        // Format the result to avoid excessive decimal places
        if (Number.isInteger(result)) {
            display.value = result;
        } else {
            display.value = parseFloat(result.toFixed(8));
        }
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '';
        }, 1500);
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    display = document.getElementById('input1');
});

// Make functions globally accessible
window.appendToDisplay = appendToDisplay;
window.clearDisplay = clearDisplay; 
window.calculate = calculate;
