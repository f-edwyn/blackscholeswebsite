const callValueFeedBackArea = document.querySelector(".callValueFeedback")
const putValueFeedBackArea = document.querySelector(".putValueFeedback")

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
        callValueFeedBackArea.style.display = "block"
        callValueFeedBackArea.innerHTML = `<h5>Call Value</h5><p>$${data.call_value}</p>`
        putValueFeedBackArea.style.display = "block"
        putValueFeedBackArea.innerHTML = `<h5>Put Value</h5><p>$${data.put_value}</p>`
    });
}