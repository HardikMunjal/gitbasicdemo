import { Vue, Component, Watch } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import APP_CONST from '@/constants/AppConst';
import APP_UTILITIES from '@/utilities/commonFunctions';
import { getUserDetailsResponseObj, selectStar } from "@/services/userService/users-api";
import programListStore from "@/store/modules/programList";


@Component({
    components:{
    }
})
export default class ProgramList extends Vue{
    private objScreenText: ScreenText = new ScreenText();
    public selectedProgramIndex:number = 0;
    public hoverStyleObj:any = {};
    public hover:boolean = false;
    public hoverText:string = '';
    public hoverLabel:string = '';
    public currentRoleId:number=0;
    public localConstant=APP_CONST
    programId: number = 0;
    public filteredByStar: boolean = false;
    routeToNavigate = ['/', '/', '/', 'Partner Home', 'HomeProgAdmin', 'HomeSiteAdmin', 'HomeStaff'];

    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }

    get programsList() {
        return programListStore.programAndSiteList;
    }

    get drilledProgram() {
        return programListStore.drilledProgram;
    }

    get showEmptyState(){
        return programListStore.showEmptyState;
    }

    @Watch('$route', {immediate: true, deep: true})
    detechChangeInRoute(route:any) {
        /* istanbul ignore else */
        if(route.path !== '/partnerhome') {
            this.selectedProgramIndex = -1;
        }
    }


    async getProgramsList() {
        let storedAccountId:any = APP_UTILITIES.getCookie('user_role');
        let {id} = APP_UTILITIES.coreids();
        const payload = APP_CONST.ACCOUNT_ADMIN_PROGRAMS_LIST;
        payload.id = JSON.parse(storedAccountId)[0].accountId;
        payload.userId = id;

        programListStore.updateProgramAndSiteList(payload).then((response:any)=> {
            const progId = response.programsList.length ? response.programsList[0].programId: 0;
            this.selectedProgramIndex = !this.selectedProgramIndex ? progId : this.selectedProgramIndex;
            this.checkProgramsAndSitesStar();
        });   
    }

    sortByProgramName() {
        this.filteredByStar = false;
        /* istanbul ignore else */
        if(this.programsList){
            this.programsList.sort(this.sortByProperty('programName', 'asc'));
            this.programsList.forEach((program:any) => {
                /* istanbul ignore else */
                if(program.siteStarInfos.length){
                    return program.siteStarInfos.sort(this.sortByProperty('siteName', 'asc'))
                }
            });
        }  
        /* istanbul ignore else */
        if(this.drilledProgram && this.drilledProgram.siteStarInfos.length){
            this.drilledProgram.siteStarInfos.sort(this.sortByProperty('siteName', 'asc'))
        }   
    }

    sortDrilledByStar() {
        /* istanbul ignore else */
            if(this.drilledProgram && this.drilledProgram.siteStarInfos.length){
                this.filteredByStar = true;
                this.drilledProgram.siteStarInfos.sort(this.sortByProperty('siteName', 'asc'))
                this.drilledProgram.siteStarInfos.sort(this.sortByProperty('isStar', 'desc'))
            }
        }

    sortByStar(programId:number, siteId:number) {   
        /* istanbul ignore else */
        if(this.programsList){
            this.filteredByStar = true;
            this.programsList.sort(this.sortByProperty('programName', 'asc'))
            this.programsList.sort(this.sortByProperty('isStar', 'desc'));
            this.programsList.forEach((program:any) => {
                /* istanbul ignore else */
                if(program.siteStarInfos.length){
                    program.siteStarInfos.sort(this.sortByProperty('siteName', 'asc'))
                }
            }); 
            this.programsList.forEach((program:any) => {
                /* istanbul ignore else */
                if(program.siteStarInfos.length){
                    program.siteStarInfos.sort(this.sortByProperty('isStar', 'desc'))
                }
            });
        }
        this.sortDrilledByStar();
        /* istanbul ignore else */
        if(programId) {
            let {id} = APP_UTILITIES.coreids();
            let payload = {
                siteId: siteId,
                programId: programId,
                userId: id
            };

            selectStar(payload).then(() => {
                this.getProgramsList();
              });  
        }
    }

    toggleProgramTab(index:number){
        /* istanbul ignore else */
        if(this.selectedProgramIndex == index) {
            this.selectedProgramIndex = -1;
        } else {
            this.selectedProgramIndex = index;
        }
        if(this.programsList.length && this.programsList[this.programsList.length-1].programId == index) {
            setTimeout(()=>{
                let elem:any = document.getElementById(`accordion-container`);
                elem.scrollTop+= 50;
            },100)
        }  
    }

    sortByProperty(property: any, order:string) {
        return function (a: any, b: any) {
            if(order === APP_CONST.ORDER_ASC_TEXT) {
                if (String(a[property]).toLowerCase() > String(b[property]).toLowerCase())
                    return 1;
                else if (String(a[property]).toLowerCase() < String(b[property]).toLowerCase())
                    return -1;
            } else {
                if (String(a[property]).toLowerCase() < String(b[property]).toLowerCase())
                    return 1;
                else if (String(a[property]).toLowerCase() > String(b[property]).toLowerCase())
                    return -1;
            }            

            return 0;
        }
    }

    navigateToRole(progId:number, siteId?: number) {
        const role = APP_UTILITIES.getCookie("user_role");
        const parsedRole = role && JSON.parse(role);
        const [roleTomodify] = parsedRole;
        const superDrill =  APP_UTILITIES.getCookie('super_user_drilldown');
        if(Boolean(superDrill)) {
            roleTomodify.roleId = (siteId && APP_CONST.ROLE_TYPE_SITE_ADMIN) || APP_CONST.ROLE_TYPE_PROGRAM_ADMIN;
            roleTomodify.programId = progId;
            roleTomodify.siteId = siteId || 0;
            APP_UTILITIES.setCookie("user_role", JSON.stringify([roleTomodify]), 1);
            APP_UTILITIES.setCookie("programId", JSON.stringify(roleTomodify.programId), 1);
            APP_UTILITIES.setCookie("siteId", JSON.stringify(roleTomodify.siteId), 1);
            this.getProgramsList();
            if(this.$route.path !== '/home') {
                this.$router.replace({name: `${this.routeToNavigate[roleTomodify.roleId-1]}`});
               } else {
                    this.$emit('loadNav');
               }
            return
        }
        const userId = APP_UTILITIES.getCookie(APP_CONST.USER_ID);
        const parsedUser = Number(userId);
        /* istanbul ignore else */
        if(!parsedUser) {
            return
        }
        /* istanbul ignore next */
        getUserDetailsResponseObj(parsedUser).then((response) => {
            if(response.status === APP_CONST.RESPONSE_200) {
                const userDt = response.data;
                let roleToAdd = userDt.userRoles.find((role: {id:number, roleId:number, accountId:number, programId: number,siteId: number}) =>{
                        return (role.programId === progId && (siteId ? role.siteId === siteId : true));
                });
                if(!roleToAdd) {
                    roleToAdd = userDt.userRoles.find((role: {id:number, roleId:number, accountId:number, programId: number,siteId: number}) =>{
                        return (role.programId === progId);
                });
                }
                if(!roleToAdd) {
                    roleToAdd = userDt.userRoles.find((role: {id:number, roleId:number, accountId:number, programId: number,siteId: number}) =>{
                        return (role.accountId == roleTomodify.accountId);
                });
                }
                roleTomodify.roleId = roleToAdd && roleToAdd.roleId;
                roleTomodify.programId = (roleToAdd && roleToAdd.programId) || (progId || 0);
                roleTomodify.siteId = (roleToAdd && roleToAdd.siteId) || (siteId || 0);
                if(roleTomodify.programId && roleToAdd.roleId === 4) {
                    roleTomodify.roleId = 5;
                }
                if (roleTomodify.siteId && (roleToAdd.roleId === 4 || roleToAdd.roleId === 5)) {
                    roleTomodify.roleId = 6;
                }
                APP_UTILITIES.setCookie("user_role", JSON.stringify([roleTomodify]), 1);
                APP_UTILITIES.setCookie("programId", JSON.stringify(roleTomodify.programId), 1);
                APP_UTILITIES.setCookie("siteId", JSON.stringify(roleTomodify.siteId), 1);
               this.getProgramsList();
               if(this.$route.path !== '/home') {
                this.$router.replace({name: `${this.routeToNavigate[roleTomodify.roleId-1]}`});
               } else {
                    this.$emit('loadNav');
               }
            } 
        });
    }

    showTooltip(val : string, $event: any, id:string, isMobileView: string){
        this.hover = true;
        this.hoverText = val;
        this.hoverLabel = id;
        const boundBox = $event && $event.target.getBoundingClientRect();
        const coordX = boundBox.left;
        const coordY = boundBox.top;
        this.hoverStyleObj = {
            top:(coordY + 40).toString() + "px",
            left:(coordX + 50).toString() + "px",
            width: "fit-content;",
            'text-transform': 'none'
        }
    }

    hideTooltip(){
        this.hover = false;
        this.hoverText = '';
        this.hoverLabel = '';
        this.hoverStyleObj= {};
    }

    checkProgramsAndSitesStar() {
            for(const program of this.programsList) {
                /* istanbul ignore else */
                if(program.isStar){
                    this.filteredByStar = true;   
                    break;            
                }
            }
        }

    mounted(){
        this.getProgramsList();
        const {roleId, programId} = APP_UTILITIES.coreids();
        this.currentRoleId = roleId;
        this.programId = programId;
    }
}