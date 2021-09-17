import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import 'vue-cal/dist/vuecal.css';
import VueCal from 'vue-cal';
import APP_CONST from '@/constants/AppConst';
import { getSiteByProgramId } from "@/services/create-user/createUserService";
import { FetchConfigProgByIdResponse } from '@/services/userService/users-api';
import APP_UTILITIES from '@/utilities/commonFunctions';

@Component({
    components: {
        'vue-calendar': VueCal
    }
})
export default class PrintComponent extends Vue {
    @Prop() tasksShow!: any;
    @Prop() eventsShow!: any;
    @Prop() calendarViewEvents!: string;
    @Prop() calendarViewTasks!: string;
    @Prop() resetTKFilter!: boolean;
    @Prop() resetEvntFilter!: boolean;
    @Prop() currentMonthName!: string;
    @Prop() currentYearNumber!: number;
    @Prop() weekStart!:any;

    public monthname: string = this.currentMonthName;
    public yearNumber: number = this.currentYearNumber;
    public userRoles:any = [];
    public siteName:string = '';
    public programName:string = '';


   @Watch('calendarViewTasks',{deep:true})
   changeDetect(val:any){
        let d = new Date();
        let monthNameIndex = 0;
        APP_CONST.GET_MONTHS.forEach((newMonth:any) => {
            if(this.currentMonthName === newMonth.monthName){
                monthNameIndex = newMonth.index;
            }
        })
        d.setMonth(this.weekStart.getMonth()==monthNameIndex ?monthNameIndex: this.weekStart.getMonth());
        d.setFullYear(this.currentYearNumber)
        if((val=='week' || val=='month') && this.resetTKFilter){
            d.setDate(this.weekStart.getDate());
            let newRef = this.$refs.valcaltasks1 as any ;
            newRef && newRef.switchView(val, new Date(d));
        } 

        if(val=='month'){
            let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
            const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
            removeElements(elements);
        }   

   }

   @Watch('calendarViewEvents',{deep:true})
   changeDetectEvents(val:any){
    this.changeDetectEventsFunc(val)
   }

   changeDetectEventsFunc(val:any){
    let d = new Date();
    let monthNameIndex = 0;
    monthNameIndex = this.GetMonthNameIndex(monthNameIndex);
    if(this.weekStart){
        d.setMonth(this.weekStart.getMonth()==monthNameIndex ?monthNameIndex: this.weekStart.getMonth());
    }
    d.setFullYear(this.currentYearNumber)
    if((val=='week'|| val=='month') && this.resetEvntFilter){
        d.setDate(this.weekStart.getDate());
        let newRef = this.$refs.valcalevents1 as any ;
        newRef && newRef.switchView(val, new Date(d));
    } 
    if(val=='month'){        
        let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
        const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
        removeElements(elements);
    }
   }

    private GetMonthNameIndex(monthNameIndex: number) {
        APP_CONST.GET_MONTHS.forEach((newMonth: any) => {
            if (this.currentMonthName === newMonth.monthName) {
                monthNameIndex = newMonth.index;
            }
        });
        return monthNameIndex;
    }

   @Watch('resetTKFilter',{deep:true})
   changeTaskTab(val:any){
        this.changeTaskTabFunc(val);
   }

   changeTaskTabFunc(val:any){
    if(val == true){
        if(this.calendarViewTasks === 'month'){
            setTimeout(() => {
            let d = new Date();
            let monthNameIndex = 0;
            APP_CONST.GET_MONTHS.forEach((newMonth:any) => {
                if(this.currentMonthName === newMonth.monthName){
                    monthNameIndex = newMonth.index;
                }
            })
            d.setMonth(this.weekStart.getMonth()==monthNameIndex ?monthNameIndex: this.weekStart.getMonth());
            d.setFullYear(this.currentYearNumber)

                d.setDate(this.weekStart.getDate());
                let newRef = this.$refs.valcaltasks1 as any ;
                newRef && newRef.switchView('month', new Date(d));
         
            
                let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
                const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
                removeElements(elements);
            },100)
        }
    }
   }

   @Watch('resetEvntFilter',{deep:true})
   changeEventTab(val:any){
    if(val == true){
        let newRef = this.$refs.valcalevents1 as any ;
        newRef && newRef.switchView('month', new Date());
        setTimeout(() => {
            let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
            const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
            removeElements(elements);
        },100)
    }
   }

   @Watch('weekStart',{deep:true})
   changeWeekDate(val:any){
        this.changeWeekDateFunc(val) 
   }

   changeWeekDateFunc(val:any){
    let d = new Date();
    let monthNameIndex = 0;
    APP_CONST.GET_MONTHS.forEach((newMonth:any) => {
        if(this.currentMonthName === newMonth.monthName){
            monthNameIndex = newMonth.index;
        }
    })
    d.setDate(val.getDate());
    d.setMonth(val.getMonth()==monthNameIndex?monthNameIndex :val.getMonth());
    d.setFullYear(this.currentYearNumber)
    let newRef = this.resetTKFilter && this.$refs.valcaltasks1 as any ;
    if(this.resetEvntFilter && this.calendarViewEvents == 'week'){
        newRef = this.$refs.valcalevents1 as any ;
        newRef && newRef.switchView('week', new Date(d));
    }
    else if(this.resetEvntFilter && this.calendarViewEvents == 'month'){
        newRef = this.$refs.valcalevents1 as any ;
        newRef && newRef.switchView('month', new Date(d));
    }
    else if(this.resetTKFilter && this.calendarViewTasks == 'week'){
        newRef && newRef.switchView('week', new Date(d));
    }
    else if(this.resetTKFilter && this.calendarViewTasks == 'month'){
        newRef && newRef.switchView('month', new Date(d));
    }
    
    let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
    const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
    removeElements(elements);
    let div = document.createElement('div');
    div.className = 'customDivRowDatesPrint';
    let stringDivToAdd = '';
    let dates:any = [];
    let  begindate = val;
    let  beginDat:any = begindate.getDate();
    let  beginMon:any = begindate.getMonth();
    let  beginYear:any = begindate.getFullYear();
    for(let i =0;i<=6;i++){
        dates.push(new Date(beginYear, beginMon, beginDat+i))
    }
    for(let i =0;i<=6;i++){
        let dateFind = new Date(dates[i]).getDate();
        let todayDate = new Date().getDate();
        let stringToAdd = todayDate === dateFind ? `<span class="today-date-print">${dateFind}<span>`:`${dateFind}`;
        stringDivToAdd+=`<div class="item${i}">${stringToAdd}</div>`
    }
    div.innerHTML = `<div class="grid-container">${stringDivToAdd}</div>`;
    let ele:any = document.querySelectorAll('#cardContainerCal .vuecal__flex .vuecal__body');

    let calendarSequence =0;
    if(typeof(calendarSequence)=='number'&&ele[calendarSequence]){
        ele[calendarSequence].parentNode && ele[calendarSequence].parentNode.insertBefore(div, ele[calendarSequence]);
    }
   }

   @Watch('currentMonthName',{deep:true})
   changeMonthDetect(val:any){
    if(this.resetTKFilter){
        if(this.calendarViewTasks =='month'){
            let d = new Date();
            let monthNameIndex = 0;
            monthNameIndex = this.GetMonthNameIndex(monthNameIndex);
            d.setMonth(monthNameIndex);
            d.setFullYear(this.currentYearNumber)
            let newRef = this.$refs.valcaltasks1 as any ;
            newRef && newRef.switchView('month', new Date(d));
            let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
            const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
            removeElements(elements);
        }
    }
    this.changeDetectMonthFunc(val)
   }

   changeDetectMonthFunc(val:any){
    if(this.resetEvntFilter){
        if(this.calendarViewEvents  == 'month'){
            let d = new Date();
            let monthNameIndex = 0;
            monthNameIndex = this.GetMonthNameIndex(monthNameIndex);
            d.setMonth(monthNameIndex);
            d.setFullYear(this.currentYearNumber)
            let newRef = this.$refs.valcalevents1 as any ;
            newRef && newRef.switchView('month', new Date(d));
            let elements:any = document.querySelectorAll('.customDivRowDatesPrint');
            const removeElements = (elms:any) => {elms.forEach((element:any) => element.remove())};
            removeElements(elements);
        }
    }
   }

    public logEvents(type: string, event: any, calendarSequence: number){
    // This is intentional
    }

    public logTasks(type:string,event:any,calendarSequence:number){
    // This is intentional
    }

    getSite(programId: number){
        getSiteByProgramId(programId).then((res:any) => {
            if(res.status === APP_CONST.RESPONSE_200){
              const data = res.data;
              if(data){
                this.siteName = data[APP_CONST.ZERO].siteName;
              }
            }
        })
    }

    mounted(){
        let userRoles: any = APP_UTILITIES.getCookie("user_role");
        this.userRoles = JSON.parse(userRoles);
        let programId = this.userRoles[APP_CONST.ZERO].programId;
        if(FetchConfigProgByIdResponse){
            FetchConfigProgByIdResponse(programId).then((res:any) => {
                if(res.status === APP_CONST.RESPONSE_200){
                this.programName = res.data.programName;   
                programId && this.getSite(programId);
                }
            })
        }
        
    }
}