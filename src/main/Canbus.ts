// import {Message} from "*can.node";
import * as can from "socketcan";
import EventEmitter from 'events'
import { CanConfig } from "./Globals";
import { Socket } from "./Socket";

type CanMask = {
  id: number,
  mask: number,
  invert: boolean
}


export class Canbus extends EventEmitter {
  channel: can.channel
  canChannel: string
  subscriptions: CanConfig
  masks: CanMask[]
  reverse: boolean
  lights: boolean
  socket: Socket
  constructor(canChannel: string, socket: Socket, subscriptions: CanConfig = {}) {
    super();
    this.canChannel = canChannel
    this.subscriptions = subscriptions
    this.channel = can.createRawChannel(this.canChannel)
    this.masks = []
    this.reverse = false
    this.lights = false
    this.socket = socket
    Object.keys(this.subscriptions).forEach((sub) => {
      this.masks.push({id: this.subscriptions[sub].canId, mask: this.subscriptions[sub].mask, invert: false})
    })
    this.channel.setRxFilters(this.masks)

    this.channel.addListener("onMessage", (msg) => {
      let data
      console.log('Canbus message received:')
      console.log(msg)
      
      switch (msg.id) {
        case this.subscriptions?.headunit?.canId:
          data = msg.data
          let digits = [];
          for(let i=0; i<5; i++){
            digits.push(data[i].toString(16).padStart(2,'0'))
          }
          let keyData = digits.join('.')
          let keyPress
          switch (keyData) {
            case '37.30.01.00.20':
              keyPress = 'right'
              break
            case '37.30.01.00.40':
              keyPress = 'left'
              break
            case '37.30.01.00.10':
              keyPress = 'selectDown'
              break
            case '37.30.01.80.00':
              keyPress = 'down'
              break
            case '37.30.01.40.00':
              keyPress = 'up'
              break
            case '37.30.01.00.01':
              keyPress = 'home'
              break
            case '37.30.01.00.02':
              keyPress = 'back'
              break
            case '37.30.01.02.00':
              keyPress = 'next'
              break
            case '37.30.01.01.00':
              keyPress = 'prev'
              break
          }

          if(keyPress) {
            console.log('Head Unit key press: '+keyPress)
            this.socket.sendHeadUnitKey(keyPress)
          }

          break    

        case this.subscriptions?.reverse?.canId:
          data = msg.data[this.subscriptions!.reverse!.byte] & this.subscriptions!.reverse!.mask
          let tempReverse = this.reverse
          if (data) {
            tempReverse = true
          } else {
            tempReverse = false
          }
          if(tempReverse !== this.reverse) {
            this.socket.sendReverse(this.reverse)
          }
          break

        case this.subscriptions?.lights?.canId:
          let tempLights = this.lights
          data = msg.data[this.subscriptions!.reverse!.byte] & this.subscriptions!.reverse!.mask
          if (data) {
            tempLights = true
          } else {
            tempLights = false
          }
          if(tempLights !== this.lights) {
            this.socket.sendLights(this.lights)
          }
          break
      }
    })

    this.channel.start()

  }
}
