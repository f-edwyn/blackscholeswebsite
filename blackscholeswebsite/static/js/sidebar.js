document.getElementById("assetPrice").addEventListener("change", validateDollarValue)
document.getElementById("strikePrice").addEventListener("change", validateDollarValue)

function validateDollarValue() {
    var dollarValue = this.value
    defaultValue = 0.00

    if (dollarValue.length > 0 && Number(dollarValue)) {
        // If negative number, default to 0, change to re-prompt user.
        if (dollarValue < defaultValue) {
            this.value = defaultValue
            return
        }
        const numOfDecimals = 2
        this.value = parseFloat(dollarValue).toFixed(numOfDecimals)
        return
    }
    // If has letters, default to 0, change to re-prompt user.
    this.value = defaultValue
}