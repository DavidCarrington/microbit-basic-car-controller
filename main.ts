function sendMovement () {
    radio.sendValue("steer", steer)
    radio.sendValue("speed", speed)
}
function doControllerThings () {
    A = pins.digitalReadPin(DigitalPin.P0)
    B = pins.digitalReadPin(DigitalPin.P2)
    if (input.buttonIsPressed(Button.A) || input.buttonIsPressed(Button.B) || (A || B)) {
        changeMode("controller")
        detectAndSendControllerCommands()
    } else if (controllerMoving) {
        controllerMoving = 0
        speed = 0
        steer = 0
        sendMovement()
    }
}
function map (x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)
}
function doCarThings () {
    if (input.runningTime() < moveUntilTime) {
        if (steer == -1) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.digitalWritePin(DigitalPin.P1, 1)
        } else if (steer == 1) {
            pins.digitalWritePin(DigitalPin.P0, 1)
            pins.digitalWritePin(DigitalPin.P1, 0)
        } else {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.digitalWritePin(DigitalPin.P1, 0)
        }
        if (speed >= 0) {
            pins.analogWritePin(AnalogPin.P2, speed)
            pins.analogWritePin(AnalogPin.P16, 0)
        } else if (speed < 0) {
            pins.analogWritePin(AnalogPin.P2, 0)
            pins.analogWritePin(AnalogPin.P16, Math.abs(speed))
        }
    } else {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P1, 0)
        pins.analogWritePin(AnalogPin.P2, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
    }
}
radio.onReceivedValue(function (name, value) {
    changeMode("car")
    moveUntilTime = input.runningTime() + 60
    if (name == "speed") {
        speed = value
    } else if (name == "steer") {
        steer = value
    }
    doCarThings()
})
function changeMode (sMode: string) {
    if (mode != sMode) {
        mode = sMode
    }
}
function detectAndSendControllerCommands () {
    pitch = input.rotation(Rotation.Pitch)
    if (pitch > 80 && pitch < 110) {
        speed = 0
    } else if (pitch < 80) {
        speed = map(pitch, 80, 0, 200, maxSpeed)
    } else if (pitch > 110) {
        speed = -400
    }
    if (speed > maxSpeed) {
        speed = maxSpeed
    }
    if (input.buttonIsPressed(Button.AB) || A && B) {
        steer = 0
    } else if (input.buttonIsPressed(Button.A) || A) {
        steer = 1
    } else if (input.buttonIsPressed(Button.B) || B) {
        steer = -1
    }
    sendMovement()
}
let pitch = 0
let mode = ""
let B = 0
let A = 0
let speed = 0
let steer = 0
let moveUntilTime = 0
let controllerMoving = 0
let maxSpeed = 0
maxSpeed = 1023
radio.setGroup(1)
radio.setTransmitPower(7)
controllerMoving = 0
moveUntilTime = 0
changeMode("ready")
loops.everyInterval(50, function () {
    doControllerThings()
    if (mode == "car") {
        doCarThings()
    }
})
