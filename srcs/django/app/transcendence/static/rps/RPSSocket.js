import BaseWebSocket from "../global/websockets.js"

class RPSSocket extends BaseWebSocket {
    constructor() {
        super("rps")
    }
     /** @param {MessageEvent} e */
    async receive(e) {
        await getPage("/rps/game?id={invite}")
    }
}


function main() {
    const socket = new RPSSocket()
}

main()