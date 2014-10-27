window.onload = function () {

    var data; // array of dataPoints
    var xVal; // the x coordinate that datapoints will begin at
    var yVal; // the y coordinate that datapoints will begin at
    var updateInterval; // how frequently the chart will be updated (in milliseconds)
    var dataLength; // number of dataPoints visible at any point
    var pointColor; // the color of dataPoints on the chart
    var markerSize; // the size of dataPoints on the chart
    var gameTicks; //number of ticks the game should be played for, equivalent to game duration

    var bitcoins; // Capital in BTC
    var dollars; // Capital in USD
    var usd_per_btc; // How many USD will 1 BTC cost
    var btc_per_usd; // How many BTC will 1 USD cost

    var chart; // the CanvasJS chart

    var introPage = $("#introPage");
    var profitPage = $("#profitPage");

    // these make sure that the buttons don't act as back buttons
    introPage.popup({ history: false });
    profitPage.popup({ history: false });
    $.mobile.popup.prototype.options.history = false;

    CanvasJS.addColorSet("bitcoin_colors",
        [//colorSet Array
            "#FF9900"
        ]);

    function updateChart(count) {
        count = count || 1; // count is number of times loop runs to generate random dataPoints.

        var randomNum;
        for (var j = 0; j < count; j++) {
            randomNum = Math.round((Math.random() * 10) - 5);
            yVal = Math.max(yVal + randomNum, 0);
            data.push({
                x: xVal,
                y: yVal,
                color: pointColor,
                markerSize: markerSize
            });
            xVal++;
        }
        if (data.length > dataLength) {
            data.shift();
        }

        chart.render();

        pointColor = 'orange';
        markerSize = 1;
    }


    function exchangeWorth(amount, exchange_rate) {
        return amount * exchange_rate;
    }

    function updateHoldings() {
        if (bitcoins == 0) {
            bitcoins = dollars / usd_per_btc;
            dollars = 0;
        } else if (dollars == 0) {
            dollars = bitcoins * usd_per_btc;
            bitcoins = 0;
        }

        // $("#bitcoins").text(dps[dps.length-1].y)
        $("#bitcoins").text(bitcoins.toFixed(2) + " BTC");
        $("#dollars").text(dollars.toFixed(2) + " USD");
    }


    // Color conversions
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }


    // Animations
    function animate(timeLeft) {
        updateChart();

        usd_per_btc = Math.max(data[data.length - 1].y, 0.0001); // dirty dirty hack to avoid infinity values
        btc_per_usd = 1 / usd_per_btc;


        var timeLeftColor = rgbToHex(255 * (gameTicks - timeLeft) / gameTicks, 255 * timeLeft / gameTicks, 0);
        var timeLeftSelector = $("#timeLeft");
        timeLeftSelector.text(timeLeft);
        timeLeftSelector.css('color', timeLeftColor);

        var chartContainer = $("#chartContainer");

        if (timeLeft > 0) {
            setTimeout(function () {
                animate(timeLeft - 1);
            }, updateInterval);
        } else {
            $("#profit").text((dollars + exchangeWorth(bitcoins, usd_per_btc) - 10000) + " USD"); //update profit
            profitPage.popup(); // inits the popup
            profitPage.popup("open"); // opens the popup
        }


    }

    $("#start").on("click", function () {
        pointColor = 'green';
        markerSize = 6;
        updateHoldings();
        $("#start").toggle();
        $("#stop").toggle();
        $("#dollars").toggle();
        $("#bitcoins").toggle();
    });

    $("#stop").on("click", function () {
        pointColor = 'red';
        markerSize = 6;
        updateHoldings();
        $("#start").toggle();
        $("#stop").toggle();
        $("#dollars").toggle();
        $("#bitcoins").toggle();
    });

    $("#introCloseButton").on("click", function () {
        introPage.popup("close");
    });
    $("#profitCloseButton").on("click", function () {
        profitPage.popup("close");
    });



    introPage.bind({
        popupafterclose: function (event, ui) {
            resetGame([], 300, 0, 100, 100, 200, 'orange', 2, 0, 10000, 100);
            startGame(gameTicks);
        }
    });
    profitPage.bind({
        popupafterclose: function (event, ui) {
            resetGame([], 300, 0, 100, 100, 200, 'orange', 2, 0, 10000, 100);
            startGame(gameTicks);
            $("#dollars").text(dollars.toFixed(2) + " USD");
        }
    });


    function startGame(numTicks) {
        updateChart(dataLength);
        animate(numTicks);
    }

    function resetGame(dataParam, gameTicksParam, xValParam, yValParam, updateIntervalParam, dataLengthParam,
                       colorParam, markerSizeParam, bitcoinsParam, dollarsParam, usd_to_btcParam) {

        data = dataParam;
        gameTicks = gameTicksParam;
        xVal = xValParam;
        yVal = yValParam;
        updateInterval = updateIntervalParam;
        dataLength = dataLengthParam;
        pointColor = colorParam;
        markerSize = markerSizeParam;
        bitcoins = bitcoinsParam;
        dollars = dollarsParam;
        usd_per_btc = usd_to_btcParam;
        btc_per_usd = 1 / usd_per_btc;

        chart = new CanvasJS.Chart("chartContainer", {
//        title :{
//           text: "Bitcoin Rollercoaster"
//        },
            creditText: "",
            creditHref: "",
            colorSet: "bitcoin_colors",
            data: [
                {
                    type: "spline",
                    dataPoints: data,
                    toolTipContent: "${y}",
                    lineThickness: 2,
                    markerSize: 2
                }
            ],
            toolTip: {
                animationEnabled: false
            },
            axisX: {
                // title: "Minutes",
                // gridThickness: 1,
                tickLength: 5,
                // prefix: "test"
                interval: 100,
                prefix: "minute "
            },
            axisY: {
                interlacedColor: "#F8F1E4",
                tickLength: 5,
                prefix: "$",
                gridThickness: 0
            }
        });


        $("#stop").hide();
        $("#bitcoins").hide();
        $("#start").show();
        $("#dollars").show();
    }

    introPage.popup(); //inits the popup
    introPage.popup("open"); //opens the popup

    resetGame([], 300, 0, 100, 100, 200, 'orange', 2, 0, 10000, 100);
    updateChart(dataLength);
}