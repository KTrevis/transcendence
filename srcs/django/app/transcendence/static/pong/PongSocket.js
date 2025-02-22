// @ts-check
import { getPage, refreshScripts } from "../global/SPA.js"
import BaseWebSocket from "../global/websockets.js"
import { PongScene } from "./PongScene.js"

/**
 * @typedef {Object} PongSocketData
 * @property {string} [type]
 * @property {string} [friend]
 * @property {string} [html]
 * @property {Object} [p1]
 * @property {Object} [p2]
 * @property {Object} [ball]
 * @property {Object} [score]
 * @property {string} [player]
 * @property {string} [opponent]
 * @property {string} [initiator]
*/

/**
 * @readonly
 * @enum {number}
 */
const e_states = {
    INVITE_SENT: 0,
    INVITE_ACCEPTED: 1,
    LAUNCH_GAME: 2,
    IN_GAME: 3,
}

class PongSocket extends BaseWebSocket {
    /** @type {string|null} */
    opponent
    /** @type {PongScene|null} */
    game = null
    direction = ""
    clickPressed = false
    inGame = false

	constructor() {
		super("pong")
		addEventListener("page-changed", () => {
			this.socket.onmessage = null
			this.socket.close()
		})
	} 

    open() {
        const urlParams = new URLSearchParams(window.location.search) // @ts-ignore
        const id = urlParams.get("id")

        if (id != null) {
            const msg = {"type": "accept_invite", "id": id}
            this.socket.send(JSON.stringify(msg))
            return
        }
		
        this.opponent = urlParams.get("opponent");
        if (!this.opponent) {
            this.opponent = ""
            return
        }
        this.socket.send(JSON.stringify({"type": "accept_invite", "opponent": this.opponent}))
    }

    getClickDir(y = 0) {
        /** @type {HTMLCanvasElement} */ // @ts-ignore
        const canvas = this.game.renderer.domElement
        const rect = canvas.getBoundingClientRect()
        const clickHeight = y - rect.top
        
        if (clickHeight > rect.height / 2)
            return "down"
        return "up"
    }
    
    /** @param {number|undefined} y */
    sendDirection(y) {
        if (y)
            this.direction = this.getClickDir(y)
        if (this.clickPressed && this.direction != "")
            this.socket.send(JSON.stringify({"type": "move", "direction": this.direction}))
    }

    initGame() {
		this.inGame = true
        this.game = new PongScene()
        /** @type {HTMLCanvasElement} */
        const canvas = this.game.renderer.domElement

        canvas.addEventListener("mousedown", (e) => {
            if (e.buttons != 1) return
            this.clickPressed = true
            this.sendDirection(e.y)
        })
        
        canvas.addEventListener("touchstart", (e) => {
            this.clickPressed = true
            this.sendDirection(e.touches[0].clientY)
        })
        
        canvas.addEventListener("mousemove", (e) => {
            if (e.buttons != 1) return
            this.sendDirection(e.y)
        })
        
        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault()
            this.sendDirection(e.touches[0].clientY)
        })
        
        canvas.addEventListener("mouseup", (e) => {
            this.clickPressed = false
            this.direction = ""
        })
        
        canvas.addEventListener("touchend", (e) => {
            this.clickPressed = false
            this.direction = ""
        })
        
        setInterval(this.sendDirection.bind(this), 1_000 / 60_000)
    }

	async launchGame(html = "", player = "", opponent = "", initiator = "") {
		const container = document.querySelector("#pong-container");
		if (!container) return;
		container.innerHTML = html;
		await refreshScripts(container, container, "#pong-container");
		this.state = e_states.IN_GAME;
		this.initGame();
	
        /** @type {HTMLElement|null} */
		const playerName = document.querySelector("#player-name");
        /** @type {HTMLElement|null} */
		const opponentName = document.querySelector("#opponent-name");
		const namesContainer = document.querySelector("#pong-names");
	
		if (!playerName || !opponentName || !namesContainer) {
			return;
		}
		if (!this.game)
			return
		if (player === initiator) {
			playerName.textContent = "YOU";
			opponentName.textContent = opponent;
			playerName.style.left = this.game.paddle1.position.x + "px";
			opponentName.style.left = this.game.paddle2.position.x + "px"; 
		} else {
			playerName.textContent = opponent;
			opponentName.textContent = "YOU";
			playerName.style.left = this.game.paddle1.position.x + "px"; 
			opponentName.style.left = this.game.paddle2.position.x + "px"; 
		}
	}

    closeSocketAndRedirect() {
        if (this.socket) {
            this.socket.onclose = null; 
            this.socket.close();
        }
    
        setTimeout(() => {
            window.location.href = "/friends";
        }, 500);
    }

    checkPage() {
    	let page = window.location.pathname;
    	if (page !== "/games/") {
    		if (window.localPongWebSocket && window.localPongWebSocket.socket && window.localPongWebSocket.socket.readyState === WebSocket.OPEN) {
    			window.localPongWebSocket.socket.send(JSON.stringify({ type: "player_exit" }));
    			window.localPongWebSocket.socket.close();
    		} else {
    			console.warn("⚠️ Impossible d'envoyer player_exit : WebSocket déjà fermé ou inexistant.");
    		}
        
    		this.closeSocketAndRedirect()
    	}
    }

    /** @param {PongSocketData} json */
    updatePong(json) {
    	if (!this.game)
    		this.launchGame()
    	this.game.paddle1.position.x = json.p1.x
    	this.game.paddle1.position.y = json.p1.y

    	this.game.paddle2.position.x = json.p2.x
    	this.game.paddle2.position.y = json.p2.y

    	this.game.ball.position.x = json.ball.x
    	this.game.ball.position.y = json.ball.y
    	const playerScoreElement = document.querySelector("#player-score");
    	const opponentScoreElement = document.querySelector("#opponent-score");

    	if (playerScoreElement && opponentScoreElement) {
    		playerScoreElement.textContent = json.score.p1;
    		opponentScoreElement.textContent = json.score.p2;
    	}
    }

    /** @param {MessageEvent} e */
    async receive(e) {
    	/** @type {PongSocketData} */
    	const json = JSON.parse(e.data)

    	if (json.type == "update_pong")
    		return this.updatePong(json)

    	if (json.type == "game_aborted")
    		return await getPage("/friends")

    	if (json.type == "game_over")
    		return await getPage("/friends")

    	if (json.type == "invite_accepted" && this.inGame)
    		return this.socket.send(JSON.stringify({"type": "join_game"}))

    	if (json.type == "invite_accepted" && this.opponent == json.friend)
    		return this.socket.send(JSON.stringify({"type": "launch_game"}))

    	if (json.type == "launch_game") {
    		if (!json.html) {
    			console.error(json)
    			throw new Error("expected html")
    		}
    		this.launchGame(json.html, json.player, json.opponent, json.initiator)
    	}
    }
}

    function main() {
const websocket = new PongSocket()
}

main()