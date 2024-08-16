const callValueFeedBackArea = document.querySelector(".callValueFeedback")
const putValueFeedBackArea = document.querySelector(".putValueFeedback")

const callHeatMapFeedBackArea = document.querySelector('.callHeatMapFeedback')
const putHeatMapFeedBackArea = document.querySelector('.putHeatMapFeedback')


function updateModelValue(elementID, updatedValue) {
    const modelElement = "model".concat(elementID.charAt(0).toUpperCase() + elementID.slice(1))
    var existingValue = document.getElementById(modelElement)

    if (elementID.includes('Price')) {
        existingValue.innerHTML = '$' + updatedValue
    } else if (elementID.includes('Rate')) {
        existingValue.innerHTML = updatedValue + '%'
    } else {
        existingValue.innerHTML = updatedValue
    }
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
        callValueFeedBackArea.innerHTML = `<h4>Call Value</h4><h5>$${data.call_value}</h5>`
        putValueFeedBackArea.style.display = "block"
        putValueFeedBackArea.innerHTML = `<h4>Put Value</h4><h5>$${data.put_value}</h5>`
    })
}

function validHeatParameters(element1, element2, feedBackArea1, feedBackArea2, values) {
    if (element1.value == element2.value) {
        for (var element=0; element < arguments.length - 1; element++) {
            arguments[element].classList.add("is-invalid")
            if (arguments[element].getAttribute("class").includes("Feedback")) {
                arguments[element].style.display = "block"
                arguments[element].innerHTML = `<p>${values} cannot be the same to create heatmap.</p>`
            }
        }
        return false
    }
    return true
}

function removeInvalidParameters(element1, element2, feedBackArea1, feedBackArea2) {
    for(var index=0; index < arguments.length; index++) {
        arguments[index].classList.remove("is-invalid")
        if(arguments[index].getAttribute("class").includes("Feedback")) {
            arguments[index].style.display = "none"
        }
    }
}

async function createHeatMap() {
    try {
        const response = await fetch("/model/create-heatmap", {
            method: "POST",
            body: JSON.stringify({
                strikePrice: strikePrice.value,
                rfiRate: rfiRate.value,
                volatility: volatility.value,
                minSpotPrice: minSpotPrice.value,
                maxSpotPrice: maxSpotPrice.value,
                heatMapMinTime: heatMapMinTime.value,
                heatMapMaxTime: heatMapMaxTime.value
            })
        });

        const data = await response.json();

        if (data.heatmap_error) {
            console.log(data.heatmap_error)
        }
        const callBase64String = data.call_uri
        const callImgSrc = 'data:image/png;base64,' + callBase64String
        callHeatMapFeedBackArea.innerHTML = `<img src="${callImgSrc}" alt="Call Option Heatmap" style="width:100%; max-width:800px;">`
    
        const putBase64String = data.put_uri
        const putImgSrc = 'data:image/png;base64,' + putBase64String
        putHeatMapFeedBackArea.innerHTML = `<img src="${putImgSrc}" alt="Put Option Heatmap" style="width:100%; max-width:800px;">`

    } catch (error) {
        console.error('Error creating heatmap:', error)
    }
}
