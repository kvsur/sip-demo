import { Vue, Component, Ref } from 'vue-property-decorator';

import { BButton, BModal } from 'bootstrap-vue';
import { UserAgent, Inviter, Registerer } from 'sip.js'

import './SipDemo.less';

const uri = UserAgent.makeURI('sip:3922@www.onmymemory.com:9070');
const invitor = UserAgent.makeURI('sip:7777@www.onmymemory.com:9070')

@Component({
  components: { BButton, BModal }
})
class SipDemo extends Vue {
  userAgent = null;
  userSession = null;
  registerer = null;

  @Ref('remoteAudio') remoteAudio;

  async buildConnect() {
    const userAgent = new UserAgent({
      uri,
      transportOptions: {
        wsServers: ['wss://www.onmymemory.com:7443'],
        traceSip: true,
      },
      authorizationUsername: '3922',
      authorizationPassword: '3922',
      delegate: {
        onConnect: () => {
          this.userAgent = userAgent;
          console.warn('Connected.......', this.userAgent)

          const registerer = new Registerer(this.userAgent);
          registerer.register().then(res => {
            this.registerer = registerer;
            console.warn('Register successed......', this.registerer)
          })
        }
      }
    });

    userAgent.start();

    return Promise.resolve();
  }

  call() {
    if (this.registerer && this.registerer.register) {
      const session = new Inviter(this.userAgent, invitor, {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false
          }
        }
      });

      session.invite({
        requestDelegate: {
          onAccept: res => {
            console.warn('Call accepted......', res, session);
            this.userSession = session;
          },
          onReject: res => {
            console.warn('Call rejected......', res.message.toString())
          }
        },
      }).then(res => {
        console.warn('invited.......',res)
      })
    }
  }

  hangup() {
    this.userSession.bye();
  }
  render(h) {
    return (
      <div class="sip-demo-component-container">

        <BButton variant="primary" size="sm" onClick={this.buildConnect}>建立连接</BButton>
        <BButton variant="primary" size="sm" onClick={this.call}>开始通话</BButton>
        <BButton variant="primary" size="sm" onClick={this.hangup}>挂断</BButton>
        {/* <BButton variant="primary" size="sm" onClick={this.hold}>挂起</BButton> */}
        {/* <BModal id="sip-demo-bv-modal">
          <div>hello world</div>
        </BModal> */}
        <audio ref="remoteAudio" class="hide-audio" controls src="" />
      </div>
    );
  }
}

export default SipDemo;
