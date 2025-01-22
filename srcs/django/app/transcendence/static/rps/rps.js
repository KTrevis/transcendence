import {getPage} from "../global/SPA.js"

/** @param {SubmitEvent} e */
async function invitePlayer(e) {
    e.preventDefault()
    const username = e.target["username"].value
    console.log(username)
    const url = `/rps/invite?username=${username}`
    await getPage(url)
}

function main() {
    /** @type {HTMLFormElement} */
    const form = document.getElementById("invite-player")
    
    form.onsubmit = invitePlayer
}

main()