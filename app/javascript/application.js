// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener("DOMContentLoaded", function() {

    const storedLocationName = localStorage.getItem("locationName");
    if (storedLocationName) {
        document.getElementById("current-weather-location").textContent = "Current Weather in " + storedLocationName;
    }

    initializeAutocomplete();
    window.openTab = function(event) {
        console.log(`Tab clicked`);

        let i, tabContent, tabLinks;

        tabContent = document.getElementsByClassName("tab-pane");
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].style.display = "none";
            tabContent[i].classList.remove("active");
        }

        tabLinks = document.getElementsByClassName("nav-link");
        for (i = 0; i < tabLinks.length; i++) {
            tabLinks[i].className = tabLinks[i].className.replace(" active", "");
        }

        const tabName = event.currentTarget.getAttribute('data-tab');

        const currentTab = document.getElementById(tabName);
        currentTab.style.display = "block";
        currentTab.classList.add("active");
        event.currentTarget.className += " active";
    }

    const defaultTab = document.querySelector("[data-tab='current']");
    if (defaultTab) {
        openTab({ currentTarget: defaultTab });
    }

    const geolocationButton = document.getElementById("use-geolocation");
    if (geolocationButton) {
        geolocationButton.addEventListener("click", function() {
            getLocation();
        });

    }
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function sendPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch('/weather/reverse_geocode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute("content")
        },
        body: JSON.stringify({ latitude, longitude }),
    })
        .then(response => response.json())
        .then(data => {
            const cityName = data.location_name;
            localStorage.setItem("locationName", cityName);
            document.querySelector("input[name='location']").value = cityName;

            // Update the text content for the current weather location
            document.getElementById("current-weather-location").textContent = "Current Weather in " + cityName;

            // Update the form action to include latitude and longitude, and then submit
            const form = document.getElementById("weather-search-form");
            form.action = `/weather/dashboard?latitude=${latitude}&longitude=${longitude}&locationName=${encodeURIComponent(cityName)}`;
            form.submit();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}



function getSimpleAddress(addressComponents) {
    let city = null;
    let state = null;
    let country = null;

    for (let i = 0; i < addressComponents.length; i++) {
        if (addressComponents[i].types.indexOf('locality') !== -1) {
            city = addressComponents[i].long_name;
        }

        if (addressComponents[i].types.indexOf('administrative_area_level_1') !== -1) {
            state = addressComponents[i].short_name;
        }

        if (addressComponents[i].types.indexOf('country') !== -1) {
            country = addressComponents[i].long_name;
        }
    }

    if (city && state && country) {
        return `${city}, ${state}, ${country}`;
    }

    return null;
}

function initializeAutocomplete() {
    const input = document.querySelector("input[name='location']");
    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();

        if (place.geometry) {
            const latitude = place.geometry.location.lat();
            const longitude = place.geometry.location.lng();
            const fullLocationName = place.formatted_address;
            const simpleAddress = getSimpleAddress(place.address_components);
            if (simpleAddress) {
                localStorage.setItem("locationName", simpleAddress); // Store in local storage
            } else {
                localStorage.setItem("locationName", fullLocationName); // Store in local storage
            }
            if (simpleAddress) {
                document.getElementById("current-weather-location").textContent = "Current Weather in " + simpleAddress;
                window.location.href = `/weather/dashboard?latitude=${latitude}&longitude=${longitude}&locationName=${encodeURIComponent(simpleAddress)}`;
            } else {
                document.getElementById("current-weather-location").textContent = "Current Weather in " + fullLocationName;
                window.location.href = `/weather/dashboard?latitude=${latitude}&longitude=${longitude}&locationName=${encodeURIComponent(fullLocationName)}`;
            }

            fetch(`/weather/dashboard?location=${simpleAddress}`, {
                method: 'GET',
            })
                .then(response => response.json())
                .then(data => {
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

// Saving to local storage
            localStorage.setItem("locationName", simpleAddress || fullLocationName);

// When you fetch the weather data
            fetch('/weather/dashboard_location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute("content")
                },
                body: JSON.stringify({latitude, longitude}),
            })
                .then(response => response.json())
                .then(data => {
                    // Update the UI here, if needed
                })
                .finally(() => {
                    // Now that we have fetched the data, navigate to the new URL
                    window.location.href = `/weather/dashboard?latitude=${latitude}&longitude=${longitude}&locationName=${encodeURIComponent(simpleAddress || fullLocationName)}`;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        }
    });
}
