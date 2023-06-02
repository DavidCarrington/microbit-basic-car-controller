/**
 * Based on receiving a direction, we need to decide to turn.
 * 
 * The direction we turn also depends on whether we're going forwards of backwards
 * 
 * We need to handle 0 and 359... without making the car turn 360 degrees when it only needs to turn 1.
 * 
 * We should probably do rounding, to avoid the car wiggling around
 */
function sendDirection () {
    radio.sendNumber(input.compassHeading())
}
radio.onReceivedNumber(function (receivedNumber) {
    serial.writeValue("controllerDirection", receivedNumber)
    serial.writeValue("carDirection", input.compassHeading())
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
        } else if (mode == "") {
            basic.showIcon(IconNames.Heart)
        } else {
            basic.clearScreen()
        }
    }
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
loops.everyInterval(100, function () {
    doControllerThings()
    if (mode == "car") {
        doCarThings()
    }
})
