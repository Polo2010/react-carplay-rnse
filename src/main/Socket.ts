import { ExtraConfig } from "./Globals";
import { Server } from 'socket.io'
import { EventEmitter } from 'events'
import { Stream } from "socketmost/dist/modules/Messages";
import { debounce } from 'lodash'

export enum MessageNames {
  Connection = 'connection',
  GetSettings = 'getSettings',
  SaveSettings = 'saveSettings',
  Stream = 'stream'
}

export class Socket extends EventEmitter {
  config: ExtraConfig
  io: Server
  saveSettings: (settings: ExtraConfig) => void
  constructor(config: ExtraConfig, saveSettings: (settings: ExtraConfig) => void) {
    super()
    this.config = config
    this.saveSettings = saveSettings
    this.io = new Server({
      cors: {
        origin: '*'
      }
    })

    this.io.on(MessageNames.Connection, (socket) => {
      this.sendSettings()

      socket.on(MessageNames.GetSettings, () => {
        this.sendSettings()
      })

      socket.on(MessageNames.SaveSettings, (settings: ExtraConfig) => {
        this.saveSettings(settings)
      })

      socket.on(MessageNames.Stream, (stream: Stream) => {
        this.emit(MessageNames.Stream, stream)
      })
    })

    this.io.listen(4000)
  }

  sendSettings() {
    this.io.emit('settings', this.config)
  }

  sendReverse(reverse: boolean) {
    this.io.emit('reverse', reverse)
  }

  sendLights(lights: boolean) {
    this.io.emit('lights', lights)
  }


  sendHeadUnitkey = debounce(async (key) => {
    this.emit('headunitkey', key)
    console.log('headunitkey event emitted: '+key)
    console.log(`Event Names io: ${this.io.eventNames()}`)
    console.log(`Event Names Socket: ${this.eventNames()}`)
  }, 150, {'leading': true,'trailing': false})
  
}
