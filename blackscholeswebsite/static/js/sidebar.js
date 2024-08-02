assetPrice = document.getElementById("assetPrice")
strikePrice = document.getElementById("strikePrice")
time = document.getElementById("time")
volatility = document.getElementById("volatility")
rfiRate = document.getElementById("rfiRate")

listOfVariables = [assetPrice, strikePrice, time, volatility, rfiRate]

listOfVariables.forEach(function(variable) {
    variable.addEventListener("change", validateValue)
});

function validateValue() {
    var inputValue = this.value
    var defaultValue = 0.00

    if (inputValue.length > 0 && Number(inputValue)) {
        // If negative number, default to 0, change to re-prompt user.
        if (inputValue < defaultValue) {
            this.value = defaultValue
            updateModelValue(this.id, this.value)
            return
        }
        const numOfDecimals = 2
        this.value = parseFloat(inputValue).toFixed(numOfDecimals)
        updateModelValue(this.id, this.value)
        return
    }
    // If has letters, default to 0, change to re-prompt user.
    this.value = defaultValue
    updateModelValue(this.id, this.value)
}