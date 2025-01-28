import BaseWebSocket from "../global/websockets.js"
import {user} from "./rps.js"
import {getPage} from "../global/SPA.js"

class RPSSocket extends BaseWebSocket {
    constructor() {
        super("rps")
    }
     /** @param {MessageEvent} e */
    async receive(e) {

        const json = JSON.parse(e.data)
        console.log(Object.keys(json))
        console.log(Object.values(json))
        console.log(json["id"])
        console.log(window.location.pathname)
        if (user == json["username"] && window.location.pathname == "/rps/")
        {
            this.socket.send(JSON.stringify({"type": "launch_game"}))
            let url = `/rps/game?id=${json["id"]}`
            await getPage(url)
        }
    }
}

function main() {
    const socket = new RPSSocket()
}

main()