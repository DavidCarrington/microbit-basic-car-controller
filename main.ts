function sendDirection () {
    radio.sendNumber(input.compassHeading())
}
// JS modulo doesn't work like most other languages, so a custom version is required
function modulo (a: number, n: number) {
    return a - Math.floor(a / n) * n
}
radio.onReceivedNumber(function (receivedNumber) {
    serial.writeValue("controllerDirection", receivedNumber)
    serial.writeValue("carDirection", input.compassHeading())
    serial.writeValue("steer", calculateRotationRequired(receivedNumber, input.compassHeading()))
})
function stop () {
    pins.digitalWritePin(DigitalPin.P0, 0)
    pins.digitalWritePin(DigitalPin.P1, 0)
}
function doControllerThings () {
    if (input.buttonIsPressed(Button.A)) {
        changeMode("controller")
        controllerMoving = 1
        radio.sendString("forward")
        sendDirection()
    } else if (input.buttonIsPressed(Button.B)) {
        changeMode("controller")
        controllerMoving = 1
        radio.sendString("backward")
        sendDirection()
    } else if (mode == "controller") {
        if (controllerMoving) {
            controllerMoving = 0
            radio.sendString("stop")
        }
    } else {
    	
    }
}
radio.onReceivedString(function (receivedString) {
    changeMode("car")
    moveUntilTime = input.runningTime() + 110
    if (receivedString == "forward") {
        carMoving = 1
    } else if (receivedString == "backward") {
        carMoving = -1
    } else if (receivedString == "stop") {
        moveUntilTime = 0
        stop()
    } else {
    	
    }
})
function doCarThings () {
    if (input.runningTime() < moveUntilTime) {
        if (carMoving == 1) {
            pins.digitalWritePin(DigitalPin.P0, 1)
            pins.digitalWritePin(DigitalPin.P1, 0)
        } else if (carMoving == -1) {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.digitalWritePin(DigitalPin.P1, 1)
        } else {
            stop()
        }
    } else {
        stop()
    }
}
function changeMode (sMode: string) {
    if (mode != sMode) {
        mode = sMode
        if (mode == "controller") {
            basic.showLeds(`
                . . # . .
                . . # . .
                # # # # #
                # . # . #
                # # # # #
                `)
        } else if (mode == "ready") {
            basic.showIcon(IconNames.Heart)
        } else {
            basic.clearScreen()
        }
    }
}
function calculateRotationRequired (currentAngle: number, desiredAngle: number) {
    return modulo(desiredAngle - currentAngle + 180, 360) - 180
}
let mode = ""
let moveUntilTime = 0
let carMoving = 0
let controllerMoving = 0
radio.setGroup(1)
radio.setTransmitPower(7)
controllerMoving = 0
carMoving = 0
moveUntilTime = 0
changeMode("ready")
loops.everyInterval(100, function () {
    doControllerThings()
    if (mode == "car") {
        doCarThings()
    }
})
