// @ts-check

import {getPage} from "../global/SPA.js"

/** @param {Event} e */
function onAccordionClicked(e) {
	const toFind = ".accordion-collapse.collapsing"
	/** @type { NodeList } */
	const accordionContent = document.querySelectorAll( toFind)

	if (accordionContent.length == 1) {
		const toChange = document.querySelector(toFind)
		if (!toChange)
			throw new Error("failed to find toFind")
		toChange?.classList.add("show")
		toChange?.classList.add("collapse")
		toChange?.classList.remove("collapsing")
	}
}

function keepOneAccordionOpened() {
	/** @type { NodeListOf<HTMLButtonElement> } */
	const buttons = document.querySelectorAll("button.accordion-button")
	buttons.forEach(button => button.onclick = onAccordionClicked)
}


/** @returns {Promise<boolean>} */
async function isAuthenticated() {
	/** @type {Response|string} */
	let res = await fetch("/api/check-authentication")
	res = await res.text()
	return res == "true"
}

function main() {
	keepOneAccordionOpened()
	
	const urlParams = new URLSearchParams(window.location.search)
	if (urlParams.get("register") != null) {
		/** @type {HTMLDivElement|undefined|void} */
		document.querySelector("#collapse-login")?.classList.remove("show")
		document.querySelector("#collapse-register")?.classList.add("show")
	}
}

main()