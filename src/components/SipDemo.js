import { Vue, Component, Ref } from 'vue-property-decorator';

import { BButton, BModal } from 'bootstrap-vue';
import { Web, URI } from 'sip.js'

const { SimpleUser } = Web;

import './SipDemo.less';

// const uri = new URI('sip:3933@www.onmymemory.com:9070');
const uri = new URI('sip', '3933','www.onmymemory.com',9070);

@Component({
  components: { BButton, BModal }
})
class SipDemo extends Vue {

  userAgent = null;
  userSession = null;
  registerer = null;

  @Ref('remoteAudio') remoteAudio;

  async initAgent() {
    console.log(1);
    const userAgent = new SimpleUser('wss://www.onmymemory.com:7443', {
      aor: uri,
      delegate: {
        onCallAnswered: (res) => {
          console.warn('onCallAnswered', res);
          console.log(userAgent.remoteMediaStream)
        },
        onCallReceived: (res) => {
          console.warn('onCallReceived', res)
        },
        onCallCreated: (res) => {
          console.warn('onCallCreated', res)
        },
        onRegistered: (res) => {
          console.warn('onRegistered', res)
        },
        onServerConnect: (res) => {
          console.warn('onServerConnect', res)
        },
      },
      media: {
        constraints: {
          audio: true,
          vedio: false,
        },
        remote: {
          audio: this.remoteAudio
        }
      },
      userAgentOptions: {
        authorizationUsername: '3933',
        authorizationPassword: '3933',
        uri,
        transportOptions: {
          server: 'wss://www.onmymemory.com:7443'
        }
      }
    });

    userAgent.connect().then(mes => {
      console.warn('connected...', mes, userAgent);
      this.userAgent = userAgent;

      userAgent.register().then(res => {
        console.warn('registed.......', res);
        
      })
    })

    return Promise.resolve();
  }

  async buildConnect() {
    await this.initAgent();
  }
  async call() {
    this.userAgent.call('sip:7777@www.onmymemory.com:9070').then(res => {
      console.warn('call success.......', res);

      // const ms = new MediaStream();
      // this.userAgent.session._sessionDescriptionHandler._peerConnection.getReceivers().forEach(rcv => {
      //   ms.addTrack(rcv.track)
      // });

      // this.remoteAudio.srcObject = ms;
      // // this.remoteAudio.volume = 1;


      // this.remoteAudio.play();
      // console.log(this.userAgent.isMuted())
      // this.userAgent.unmute();
    }).catch(err => {
      console.error('call faild.......', err)
    })
  }
  hangup() {
    this.userAgent.hangup();
  }
  hold() {
    this.userAgent.hold();
  }
  unhold() {
    this.userAgent.unhold();
  }
  render(h) {
    return (
      <div class="sip-demo-component-container">

        <BButton variant="primary" size="sm" onClick={this.buildConnect}>建立连接</BButton>
        <BButton variant="primary" size="sm" onClick={this.call}>开始通话</BButton>
        <BButton variant="primary" size="sm" onClick={this.hangup}>挂断</BButton>
        <BButton variant="primary" size="sm" onClick={this.hold}>挂起</BButton>
        <BButton variant="primary" size="sm" onClick={this.unhold}>恢复</BButton>
        {/* <BModal id="sip-demo-bv-modal">
          <div>hello world</div>
        </BModal> */}
        <audio ref="remoteAudio" class="hide-audio" controls src="" />
      </div>
    );
  }
}

export default SipDemo;
