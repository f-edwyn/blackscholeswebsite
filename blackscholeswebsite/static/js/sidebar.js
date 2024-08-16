const assetPrice = document.getElementById("assetPrice")
const assetPriceFeedBackArea = document.querySelector(".assetPriceFeedback")

const strikePrice = document.getElementById("strikePrice")
const strikePriceFeedBackArea = document.querySelector(".strikePriceFeedback")


const time = document.getElementById("time")
const timeFeedbackArea = document.querySelector(".timeFeedback")


const volatility = document.getElementById("volatility")
const volatilityFeedBackArea = document.querySelector(".volatilityFeedback")


const rfiRate = document.getElementById("rfiRate")
const rfiRateFeedBackArea = document.querySelector(".rfiRateFeedback")

const minSpotPrice = document.getElementById("minSpotPrice")
const minSpotPriceFeedBackArea = document.querySelector(".minSpotPriceFeedback")

const maxSpotPrice = document.getElementById("maxSpotPrice")
const maxSpotPriceFeedBackArea = document.querySelector(".maxSpotPriceFeedback")

const heatMapMinTime = document.getElementById("heatMapMinTime")
const minTimeFeedBackArea = document.querySelector(".minTimeFeedback")

const heatMapMaxTime = document.getElementById("heatMapMaxTime")
const maxTimeFeedBackArea = document.querySelector(".maxTimeFeedback")

const variables = [{
    "value": assetPrice,
    "feedBackArea": assetPriceFeedBackArea,
    "updateValue": true
},{
    "value": strikePrice,
    "feedBackArea": strikePriceFeedBackArea,
    "updateValue": true
},{
    "value": time,
    "feedBackArea": timeFeedbackArea,
    "updateValue": true
},{
    "value": volatility,
    "feedBackArea": volatilityFeedBackArea,
    "updateValue": true
},{
    "value": rfiRate,
    "feedBackArea": rfiRateFeedBackArea,
    "updateValue": true
},{
    "value": minSpotPrice,
    "feedBackArea": minSpotPriceFeedBackArea,
},{
    "value": maxSpotPrice,
    "feedBackArea": maxSpotPriceFeedBackArea
},{
    "value": heatMapMinTime,
    "feedBackArea": minTimeFeedBackArea
},{
    "value": heatMapMaxTime,
    "feedBackArea": maxTimeFeedBackArea
}]

variables.forEach(function(variable) {
    variable.value.addEventListener("change", function(){
        validateValue(variable.value, variable.feedBackArea, variable.updateValue)
    })
})

function validateValue(value, feedBackArea, updateValue=false) {
    var inputValue = value.value

    value.classList.remove("is-invalid")
    feedBackArea.classList.remove("is-invalid")
    feedBackArea.style.display = "none"

    if (inputValue.length > 0 && Number(inputValue)) {
        if (inputValue < 0) {
            fetch("/model/validate-value", {
                method: "POST",
                body: JSON.stringify({ value: inputValue })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.value_error) {
                    value.classList.add("is-invalid")
                    feedBackArea.style.display = "block"
                    feedBackArea.innerHTML = `<p>${data.value_error}</p>`
                }
            })
            return
        }

        const numOfDecimals = 2
        value.value = parseFloat(inputValue).toFixed(numOfDecimals)
        if (updateValue) {
            updateModelValue(value.id, value.value)
        }
        calculateModelValuation()

        isPriceValid = validHeatParameters(minSpotPrice, maxSpotPrice, minSpotPriceFeedBackArea, maxSpotPriceFeedBackArea, "Spot Prices")
        if (isPriceValid){
            removeInvalidParameters(minSpotPrice, maxSpotPrice, minSpotPriceFeedBackArea, maxSpotPriceFeedBackArea)
        }
        
        isTimeValid = validHeatParameters(heatMapMinTime, heatMapMaxTime, minTimeFeedBackArea, maxTimeFeedBackArea, "Min/Max time values")
        if (isTimeValid){
            removeInvalidParameters(heatMapMinTime, heatMapMaxTime, minTimeFeedBackArea, maxTimeFeedBackArea)
        }

        if (isPriceValid && isTimeValid) {
            showLoader()
            createHeatMap()
            setTimeout(() => {
                hideLoader()
            }, 1000)
        }
        return
    }

    fetch("/model/validate-value", {
        method: "POST",
        body: JSON.stringify({ value: inputValue })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.value_error) {
            value.classList.add("is-invalid")
            feedBackArea.style.display = "block"
            feedBackArea.innerHTML = `<p>${data.value_error}</p>`
        }
    })
}

function showLoader() {
    document.getElementById('loader').style.display = 'block'
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none'
}