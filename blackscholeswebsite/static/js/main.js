function updateModelValue(elementID, updatedValue) {
    const modelElement = "model".concat(elementID.charAt(0).toUpperCase() + elementID.slice(1))
    var existingValue = document.getElementById(modelElement)
    existingValue.innerHTML = updatedValue
}

function calculateModelValuation() {
    fetch("/model/perform-valuation", {
        method: "POST",
        body: JSON.stringify({
            assetPrice: assetPrice.value,
            strikePrice: strikePrice.value,
            time: time.value,
            volatility: volatility.value,
            rfiRate: rfiRate.value
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.calculation_error) {
            console.log(data.calculation_error)
        }
    });
}