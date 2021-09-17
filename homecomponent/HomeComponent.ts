import { Vue, Component, Watch } from 'vue-property-decorator';
import { ScreenText } from '@/lang/ScreenText';
import API_CONST from '@/constants/ApiConst';
import APP_CONST from '@/constants/AppConst';
import APP_UTILITIES from "@/utilities/commonFunctions";
import commonEntry from '@/store/modules/commonEntry';

//my changes


//my changes 22

@Component
export default class HomeComponent extends Vue {
    private objScreenText: ScreenText = new ScreenText();
    public url = API_CONST.THOUGHTINDUSTRYURL;
    public label_text = ["Dashboard", 'Scholar Management - Recruitment, Enrollment and Attendance']
    public navigatePlannerPage: boolean = false;
  
    public getScreenText(key: string): string {
        return this.objScreenText.getScreenText(key);
    }

    get getUserDetail() {
        return commonEntry.userDetail;
    }

    get getLmsInfo() {
        return commonEntry.LMSLinks;
    }

    beforeMount() {
        let user_id = APP_UTILITIES.getCookie(APP_CONST.USER_ID);
        /* istanbul ignore else */
        if (user_id) {
            commonEntry.fetchUserDetails(parseInt(user_id))
        }
        this.getLmsLinks();
    }

    @Watch('getUserDetail', { deep: true })
    checkForRole(data: any) {
        const userRole = data.userRoles[0].roleId;
        /* istanbul ignore else */
        if (userRole > APP_CONST.THREE) {
            this.navigatePlannerPage = true;
        }
    }

    public navigateToPlannerPage() {
        this.$router.push('programplan');
    }

    private getLmsLinks() {
        commonEntry.getLMSInfo()
    }
}