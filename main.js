class Mouse {
  constructor(network) {
    this.network = network
    this.pos = null
    window.addEventListener("mousemove", this.#handleMouseMove.bind(this))
    window.addEventListener("touchmove", this.#handleMouseMove.bind(this))
    window.addEventListener("mouseout", this.#handleMouseLeave.bind(this))
    window.addEventListener("touchend", this.#handleMouseLeave.bind(this))
  }
  #handleMouseMove(e) {
    this.pos = {
      x: e.pageX,
      y: e.pageY
    }
  }
  #handleMouseLeave(e) {
    this.pos = null
  }
  draw(ctx) {
    if (!this.pos) return
    // Mouse
    ctx.fillStyle = "#4ecbd4"
    ctx.shadowColor = "#4ecbd4"
    ctx.shadowBlur = 50
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 10, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    // Connections
    this.network.neuronList.forEach((neuron) => {
      const d =
        Math.pow(neuron.x - this.pos.x, 2) + Math.pow(neuron.y - this.pos.y, 2)
      if (d > Math.pow(this.network.maxNeuronDistance, 2)) return null
      ctx.strokeStyle = "rgba(78,203,212,.3)"
      ctx.beginPath()
      ctx.moveTo(this.pos.x, this.pos.y)
      ctx.lineTo(neuron.x, neuron.y)
      ctx.closePath()
      ctx.stroke()
    })
  }
}

class Neuron {
  static id = 0
  constructor(network, x, y, r) {
    this.network = network
    this.id = Neuron.id++
    this.x = Math.floor(x)
    this.y = Math.floor(y)
    this.r = Math.floor(r)
    this.originX = Math.floor(x)
    this.originY = Math.floor(y)
    this.vx = (Math.random() * 2 - 1) * Math.random() * 2
    this.vy = (Math.random() * 2 - 1) * Math.random() * 2
  }
  draw(ctx) {
    // Neuron
    ctx.fillStyle = "#4ecbd4"
    ctx.shadowColor = "#4ecbd4"
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    // Connections to closest
    let connections = 0
    this.network.neuronList.forEach((neuron) => {
      if (connections >= this.network.maxNeuronConnections) return null
      if (this.network.neuronConnections[neuron.id]?.includes(this.id))
        return null
      if (neuron == this) return
      const d = Math.pow(neuron.x - this.x, 2) + Math.pow(neuron.y - this.y, 2)
      if (d > Math.pow(this.network.maxNeuronDistance, 2)) return null
      connections++
      ctx.strokeStyle = "rgba(78,203,212,.1)"
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(neuron.x, neuron.y)
      ctx.closePath()
      ctx.stroke()
      if (!this.network.neuronConnections[neuron.id]) {
        this.network.neuronConnections[neuron.id] = []
      }
      if (!this.network.neuronConnections[this.id]) {
        this.network.neuronConnections[this.id] = []
      }
      this.network.neuronConnections[neuron.id].push(this.id)
      this.network.neuronConnections[this.id].push(neuron.id)
    })
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    if (this.x <= 0.0 || this.x >= this.network.canvas.width) {
      this.vx *= -1
    }
    if (this.y <= 0.0 || this.y >= this.network.canvas.height) {
      this.vy *= -1
    }
    if (this.x < 0.0) {
      this.x = 0.0
    }
    if (this.x > this.network.canvas.width) {
      this.x = this.network.canvas.width
    }
    if (this.y < 0.0) {
      this.y = 0.0
    }
    if (this.y > this.network.canvas.height) {
      this.y = this.network.canvas.height
    }
  }
}

class Network {
  constructor() {
    // Dom
    this.canvas = document.getElementById("Scene")
    this.ctx = this.canvas.getContext("2d")
    // Neurons
    this.neuronList = []
    this.neuronConnections = {}
    this.neuronAmount = 100
    this.maxNeuronDistance = 150
    this.maxNeuronConnections = 5
    this.#createNeurons()
    // Mouse
    this.mouse = new Mouse(this)
    // Inputs
    this.inputNeuronAmount = document.getElementById("neuronsAmount")
    this.inputNeuronAmountLabel = document.getElementById("neuronsAmountLabel")

    this.inputNeuronDistance = document.getElementById("neuronsDistance")
    this.inputNeuronDistanceLabel = document.getElementById(
      "neuronsDistanceLabel"
    )

    this.inputNeuronConnections = document.getElementById("neuronsConnections")
    this.inputNeuronConnectionsLabel = document.getElementById(
      "neuronsConnectionsLabel"
    )

    this.inputNeuronAmount.addEventListener("input", (e) => {
      this.inputNeuronAmountLabel.innerHTML = `Liczba punktów (${e.target.value})`
      this.neuronAmount = e.target.value
      this.#createNeurons()
    })
    this.inputNeuronDistance.addEventListener("input", (e) => {
      this.inputNeuronDistanceLabel.innerHTML = `Liczba punktów (${e.target.value})`
      this.maxNeuronDistance = e.target.value
    })
    this.inputNeuronConnections.addEventListener("input", (e) => {
      this.inputNeuronConnectionsLabel.innerHTML = `Liczba punktów (${e.target.value})`
      this.maxNeuronConnections = e.target.value
    })

    this.inputNeuronAmount.value = this.neuronAmount
    this.inputNeuronAmountLabel.innerHTML = `Liczba punktów (${this.neuronAmount})`
    this.inputNeuronDistance.value = this.maxNeuronDistance
    this.inputNeuronDistanceLabel.innerHTML = `Liczba punktów (${this.maxNeuronDistance})`
    this.inputNeuronConnections.value = this.maxNeuronConnections
    this.inputNeuronConnectionsLabel.innerHTML = `Liczba punktów (${this.maxNeuronConnections})`
    // Frames
    this.#frame()
  }
  #createNeurons() {
    this.neuronList = []
    for (let i = 0; i < this.neuronAmount; i++) {
      this.neuronList.push(
        new Neuron(
          this,
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          2
        )
      )
    }
  }
  #draw() {
    this.neuronList.forEach((neuron) => neuron.draw(this.ctx))
    this.mouse.draw(this.ctx)
  }
  #update() {
    this.neuronList.forEach((neuron) => neuron.update())
  }
  #frame() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.#draw()
    this.neuronConnections = []
    this.#update()
    requestAnimationFrame(this.#frame.bind(this))
  }
}

const web = new Network()
