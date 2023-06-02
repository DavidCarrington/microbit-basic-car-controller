function stop () {
    pins.analogWritePin(AnalogPin.P0, 0)
    pins.analogWritePin(AnalogPin.P1, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.digitalWritePin(DigitalPin.P3, 0)
}
input.onButtonPressed(Button.A, function () {
    radio.sendString("forward")
})
function drive (bForwards: boolean, iDuration: number, iSpeed: number) {
    if (bForwards) {
        pins.analogWritePin(AnalogPin.P0, iSpeed)
        pins.analogWritePin(AnalogPin.P1, 0)
    } else {
        pins.analogWritePin(AnalogPin.P1, iSpeed)
        pins.analogWritePin(AnalogPin.P0, 0)
    }
    basic.pause(iDuration)
    stop()
}
radio.onReceivedString(function (receivedString) {
    if (receivedString == "forward") {
        drive(true, defaultMoveDurationMs, defaultSpeed)
    } else if (receivedString == "backward") {
        drive(false, defaultMoveDurationMs, defaultSpeed)
    } else if (receivedString == "left") {
        doTurn(true, defaultMoveDurationMs, true, defaultSpeed)
    } else if (receivedString == "stop") {
        stop()
    } else {
        stop()
    }
})
input.onButtonPressed(Button.B, function () {
    radio.sendString("backward")
})
function doTurn (bLeft: boolean, iDuration: number, bForwards: boolean, iSpeed: number) {
    if (bLeft) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        pins.digitalWritePin(DigitalPin.P3, 0)
    } else {
        pins.digitalWritePin(DigitalPin.P2, 0)
        pins.digitalWritePin(DigitalPin.P3, 1)
    }
    drive(bForwards, iDuration, iSpeed)
}
let defaultSpeed = 0
let defaultMoveDurationMs = 0
radio.setGroup(1)
radio.setTransmitPower(7)
defaultMoveDurationMs = 1000
defaultSpeed = 500
