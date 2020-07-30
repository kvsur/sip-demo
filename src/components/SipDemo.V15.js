import { Vue, Component, Ref } from 'vue-property-decorator';

import { BButton, BModal } from 'bootstrap-vue';

import './SipDemo.less';

const uri = 'sip:3911@www.onmymemory.com:9070'
const invitor = 'sip:7777@www.onmymemory.com:9070'

@Component({
  components: { BButton, BModal }
})
class SipDemo extends Vue {
  userAgent = null;
  userSession = null;
  registerer = null;

  @Ref('remoteAudio') remoteAudio;

  async closeConnect() {
    this.userAgent.stop();
  }
  async buildConnect() {
    const userAgent = new SIP.UA({
      uri,
      transportOptions: {
        wsServers: ['wss://www.onmymemory.com:7443'],
        traceSip: true,
      },
      authorizationUser: '3911',
      password: '3911',
    });

    userAgent.on('connected', res => {
      console.log('connected......', res)
    })
    
    userAgent.on('registered', (res, cas) => {
      console.warn('registered......', res);
      this.userAgent = userAgent
    });

    // userAgent.start();

    return Promise.resolve();
  }

  call() {
    const session = this.userAgent.invite(invitor, {
      alwaysAcquireMediaFirst: true,
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false
        }
      }
    })

    session.on('accepted', res=> {
      console.warn('accepted......', res);
      this.userSession = session;

      console.log(this.userSession)

      const connection = this.userSession.sessionDescriptionHandler.peerConnection;

      const remoteMediaStream = new MediaStream();
      connection.getReceivers().forEach(receiver => {
        remoteMediaStream.addTrack(receiver.track);
      });

      this.remoteAudio.srcObject = remoteMediaStream;
      this.remoteAudio.volume = 1;
      this.remoteAudio.play();
    });
    session.on('bye', res=> {
      console.warn('bye......', res);
    });
    session.on('failed', res=> {
      console.warn('failed......', res);
    });
    session.on('terminated', res=> {
      console.warn('terminated......', res);
    });
    session.on('rejected', res=> {
      console.warn('rejected......', res);
    });
    this.userSession = session;

    console.log(session)
  }

  hangup() {
    this.userSession.bye();
  }

  hold() {
    this.userSession.hold();
  }
  unhold() {
    this.userSession.unhold();
  }
  render(h) {
    return (
      <div class="sip-demo-component-container">

        <BButton variant="primary" size="sm" onClick={this.buildConnect}>建立连接</BButton>
        <BButton variant="primary" size="sm" onClick={this.closeConnect}>断开连接</BButton>
        <BButton variant="primary" size="sm" onClick={this.call}>开始通话</BButton>
        <BButton variant="primary" size="sm" onClick={this.hangup}>挂断</BButton>
        <BButton variant="primary" size="sm" onClick={this.hold}>挂起</BButton>
        <BButton variant="primary" size="sm" onClick={this.unhold}>继续</BButton>
        {/* <BModal id="sip-demo-bv-modal">
          <div>hello world</div>
        </BModal> */}
        <audio ref="remoteAudio" class="hide-audio" controls src="" />
      </div>
    );
  }
}

export default SipDemo;
