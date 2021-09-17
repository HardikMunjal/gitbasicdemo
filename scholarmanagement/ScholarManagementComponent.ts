import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import UploadFileComponent from './uploadfile/UploadFileComponent.vue';
import MatchColumnsComponent from './matchcolumns/MatchColumnsComponent.vue';
import APP_CONST from '@/constants/AppConst';
import { ScreenText } from '@/lang/ScreenText';
import scholar from '@/store/modules/scholarManager'
import { getModule } from 'vuex-module-decorators';
import { GlobalModule } from '@/store/global/globalModule';
import RepairTableComponent from './repairTable/RepairTableComponent.vue';
import store from '@/store';
import UnresolvedAlertComponent from '@/popupcomponents/unresolvedalertcomponent/UnresolvedAlertComponent.vue';
import { fetchLMSUrl } from "@/services/dashboard/dashboardService";
import APP_UTILITIES from '@/utilities/commonFunctions';
import BouncingPreloaderComponent from '@/commoncomponents/bouncingpreloadercomponent/BouncingPreloaderComponent.vue';
import * as signalR from "@microsoft/signalr";
import API_CONST from '@/constants/ApiConst';

@Component({
    components: {
        'upload-file': UploadFileComponent,
        'match-columns': MatchColumnsComponent,
        'repair-table': RepairTableComponent,
        'error_screen': RepairTableComponent,
        'step5':RepairTableComponent,
        'unresolved-popup': UnresolvedAlertComponent,
        'bouncing-preloader': BouncingPreloaderComponent
    }
})
export default class ScholarManagementComponent extends Vue {
    private objScreenText: ScreenText = new ScreenText();
    getGlobalState = getModule(GlobalModule, store)
    stepper: any[] = JSON.parse(JSON.stringify(APP_CONST.SCHOLAR_STEPPER));
    component = APP_CONST.BLANK;
    public csvDownloadPath : string = '';
    public revisionsObj: any = {};
    stepId: number = 0;
    public linkUrlId :number =APP_CONST.FOUR;    
    isMobileView :boolean = false;
    public showToastMsg:boolean = false;
    public caller:any;
    public count: number = 0;
    public isSignalRProcessing = true;
    public rerender = true;
    private errorScreenDirections =  APP_CONST.ERROR_DIRECTIONS;
    public timer : any;

    @Prop()
    signalRStrip!:{component:string,stripShow:boolean,stripText:string}
    
    @Prop()
    userDetails!: any;

    @Prop()
    roleId!: number


    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }
    isMobile(){
        this.isMobileView =APP_UTILITIES.isMobile()
    } 

    async executeScholarStatus(){
        let site_id = this.userDetails.siteId;
        let response: any= '';
        /* istanbul ignore else */
        if(this.roleId !== APP_CONST.SEVEN){
           response = await scholar.checkScholarStatus(site_id);
        }
        /* istanbul ignore else */
        if (response.status === APP_CONST.RESPONSE_200) {
            let inprogress = response.data.isJobInProgress;
            let errorStep = response.data.step;
            /* istanbul ignore else */
            if (inprogress && errorStep != 4) {
                this.isSignalRProcessing = true;
                this.$emit("showSignalRStripIndicater", { component: '', stripShow: true, stripText: this.getScreenText("SIGNALR_PROGRESS_MSG") })
                this.timer = setTimeout(()=> {
                    this.executeScholarStatus()
                },10000)
            }
            /* istanbul ignore next */
            else if(!inprogress && errorStep == 6) {
                this.isSignalRProcessing = true;
                this.$emit("showSignalRStripIndicater", { component: '', stripShow: false, stripText: '' })
                this.timer = setTimeout(()=> {
                    this.executeScholarStatus()
                },5000)
            }
            else if (errorStep == 4) {
                this.isSignalRProcessing = true;
                const scholarConfig = APP_UTILITIES.getCookie('scholarconfiguring');
                if(scholarConfig && JSON.parse(scholarConfig).delete) {
                    this.timer = setTimeout(()=> {
                        this.executeScholarStatus()
                    },4000)
                }
                this.$emit("showSignalRStripIndicater",{component:'',stripShow:true,stripText:this.getScreenText("SIGNALR_ERROR_ROASTER")})
            } 
            else {
                this.$emit("showSignalRStripIndicater", { component: '', stripShow: false, stripText: '' })
                this.isSignalRProcessing = false;
                if(this.timer){
                    this.rerender = !this.rerender;
                }
            }
        }
    }

    mounted(){
        this.isMobileView =APP_UTILITIES.isMobile()
        window.addEventListener("resize", APP_UTILITIES.debounce(this.isMobile));
        /* istanbul ignore else */
        if(!this.$route.path.includes('new')) {
            this.stepId = 4;
            this.component = 'step5';
            const scholarConfig = APP_UTILITIES.getCookie('scholarconfiguring');
            /* istanbul ignore next */
            if(scholarConfig && (JSON.parse(scholarConfig).process)){
                this.$emit("showSignalRStripIndicater", { component: '', stripShow: true, stripText: this.getScreenText("SIGNALR_PROGRESS_MSG") })
                this.timer = setTimeout(()=> {
                    this.executeScholarStatus()
                },10000)
            } else if(scholarConfig && JSON.parse(scholarConfig).delete) {
                this.timer = setTimeout(()=> {
                    this.executeScholarStatus()
                },5000)
            }else{
                this.executeScholarStatus();
            }
        }
    }


    showDeleteToastMsg(){
        setTimeout(()=>{
            this.showToastMsg =true;
            let isd:any =document.getElementById("toastMsg")
            isd.style.display="block"
        },0)
        setTimeout(()=>{
            this.showToastMsg =true;
            let isd:any =document.getElementById("toastMsg")
            isd.style.display="none"
        },3000)
      
    }

    destroyed () {
        window.removeEventListener("resize", this.isMobile);
        this.$emit("showSignalRStripIndicater", { component: '', stripShow: false, stripText: '' })
        clearTimeout(this.timer);
    }

    get validity() {
        return this.getGlobalState.validity2;
    }

    @Watch('$route', {deep: true, immediate: true})
    refresh() {
        /* istanbul ignore else */ 
        if(this.$route.path === '/roster' || this.$route.path === '/roster/new') {
            this.getProgramSite();
        }
    }
    

    activeStepper(component: string) {
        const index = this.stepper.findIndex((step) => step.component === component);
        /* istanbul ignore else */
        if (index >= 0) {
            this.scrollToTop();
            this.loopThroughStepper(index);
        }
    }

    disableStepper(step: { title: string, component: string, class: string }) {
        /* istanbul ignore else */
        if (step.component !== this.component) {
            const stepId = this.stepper.findIndex((stepper) => stepper.component === step.component);
            this.loopThroughStepper(stepId);
            this.component = step.component;
            this.judgeStepId();
            this.scrollToTop();
        }
    }

    loopThroughStepper(stepId: number) {
        this.stepper.forEach((step, index) => {
            if(stepId === 3) {
                step.class = (index < stepId) ? 'complete-with-disable' : APP_CONST.ACTIVE_CLASS;
            } else {
                if (index < stepId) {
                    step.class = APP_CONST.COMPLETE_CLASS;
                } else if (index === stepId) {
                    step.class = APP_CONST.ACTIVE_CLASS;
                } else {
                    step.class = '';
                }
            }
        });
    }
    shiftScreen(e: string,revisionsObj:any={}) {
        this.activeStepper(e);
        this.component = e;
        this.judgeStepId();
        this.revisionsObj = revisionsObj;
    }

    judgeStepId() {
        if(this.component === 'upload-file') {
            this.stepId = 0;
        }
        if(this.component === 'repair-table') {
            this.stepId = 2;
        }
        if(this.component === 'error_screen') {
            this.stepId = 3;
        }
    }

    scrollToTop() {
        window.scrollTo(APP_CONST.ZERO, APP_CONST.ZERO);
    }

    getProgramSite() {
        const siteId = this.userDetails.siteId;
        /* istanbul ignore else */
        if(siteId) {
            this.$store.dispatch('globalModule/setSiteId', siteId);
            this.getScholarStatus(siteId);
        } else {
            this.component = APP_CONST.UPLOAD_FILE;
        }
    }


    getScholarStatus(siteId: number) {
      if((this.roleId !== APP_CONST.SEVEN) && (this.$route.path === '/roster/new')){
        scholar.checkScholarStatus(siteId).then((response: any) => {
                /* istanbul ignore else */
                if(response.status === APP_CONST.RESPONSE_200) {
                    this.$store.dispatch('globalModule/getRoasterDraftData',response.data)
                    this.setStepper(response)
                } else {
                    this.component = APP_CONST.UPLOAD_FILE;
                }
            }).catch((e) => {
                this.stepId = 4;
                this.component = 'step5';
            })
      }
      else{
          this.component = 'step5';
      }    
    }

    public setStepper(response : any){
        let stepId = response.data.step;
        /* istanbul ignore else */
        if(stepId >=1){
            stepId = stepId -1; 
        }
        this.stepId = stepId;
        if(this.stepId < 3){
            this.component = APP_CONST.SCHOLAR_STEPPER[stepId].component;
        } else {
            this.component = APP_CONST.ERROR_OBJ[0].component;
        }
        
        this.loopThroughStepper(stepId);
    }

    public navigateLMSUrl() {
        fetchLMSUrl(this.linkUrlId).then((res: any) => {
            /* istanbul ignore else */
            if(res.status === APP_CONST.RESPONSE_200) {
                    window.open(res.data,'_blank');
            }
        })
    }

   signalR(obj:any){
       this.$emit('showSignalRStripIndicater',obj)
   }

}