import { Vue, Component } from 'vue-property-decorator';

@Component
class Ellipsis extends Vue {
    render() {
        return <span class='global-ellipsis'/>
    }
}

export default Ellipsis;
