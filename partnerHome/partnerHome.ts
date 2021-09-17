import { Vue, Component, Prop } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import {fetchLMSUrl} from "@/services/dashboard/dashboardService";
import ProgramList from '@/components/partnerHome/components/programList/ProgramList.vue';
@Component({
    components:{
        'program-list': ProgramList
    }
})
//partnerrrr
export default class PartnerHome extends Vue{
    //in partnereee
    private objScreenText: ScreenText = new ScreenText();
    public programsDetail:Array<Object> = [];
    public emptyView: boolean = false;
    public programId:number=0
    public accountId:number=0;
    public styleObj:any = {};
    public hoverText:string = '';
    public proLearningId : number = 1;
    

    @Prop()
    userDetails!: any;

    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }

    public navigateProLerningUrl() {
        var newWindow: any = window.open();
        /* istanbul ignore else */
        if (this.proLearningId) {
            fetchLMSUrl(this.proLearningId).then((res) => {
                /* istanbul ignore else */
                if (res.status === 200) {
                    /* istanbul ignore if */
                    if (navigator.userAgent.indexOf("Safari") != -1) {
                        newWindow.location = res.data;
                    } else {
                        window.open(res.data, '_blank');
                    }
                }
            })
        }
    }
    showTooltip(val : string, $event: any){
        this.hoverText = val;
        const boundBox = $event && $event.target.getBoundingClientRect();
        const coordX = boundBox.left;
        const coordY = boundBox.top;
        this.styleObj = {
            top:(coordY + 50).toString() + "px",
            left:(coordX + 70).toString() + "px",
            width: "fit-content;"
        }
    }

    hideTooltip(){
        this.hoverText = '';
        this.styleObj= {};
    }

    
}
