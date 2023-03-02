// constants declaration
const linkedInPopUp = `<p>Invitations Sent</p>

                        <div class="single-chart">
                          <svg viewBox="0 0 36 36" class="circular-chart green">
                           <path class="circle-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"/>
                           <path class="circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <text x="18" y="20.35" class="percentage">0</text>
                          </svg>
                        </div>
                  
                       <button id="connect_btn" class="connect_button">START CONNECTING</button>`;

const otherPagePopUp = ` <p>LinkedIn Search People</p>
                         <button id="search_btn" class="search_button">Search People</button>`;

const linkedInSearchUrl = "https://www.linkedin.com/search/results/people";

// querying active tab, validation for active tab url,
// sending start/stop connecting button click info to content script

chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
	let url = tabs[0].url;

	if (url.startsWith(linkedInSearchUrl)) {
		console.log("linkedin");
		document.getElementById("popup_container").innerHTML = linkedInPopUp;
		const connectButton = document.getElementById("connect_btn");

		let buttonClicked = false;

		function onButtonClick() {
			if (buttonClicked) {
				connectButton.style.background = "red";
				connectButton.textContent = "STOP CONNECTING";

				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					chrome.tabs.sendMessage(tabs[0].id, { msg: "true" });
				});

				chrome.action.onClicked.addListener((tab) => {
					chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: ["../scripts/content.js"],
					});
				});
			} else {
				connectButton.style.background = "green";
				connectButton.textContent = "START CONNECTING";

				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					chrome.tabs.sendMessage(
						tabs[0].id,
						{ msg: "false" }
						// (response) => {}
					);
				});

				chrome.action.onClicked.addListener((tab) => {
					chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: ["../scripts/content.js"],
					});
				});
			}
		}

		connectButton.addEventListener("click", () => {
			buttonClicked = !buttonClicked;
			onButtonClick();
		});
	} else {
		console.log("other page");
		document.getElementById("popup_container").innerHTML = otherPagePopUp;
		const searchButton = document.getElementById("search_btn");
		searchButton.addEventListener("click", () => {
			chrome.tabs.create({
				url: linkedInSearchUrl,
			});
		});
	}
});

//Receiving buttonClickCount from contentjs and updating  popup UI
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request) {
		document.querySelector("text").textContent = request.msg;
		document
			.querySelector(".circle")
			.setAttribute("stroke-dasharray", `${(request.msg / 10) * 100}, 100`);
	}
});
